#-*- coding: utf-8 -*
"""view for page transfer."""

import logging
from datetime import datetime
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
import apps.settings as settings
import json
from json import dumps
from django.db import connection
from app.views.base import json_extract, to_json, dictfetchall
import openpyxl
import os

logger = logging.getLogger(__name__)

@login_required
def portal(request):
    """page to portal page."""

    return render(request, "app/index.html")

@login_required
def file_create(request):

    sql = f"""
        select
        a.emp_id
        , a.first_name
        , a.last_name
        , a.first_name_kana
        , a.last_name_kana
        , a.price
        , b.name project_name
        , b.start_date
        , b.end_date
        , c.id customer_id
        , c.name customer_name
        , c.zip customer_zip
        , c.address customer_address
        , c.tel_no customer_tel_no
        , c.email customer_email
        , c.partener 
    from
        employee a 
    inner join emp_project d
        on a.emp_id = d.emp_id
        and d.current_flag = 1
    inner join project b 
        on d.project_id = b.id
    inner join customer c 
        on b.customer_id = c.id 
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')