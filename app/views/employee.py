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

    sql = f"""
        select id,name from project
    """
    project_datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        project_datas = dictfetchall(cursor)
        

    sql = f"""
        select id,name from department
    """
    datas_depart = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        depart_datas = dictfetchall(cursor)
    return render(request, "app/employee/index.html", {'project_datas': project_datas,'depart_datas': depart_datas})

@login_required
def get_list(request):

    sql = f"""
        select
        a.emp_id
        , a.department_id
        , a.project_id
        , a.first_name
        , a.last_name
        , a.first_name_kana
        , a.last_name_kana
        , a.sex
        , a.birthday
        , a.zip
        , a.address1
        , a.address2
        , a.email
        , a.residence_no
        , a.tel
        , a.entry_date
        , a.quit_date
        , a.start_work_date
        , a.japanese_level
        , a.emp_type
        , a.salary
        , a.price
        , a.transport_cost
        , a.status
        , a.station
        , a.position
        , a.sales_id
        , a.project_end_plan_date
        , a.delete_flag
        , b.name 
        from
        employee a
        inner join project b
        on a.project_id = b.id
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')


@login_required
def get_employee(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # お客様名称
    emp_id = parameters['emp_id']
    datas = []
    sql = f"""
        select emp_id,department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,delete_flag from employee where emp_id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (emp_id,))
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

@login_required
def delete(request):

    post_data = json.loads(request.body.decode('utf-8'))
    data = post_data['data']
    sql='update employee set delete_flag = 1 WHERE EMP_ID IN (%s)' 
    inlist=', '.join(map(lambda x: '%s', data))
    sql = sql % inlist

    with connection.cursor() as cursor:
        cursor.execute(sql, data)

    return HttpResponse(to_json({"success": True}), content_type='application/json')

@login_required
def insert(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # 社員番号
    emp_id = parameters['emp_id']
    # 部門番号
    department_id = parameters['department_id']
    #  プロジェクト番号
    project_id = parameters['project_id']
    #  名前１
    first_name = parameters['first_name']
    #  名前２
    last_name = parameters['last_name']
    #  カナ１
    first_name_kana = parameters['first_name_kana']
    #  カナ２
    last_name_kana = parameters['last_name_kana']
    #  性別
    sex = parameters['sex']
    #  生年月日
    birthday = parameters['birthday']
    if birthday == "":
        birthday = None
    #  郵便番号
    zip = parameters['zip']
    #  住所1
    address1 = parameters['address1']
    #  住所2
    address2 = parameters['address2']
    #  メールアドレス
    email = parameters['email']
    #  在留カード番号
    residence_no = parameters['residence_no']
    #  電話番号
    tel = parameters['tel']
    #  入社日付
    entry_date = parameters['entry_date']
    #  離任日付
    quit_date = parameters['quit_date']
    if quit_date == "":
        quit_date = None
    #  仕事経験
    start_work_date = parameters['start_work_date']
    #  日本語能力
    japanese_level = parameters['japanese_level']
    #  社員種別
    emp_type = parameters['emp_type']
    #  給料
    salary = parameters['salary']
    if salary == "":
        salary = None
    #  単価
    price = parameters['price']
    if price == "":
        price = None
    #  交通費
    transport_cost = parameters['transport_cost']
    if transport_cost == "":
        transport_cost = None
    #  status
    status = parameters['status']
    #  駅
    station = parameters['station']
    #  職位
    position = parameters['position']
    #  営業担当ID
    sales_id = parameters['sales_id']
    #  プロジェクト予定終了日
    project_end_plan_date = parameters['project_end_plan_date']
    if project_end_plan_date == "":
        project_end_plan_date = None
    exec_sql = None
    sql = f"""
        select emp_id from employee where emp_id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (emp_id,))
        datas = dictfetchall(cursor)
        if len(datas) == 0:
            # return HttpResponse(to_json({"exists_flag": 1}), content_type='application/json')
            exec_sql = f"""
                INSERT INTO employee( 
                    emp_id,
                    department_id,
                    project_id,
                    first_name,
                    last_name,
                    first_name_kana,
                    last_name_kana,
                    sex,
                    birthday,
                    zip,
                    address1,
                    address2,
                    email,
                    residence_no,
                    tel,
                    entry_date,
                    quit_date,
                    start_work_date,
                    japanese_level,
                    emp_type,
                    salary,
                    price,
                    transport_cost,
                    status,
                    station,
                    position,
                    sales_id,
                    project_end_plan_date,
                    delete_flag
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
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
                    , %s
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
                cursor.execute(exec_sql, (emp_id,department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,0))
        else:
            exec_sql = f"""
                update employee set
                    department_id = %s,
                    project_id = %s,
                    first_name = %s,
                    last_name = %s,
                    first_name_kana = %s,
                    last_name_kana = %s,
                    sex = %s,
                    birthday = %s,
                    zip = %s,
                    address1 = %s,
                    address2 = %s,
                    email = %s,
                    residence_no = %s,
                    tel = %s,
                    entry_date = %s,
                    quit_date = %s,
                    start_work_date = %s,
                    japanese_level = %s,
                    emp_type = %s,
                    salary = %s,
                    price = %s,
                    transport_cost = %s,
                    status = %s,
                    station = %s,
                    position = %s,
                    sales_id = %s,
                    project_end_plan_date = %s
                where
                    emp_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,emp_id))

    sql = f"""
        select emp_id,department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,delete_flag from employee
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

