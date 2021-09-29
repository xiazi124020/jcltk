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

    # 稼働中社員情報取得
    sql = """
        select 
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
    wb.save("Report.xlsx")