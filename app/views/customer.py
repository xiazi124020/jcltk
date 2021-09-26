#-*- coding: utf-8 -*
"""view for page transfer."""

import logging
from datetime import datetime
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
import apps.settings as settings
from django.http import HttpResponse
from app.views.base import json_extract, to_json, dictfetchall
from app.util.json import decimal_default_proc, parse_parameters_asjson, parse_post_parameters_asjson
from django.db import connection
import json

logger = logging.getLogger(__name__)

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/customer/index.html")

@login_required
def get_list(request):

    datas = []
    sql = f"""
        select id,name,zip,address,tel_no,partener,email,partener,station,representative from customer
    """
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

@login_required
def get_customer(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # お客様名称
    id = parameters['id']
    datas = []
    sql = f"""
        select id,name,zip,address,tel_no,partener,email,partener,station,representative from customer where id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (customer_name,))
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')


@login_required
def delete(request):

    post_data = json.loads(request.body.decode('utf-8'))
    data = post_data['data']
    sql='DELETE FROM customer WHERE ID IN (%s)' 
    inlist=', '.join(map(lambda x: '%s', data))
    sql = sql % inlist

    with connection.cursor() as cursor:
        cursor.execute(sql, data)

    return HttpResponse(to_json({"success": True}), content_type='application/json')

@login_required
def insert(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # お客様名称
    customer_name = parameters['customer_name']
    # 顧客区分
    partener = parameters['partener']
    #  代表者
    representative = parameters['representative']
    #  電話番号
    tel = parameters['tel']
    #  Email
    email = parameters['email']
    #  駅
    station = parameters['station']
    #  郵便番号
    zip_str = parameters['zip']
    #  住所
    address = parameters['address']
    #  プロジェクト
    project = parameters['project']
    sql = f"""
        select name,zip,address,tel_no,partener,email,partener,station,representative from customer where name = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (customer_name,))
        datas = dictfetchall(cursor)
        if len(datas) > 0:
            return HttpResponse(to_json({"exists_flag": 1}), content_type='application/json')

    sql = f"""
        INSERT INTO customer( 
            name
            , zip
            , address
            , tel_no
            , email
            , partener
            , representative
            , project_id
            , station
            ) 
            VALUES ( 
            %s
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s
            , %s
            )
    """
    if len(project) == 0:
        project = None
    else:
        project = project[0]
    with connection.cursor() as cursor:
        cursor.execute(sql, (customer_name, zip_str, address, tel, email, 1, representative, project, station))

    sql = f"""
        select id,name,zip,address,tel_no,partener,email,partener,station,representative from customer
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

