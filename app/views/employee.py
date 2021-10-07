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
        
    sql = f"""
        select emp_id,last_name,first_name from employee
    """
    seisan_datas_emp = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        seisan_datas_emp = dictfetchall(cursor)

    return render(request, "app/employee/index.html", {'project_datas': project_datas,'depart_datas': depart_datas,'seisan_datas_emp': seisan_datas_emp})

@login_required
def get_list(request):

    sql = f"""
        select
            a.emp_id
            , a.department_id
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
            , a.no_project_benefit
            , c.name 
            , c.id project_id
        from
            employee a
        inner join emp_project b
        on a.emp_id = b.emp_id
        and b.current_flag = 1
        inner join project c
        on b.project_id = c.id
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
    # 社員番号
    emp_id = parameters['emp_id']
    datas = []
    sql = f"""
    
        select
            a.emp_id
            , a.department_id
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
            , a.no_project_benefit
            , c.name 
            , c.id project_id
        from
            employee a
        inner join 
            emp_project b
        on a.emp_id = b.emp_id
        and b.current_flag = 1
        inner join 
            project c
        on b.project_id = c.id
        where 
            a.emp_id = %s
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
    # 待機費
    no_project_benefit = parameters['no_project_benefit']
    if no_project_benefit == '':
        no_project_benefit = 0
    exec_sql = None
    sql = f"""
        select emp_id from employee where emp_id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (emp_id,))
        datas = dictfetchall(cursor)
        if len(datas) == 0:
            # 社員テーブル
            exec_sql = f"""
                INSERT INTO employee( 
                    emp_id,
                    department_id,
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
                    no_project_benefit,
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
            # 社員プロジェクトテーブル
            exec_emp_pro_sql = f"""
                insert into emp_project(
                    emp_id,
                    project_id,
                    current_flag
                ) values (
                    %s,
                    %s,
                    %s
                )
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (emp_id,department_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,0,no_project_benefit))
                cursor.execute(exec_emp_pro_sql, (emp_id, project_id,1))
        
        else:
            exec_sql = f"""
                update employee set
                    department_id = %s,
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
                cursor.execute(exec_sql, (department_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,emp_id))

            select_ql = f"""
                select count(*) count from emp_project where emp_id = %s and project_id = %s
            """
            
            emp_project_datas = []
            with connection.cursor() as cursor:
                cursor.execute(select_ql, (emp_id, project_id))
                emp_project_datas = dictfetchall(cursor)
                
            update_all_null_sql = f"""
                update emp_project
                set current_flag = 0
                where emp_id = %s 
            """
            update_one_sql = f"""
                update emp_project
                set current_flag = 1
                where emp_id = %s and project_id = %s
            """
            if emp_project_datas[0]['count'] > 0:
                with connection.cursor() as cursor:
                    cursor.execute(update_all_null_sql, (emp_id, ))
                    cursor.execute(update_one_sql, (emp_id, project_id))
            else:
                insert_sql = f"""
                    insert into emp_project(emp_id, project_id, current_flag) values (%s, %s, %s)
                """
                with connection.cursor() as cursor:
                    cursor.execute(update_all_null_sql, (emp_id, ))
                    cursor.execute(insert_sql, (emp_id, project_id, 1))


    sql = f"""
        select
            a.emp_id
            , a.department_id
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
            , a.no_project_benefit
            , c.name 
            , c.id project_id
        from
            employee a
        inner join 
            emp_project b
        on a.emp_id = b.emp_id
        and b.current_flag = 1
        inner join 
            project c
        on b.project_id = c.id
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')


@login_required
def seisan_insert(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # 社員番号
    emp_id = parameters['emp_id']
    # 精算時間
    seisan_time = parameters['seisan_time']
    #  精算年月
    seisan_ym = parameters['seisan_ym']
    
    sql = f"""
        select id, seisan_time, emp_id, ym from seisan where emp_id = %s and ym = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (emp_id, seisan_ym))
        datas = dictfetchall(cursor)
        if len(datas) == 0:
            exec_sql = f"""
                INSERT INTO seisan( 
                    seisan_time,
                    emp_id,
                    ym
                    ) 
                    VALUES ( 
                    %s
                    , %s
                    , %s
                    )
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (seisan_time,emp_id,seisan_ym))
        else:
            exec_sql = f"""
                update seisan set
                    seisan_time = %s
                where
                    ym = %s and
                    emp_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (seisan_time,seisan_ym,emp_id))

    sql = f"""
        select emp_id,department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,delete_flag from employee
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')


@login_required
def seisan_info(request):

    post_data = json.loads(request.body.decode('utf-8'))
    parameters = post_data['data']
    # 社員番号
    emp_id = parameters['emp_id']
    # 精算時間
    seisan_time = parameters['seisan_time']
    #  精算年月
    seisan_ymd = parameters['seisan_ymd']
    #  id
    id = parameters['id']
    
    sql = f"""
        select id, seisan_time, emp_id, ymd from employee where id = %s
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, (emp_id,))
        datas = dictfetchall(cursor)
        if len(datas) == 0:
            # return HttpResponse(to_json({"exists_flag": 1}), content_type='application/json')
            exec_sql = f"""
                INSERT INTO seisan( 
                    seisan_time,
                    emp_id,
                    ymd
                    ) 
                    VALUES ( 
                    %s
                    , %s
                    , %s
                    )
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (seisan_time,emp_id,seisan_ymd))
        else:
            exec_sql = f"""
                update seisan set
                    seisan_time = %s
                where
                and ymd = %s,
                    emp_id = %s
            """
            with connection.cursor() as cursor:
                cursor.execute(exec_sql, (seisan_time,seisan_ymd,emp_id))

    sql = f"""
        select emp_id,department_id,project_id,first_name,last_name,first_name_kana,last_name_kana,sex,birthday,zip,address1,address2,email,residence_no,tel,entry_date,quit_date,start_work_date,japanese_level,emp_type,salary,price,transport_cost,status,station,position,sales_id,project_end_plan_date,delete_flag from employee
    """
    datas = []
    with connection.cursor() as cursor:
        cursor.execute(sql)
        datas = dictfetchall(cursor)

    return HttpResponse(to_json(datas), content_type='application/json')

