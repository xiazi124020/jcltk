from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Meta:
        permissions = (
            ("view_profile", "Can see profile page."),
            ("view_alert", "Can see large order alert page."),
        )
