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
    """page to project page."""
    
    sql = f"""
        select id,name from customer
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)
    return render(request, "app/project/index.html",  {'customer_datas': datas})

@login_required
def get_list(request):

    sql = f"""
        select
            a.id
            , a.name
            , a.start_date
            , a.end_date
            , a.station
            , a.status
            , a.customer_id
            , a.seisan
            , a.min_time
            , a.max_time
            , b.name customer_name 
        from
            project a 
        inner join customer b 
        on a.customer_id = b.id
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    datas = list(datas)

    return HttpResponse(to_json(datas), content_type='application/json')

@login_required
def get_project(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # プロジェクト名称
    id = parameters['id']
    datas = []
    sql = f"""
        select
            a.id
            , a.name
            , a.start_date
            , a.end_date
            , a.station
            , a.status
            , a.customer_id
            , a.seisan
            , a.min_time
            , a.max_time
            , b.name customer_name 
        from
            project a 
        inner join customer b 
        on a.customer_id = b.id 
        where
            a.id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (id,))
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

@login_required
def delete(request):

    post_data = json.loads(request.body.decode('utf-8'))
    data = post_data['data']
    sql='DELETE FROM project WHERE ID IN (%s)' 
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
    customer_id = parameters['customer_id']
    # プロジェクト名称
    name = parameters['name']
    #  ID
    id = parameters['id']
    #  ステータス
    status = parameters['status']
    #  精算有無
    seisan = parameters['seisan']
    #  駅
    station = parameters['station']
    #  下限
    min_time = parameters['min_time']
    #  上限
    max_time = parameters['max_time']
    # 開始日
    start_date = parameters['start_date']
    # 終了日
    end_date = parameters['end_date']
    sql = None
    exec_sql = None
    if id is None or id == "":
        sql = f"""
            select id,name,start_date,end_date,station,status,customer_id,seisan,min_time,max_time from project where name = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(sql, (name,))
            datas = dictfetchall(cursor)
            if len(datas) > 0:
                return HttpResponse(to_json({"exists_flag": 1}), content_type='application/json')
        exec_sql = f"""
            INSERT INTO project( 
                name
                , start_date
                , end_date
                , station
                , status
                , customer_id
                , seisan
                , min_time
                , max_time
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
        with connection.cursor() as cursor:
            cursor.execute(exec_sql, (name, start_date, end_date, station, status, customer_id, seisan, min_time, max_time))
    else:
        exec_sql = f"""
            update project set
                name = %s
                , start_date = %s
                , end_date = %s
                , station = %s
                , status = %s
                , customer_id = %s
                , seisan = %s
                , min_time = %s
                , max_time = %s
            where
                id = %s
        """
        with connection.cursor() as cursor:
            cursor.execute(exec_sql, (name, start_date, end_date, station, status, customer_id, seisan, min_time, max_time, id))

    sql = f"""
        select
            a.id
            , a.name
            , a.start_date
            , a.end_date
            , a.station
            , a.status
            , a.customer_id
            , a.seisan
            , a.min_time
            , a.max_time
            , b.name customer_name 
        from
            project a 
        inner join customer b 
        on a.customer_id = b.id 
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

