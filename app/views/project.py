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

logger = logging.getLogger(__name__)

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/project/index.html")

@login_required
def get_list(request):


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

