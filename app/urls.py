#-*- coding: utf-8 -*
"""url router"""
from django.urls import path, include
from django.contrib import admin
from django.contrib.auth import views
from django.contrib.auth.decorators import login_required, permission_required
from app.views import index
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

    #----------------------------------------------------------------------------------------------------------------------------
    # api url naming rules
    #----------------------------------------------------------------------------------------------------------------------------
    #　XXX
    # path('api/user/list', login_required((user.get_list))),

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
