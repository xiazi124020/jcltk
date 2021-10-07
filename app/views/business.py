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
from os.path import basename
import urllib, zipfile, shutil, tempfile
import openpyxl
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import calendar

logger = logging.getLogger(__name__)

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
    inner join emp_project d
        on a.emp_id = d.emp_id
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

def months_between(start_date, end_date):
    
    if start_date > end_date:
        raise ValueError(f"Start date {start_date} is not before end date {end_date}")
    
    start = datetime.strptime(start_date[0:6], '%Y%m').date()
    end = datetime.strptime(end_date[:6], '%Y%m').date()

    ret = []
    while start <= end:
        ret.append(datetime.strftime(start, '%Y%m'))
        start += relativedelta(months=1)
    return ret

@login_required
def export(request, service="000", start="20200401", end="20301231"):

    months = months_between(start, end)
    download_file_list = []
    zip_tempfile_path = '{}-{}.zip'.format(start, end)

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
        inner join project b 
            on b.id = d.project_id 
        inner join customer c 
            on b.customer_id = c.id 
            and c.partener = %s
        where b.id <> 1
        and b.start_date >= %s
        and (b.end_date is null or b.end_date >= %s)
        order by
        c.id
    """
    # 請求書
    if service[0:1] == "1":
        bill_file_datas = []
        with connection.cursor() as cursor:
            cursor.execute(sql, (1,months[0][:4] + "/" + months[0][4:] + "/01", months[len(months) - 1][:4] + "/" + months[len(months) - 1][4:] + "/01"))
            bill_file_datas = dictfetchall(cursor)

        for data in bill_file_datas:
            data['start_date'] = data['start_date'].strftime('%Y%m%d')
            if data['end_date'] is not None:
                data['end_date'] = data['end_date'].strftime('%Y%m%d')

        seisan_datas = []
        sql = """
            select emp_id, seisan_time, ym from seisan where ym < %s
        """
        output_max_month = months[-1]
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if len(bill_file_datas) > 0:
            for month in months:
                customer_id = bill_file_datas[0]['customer_id']
                # load workbook if you want to write in existing file else use openpyxl.Workbook()
                wb = openpyxl.load_workbook(os.path.join(base_path, "請求書.xlsx"))
                filename = "{}_{}_請求書.xlsx"
                exists_flag = False
                for data in bill_file_datas:
                    count = 0
                    if customer_id != data['customer_id']:
                        customer_id = data['customer_id']
                        # save the excel with name or you can give specific location of your choice
                        filename = filename.format(month, data['customer_name'])
                        wb.save(os.path.join(base_path, filename))
                        wb.close()
                        download_file_list.append(filename)
                        exists_flag = False
                        wb = openpyxl.load_workbook(os.path.join(base_path, "請求書.xlsx"))

                    if month >= data['start_date'][:6] and (data['end_date'] is None or month <= data['end_date'][:6]):

                        #get the active sheet
                        sh1=wb.active
                        sh1=wb['請求書']

                        # pass which row and column and value which you want to update
                        sh1.cell(row=2,column=1,value=data['customer_name'] + "御中")
                        sh1.cell(row=2,column=8,value='JCL-' + month + "-" + str(count).zfill(3))
                        sh1.cell(row=3,column=8,value=month[:2] + "/" + month[2:] + "/01")
                        sh1.cell(row=4,column=1,value="〒" + data['customer_zip'][:3] + "-" + data['customer_zip'][3:])
                        sh1.cell(row=8,column=1,value="件名：" + data['project_name'])
                        # 支払期限
                        current_date = datetime.strptime(month + '01', '%Y%m%d')
                        next_two_month = current_date + relativedelta(months=2)
                        next_month = next_two_month.replace(day=28) + timedelta(days=4)
                        last_day_of_month = next_month - timedelta(days=next_month.day)

                        sh1.cell(row=12,column=8,value=datetime.strftime(last_day_of_month, '%Y%m%d'))
                        sh1.cell(row=15+count,column=1,value=count + 1)
                        sh1.cell(row=15+count,column=2,value=data['project_name'] + "【" + data['first_name'] + data['last_name'] +  "】")
                        sh1.cell(row=15+count,column=5,value=1)
                        sh1.cell(row=15+count,column=6,value="人・月")
                        sh1.cell(row=15+count,column=7,value=data['price'])
                        count = count + 1
                        exists_flag = True
                    
                if exists_flag == False:
                    # save the excel with name or you can give specific location of your choice
                    wb.save(os.path.join(base_path, filename))
                    wb.close()

    # 注文書
    if service[0:1] == "2":
        
        order_file_datas = []
        with connection.cursor() as cursor:
            cursor.execute(sql, (2 ,months[0][:4] + "/" + months[0][4:] + "/01", months[len(months) - 1][:4] + "/" + months[len(months) - 1][4:] + "/01"))
            order_file_datas = dictfetchall(cursor)

        for data in order_file_datas:
            data['start_date'] = data['start_date'].strftime('%Y%m%d')
            if data['end_date'] is not None:
                data['end_date'] = data['end_date'].strftime('%Y%m%d')

        seisan_datas = []
        sql = """
            select emp_id, seisan_time, ym from seisan where ym < %s
        """
        months = months_between(start, end)
        output_max_month = months[-1]
        base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        if len(order_file_datas) > 0:
            for month in months:
                customer_id = order_file_datas[0]['customer_id']
                # load workbook if you want to write in existing file else use openpyxl.Workbook()
                wb = openpyxl.load_workbook(os.path.join(base_path, "注文書.xlsx"))
                filename = "{}_{}_注文書.xlsx"
                exists_flag = False
                for data in order_file_datas:
                    count = 0
                    if customer_id != data['customer_id']:
                        customer_id = data['customer_id']
                        # save the excel with name or you can give specific location of your choice
                        filename = filename.format(month, data['customer_name'])
                        wb.save(os.path.join(base_path, filename))
                        wb.close()
                        download_file_list.append(filename)
                        wb = openpyxl.load_workbook(os.path.join(base_path, "注文書.xlsx"))
                        exists_flag = False

                    if month >= data['start_date'][:6] and (data['end_date'] is None or month <= data['end_date'][:6]):

                        #get the active sheet
                        sh1=wb.active
                        sh1=wb['注文書']

                        # pass which row and column and value which you want to update
                        sh1.cell(row=2,column=1,value=data['customer_name'])
                        sh1.cell(row=2,column=8,value='JCL-' + month + "-" + str(count).zfill(3))
                        sh1.cell(row=3,column=8,value=month[:2] + "/" + month[2:] + "/01")
                        sh1.cell(row=5,column=1,value="件名：" + data['project_name'])
                        # 支払期限
                        current_date = datetime.strptime(month + '01', '%Y%m%d')
                        next_two_month = current_date + relativedelta(months=2)
                        next_month = next_two_month.replace(day=28) + timedelta(days=4)
                        last_day_of_month = next_month - timedelta(days=next_month.day)

                        sh1.cell(row=15+count,column=1,value=count + 1)
                        sh1.cell(row=15+count,column=2,value=data['project_name'] + "【" + data['first_name'] + data['last_name'] +  "】" + month )
                        sh1.cell(row=15+count,column=4,value=1)
                        sh1.cell(row=15+count,column=6,value="人・月")
                        sh1.cell(row=15+count,column=7,value=data['price'])
                        count = count + 1
                        exists_flag = True
                        
                if exists_flag == False:
                    # save the excel with name or you can give specific location of your choice
                    filename = filename.format(month, data['customer_name'])
                    wb.save(os.path.join(base_path, filename))
                    wb.close()

    with zipfile.ZipFile(os.path.join(base_path,zip_tempfile_path), 'w', compression=zipfile.ZIP_DEFLATED) as new_zip:
        for f_index in download_file_list:
            new_zip.write(os.path.join(base_path, f_index))

    response = HttpResponse(content_type='application/octet-stream')
    temp_filename = zip_tempfile_path.encode("utf8")
    urlenc_filename = urllib.parse.quote(temp_filename)
    response['Content-Disposition'] = 'attachment;filename="{}";filename*=UTF-8\'\'{}'.format(temp_filename, urlenc_filename)

    with open(os.path.join(base_path, zip_tempfile_path), 'rb') as f_in:
        shutil.copyfileobj(f_in, response)

    for f_index in download_file_list:
        if os.path.exists(os.path.join(base_path, f_index)):
            os.remove(os.path.join(base_path, f_index))
    if os.path.exists(os.path.join(base_path,zip_tempfile_path)):
        os.remove(os.path.join(base_path,zip_tempfile_path))

    return response

