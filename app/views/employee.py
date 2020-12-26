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
from app.models.model import Employee
from app.util.json import decimal_default_proc, parse_parameters_asjson, parse_post_parameters_asjson
from django.db import connection

logger = logging.getLogger(__name__)

def build_post_filters(request, exceptions={}):

    args = parse_parameters_asjson(request)
    filters = None
    if 'emp_no' in args:
        emp_no_list = args['emp_no']
        print("------------------------")
        print(emp_no_list)
        print("------------------------")
        if len(emp_no_list) > 0 and emp_no_list[0] != '':
            if isinstance(emp_no_list, list):
                filters = filters & Q(emp_no__in=emp_no_list)
            else:
                filters = filters & Q(emp_no=emp_no_list)

    return filters

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/employee/index.html")

@login_required
def get_list(request):
    filters = build_post_filters(request)

    datas = Employee.objects.values('emp_no','first_name','last_name','sex','birthday','email','tel_no').order_by('emp_no')
    # datas = Employee.objects.
    #     .filter(filters) \
    #     .values('emp_no','first_name','last_name','sex','birthday','email','tel_no') \
    #     .order_by('emp_no')

    sql = f"""
        select emp_no,first_name,last_name,sex,birthday,email,tel_no from employee order by emp_no
    """

    print("----------------------------------")
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas1 = dictfetchall(cursor)
        print(datas1)


    logger.debug(datas.query)
    datas = list(datas)

    return HttpResponse(to_json(datas), content_type='application/json')

