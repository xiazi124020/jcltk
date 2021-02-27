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
from app.models.project import Project
from app.util.json import decimal_default_proc, parse_parameters_asjson, parse_post_parameters_asjson
from django.db import connection

logger = logging.getLogger(__name__)

def build_post_filters(request, exceptions={}):

    args = parse_parameters_asjson(request)
    filters = None
    if 'pro_no' in args:
        pro_no_list = args['pro_no']
        print("------------------------")
        print(pro_no_list)
        print("------------------------")
        if len(pro_no_list) > 0 and pro_no_list[0] != '':
            if isinstance(pro_no_list, list):
                filters = filters & Q(pro_no_list_in=pro_no_list)
            else:
                filters = filters & Q(pro_no_list=pro_no_list)

    return filters

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/project/index.html")

@login_required
def get_list(request):
    filters = build_post_filters(request)

    datas = Project.objects.values('pro_no','pro_name','pro_address','cust_name','emp_name','en_time','exit_time').order_by('pro_no')
    # datas = Project.objects.
    #     .filter(filters) \
    #     .values('pro_no','pro_name','pro_address','cust_name','emp_name','en_time','exit_time') \
    #     .order_by('pro_no')


    # パラメータを使用する場合
    p1 = "jcl001"
    sql = f"""
        select pro_no,pro_name,pro_address,cust_name,emp_name,en_time,exit_time from project where pro_no = %s order by pro_no
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (p1, ))
        datas1 = dictfetchall(cursor)
        print(datas1)

    print("--------------------------------------------------------------------------")


    sql = f"""
        select pro_no,pro_name,pro_address,cust_name,emp_name,en_time,exit_time from project order by pro_no
    """
    print("----------------------------------")
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas1 = dictfetchall(cursor)
        print(datas1)


    logger.debug(datas.query)
    datas = list(datas)

    return HttpResponse(to_json(datas), content_type='application/json')

