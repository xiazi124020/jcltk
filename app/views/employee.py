#-*- coding: utf-8 -*
"""view for page transfer."""

import logging
from datetime import datetime
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
import apps.settings as settings
from django.http import HttpResponse
from app.views.base import json_extract, to_json

logger = logging.getLogger(__name__)

@login_required
def index(request):
    """page to portal page."""
    return render(request, "app/employee/index.html")

@login_required
def get_list(request):
    
    datas = []

    return HttpResponse(to_json(datas), content_type='application/json')
