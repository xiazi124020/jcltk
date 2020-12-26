#-*- coding: utf-8 -*
"""view for page transfer."""

import logging
from datetime import datetime
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
import apps.settings as settings
import json

logger = logging.getLogger(__name__)

@login_required
def portal(request):
    """page to portal page."""
    test_data = {'name':'Sarah', 'age': 24, 'isEmployed': True }
    python2json = json.dumps(test_data)
    return render(request, "app/index.html",{"python2json" : python2json})
