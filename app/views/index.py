#-*- coding: utf-8 -*
"""view for page transfer."""

import logging
from datetime import datetime
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.forms.models import model_to_dict
import apps.settings as settings

logger = logging.getLogger(__name__)

@login_required
def portal(request):
    """page to portal page."""
    return render(request, "app/index.html")
