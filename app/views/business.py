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
import os
import urllib, zipfile, shutil, tempfile
import openpyxl
import logging.config

logging.config.dictConfig({
    'version': 1,
    'disable_existing_loggers': True,
})

# logger = logging.getLogger(__name__)

@login_required
def index(request):
    """page to portal page."""

    return render(request, "app/business/index.html")

@login_required
def get_list(request):

    sql = f"""
        select
        a.emp_id
        , a.first_name
        , a.last_name
        , a.first_name_kana
        , a.last_name_kana
        , a.price
        , b.name project_name
        , c.id customer_id
        , c.name customer_name
        , c.zip customer_zip
        , c.address customer_address
        , c.tel_no customer_tel_no
        , c.email customer_email
        , c.partener 
    from
        employee a 
    inner join project b 
        on a.project_id = b.id 
    inner join customer c 
        on b.customer_id = c.id 
    where
        b.status = 1 
    order by
        c.id
        , c.partener
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')


@login_required
def export(request, service="000", start="19000101", end="21991231"):

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
    inner join project b 
        on a.project_id = b.id 
    inner join customer c 
        on b.customer_id = c.id 
    where
        b.status = 1 
    order by
        c.id
        , c.partener
    """
    file_datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        file_datas = dictfetchall(cursor)

    seisan_datas = []
    sql = """
        select emp_id, seisan_time, ym from seisan where ym < %s
    """

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # load workbook if you want to write in existing file else use openpyxl.Workbook()
    wb = openpyxl.load_workbook(os.path.join(base_path, "請求書.xlsx"))

    #set the sheet name
    # wb['Sheet'].title="Report of Automation"

    #get the active sheet
    sh1=wb.active
    sh1=wb['請求書']

    # pass which row and column and value which you want to update
    sh1.cell(row=5,column=1,value='Pytest')
    sh1.cell(row=5,column=2,value='UK')
    sh1.cell(row=5,column=3,value=88.88)

    # save the excel with name or you can give specific location of your choice
    wb.save(os.path.join(base_path, "請求書202109.xlsx"))


    csv_tempfile_path = os.path.join(tempfile.gettempdir(), f"ユーザー一覧($1-$2).csv")
    zip_tempfile_path = f'{csv_tempfile_path}.zip'


    response = HttpResponse(content_type='application/octet-stream')
    filename = (f'請求書202109.zip').encode("utf8")
    # filename = (f'請求書202109.xlsx').encode("utf8")
    urlenc_filename = urllib.parse.quote(filename)
    response['Content-Disposition'] = 'attachment;filename="{}";filename*=UTF-8\'\'{}'.format(filename, urlenc_filename)


    with open(os.path.join(base_path, "請求書202109.zip"), 'rb') as f_in:
        shutil.copyfileobj(f_in, response)

    return response
    # return HttpResponse(to_json(datas), content_type='application/json')

