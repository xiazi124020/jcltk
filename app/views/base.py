#-*- coding: utf-8 -*
"""define share function and constants among views in here"""
import json
import re
from django.db.models import Q
from django.db.models import DecimalField
from django.db.models import F
from django.db.models.functions import Cast
from django_mysql.models.functions import JSONExtract
from app.util.json import decimal_default_proc, parse_parameters_asjson, parse_post_parameters_asjson

DEFAULT_LIMIT = 10


def json_extract(json_field, json_attr):
    return Cast(JSONExtract(F(f"{json_field}"), f'$.{json_attr}'), output_field=DecimalField(max_digits=22, decimal_places=7))

def to_json(datas):
    """transfer data object to json"""
    return json.dumps(datas, default=decimal_default_proc)

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

