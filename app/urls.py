#-*- coding: utf-8 -*
"""url router"""
from django.urls import path, include
from django.contrib import admin
from django.contrib.auth import views
from django.contrib.auth.decorators import login_required, permission_required
from app.views import index
from app.views import employee
from app.views import customer
from app.views import project
from app.views import business
from app.util.utils import any_permission_required
import apps.settings
from . import url_converters

url_converters.register()

urlpatterns = [

    #----------------------------------
    # page transfer
    #----------------------------------
    path("", index.portal, name="index"),
    path("index", index.portal, name="index"),
    path("employee/index", employee.index, name="employee.index"),
    path("customer/index", customer.index, name="customer.index"),
    path("project/index", project.index, name="project.index"),
    path("business/create_file", business.create_file, name="business.create_file"),

    # ファイル作成
    path('api/business/list', login_required((business.get_list))),
    path('api/business/export/<service:service>/<yyyymmdd:start>/<yyyymmdd:end>', login_required((business.export))),

    #社員
    path('api/employee/insert', login_required((employee.insert))),
    path('api/employee/seisan/insert', login_required((employee.seisan_insert))),
    path('api/employee/delete', login_required((employee.delete))),
    path('api/employee/list', login_required((employee.get_list))),
    path('api/employee/info', login_required((employee.get_employee))),


    #お客様
    path('api/customer/insert', login_required((customer.insert))),
    path('api/customer/delete', login_required((customer.delete))),
    path('api/customer/list', login_required((customer.get_list))),
    path('api/customer/info', login_required((customer.get_customer))),

    #プロジェクト
    path('api/project/insert', login_required((project.insert))),
    path('api/project/delete', login_required((project.delete))),
    path('api/project/list', login_required((project.get_list))),
    path('api/project/info', login_required((project.get_project))),

    #----------------------------------------------------------------------------------------------------------------------------
    #
    #master
    #
    #----------------------------------------------------------------------------------------------------------------------------
    # path('api/master/list', login_required((master.get_master_list))),
]

if apps.settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

urlpatterns = [
    path(f'{apps.settings.APP_NAME}/', include(urlpatterns)),
    path('accounts/', include('django.contrib.auth.urls')),
    path('admin/', admin.site.urls),
    path('password_reset/', views.PasswordResetView.as_view(), name='admin_password_reset'),
    path('password_reset/done/', views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
