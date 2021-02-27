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
from app.models.customer import Customer
from app.util.json import decimal_default_proc, parse_parameters_asjson, parse_post_parameters_asjson
from django.db import connection

logger = logging.getLogger(__name__)

def build_post_filters(request, exceptions={}):

    args = parse_parameters_asjson(request)
    filters = None
    if 'name' in args:
        name_list = args['name']
        print("------------------------")
        print(name_list)
        print("------------------------")
        if len(name_list) > 0 and name_list[0] != '':
            if isinstance(name_list, list):
                filters = filters & Q(name_in=name_list)
            else:
                filters = filters & Q(name=name_list)

    return filters

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/customer/index.html")

@login_required
def get_list(request):
    filters = build_post_filters(request)

    datas = Customer.objects.values('name','zip','address','tel_no','partener','other').order_by('name')
    # datas = Customer.objects.
    #     .filter(filters) \
    #     .values('name','zipNo','address','tel_no','partener','other') \
    #     .order_by('name')


    # パラメータを使用する場合
    p1 = "jcl001"
    sql = f"""
        select name,zip,address,tel_no,partener,other from customer where name = %s order by name
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (p1, ))
        datas1 = dictfetchall(cursor)
        print(datas1)

    print("--------------------------------------------------------------------------")


    sql = f"""
        select name,zip,address,tel_no,partener,other from customer order by name
    """
    print("----------------------------------")
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas1 = dictfetchall(cursor)
        print(datas1)


    logger.debug(datas.query)
    datas = list(datas)

    return HttpResponse(to_json(datas), content_type='application/json')

