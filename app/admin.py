from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models.users import User

admin.site.register(User, UserAdmin)
