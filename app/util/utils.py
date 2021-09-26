import os
from django.db.models import Q
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import user_passes_test
from app.util.json import parse_parameters_asjson, parse_post_parameters_asjson

def make_dir_recursive(base, *sub_dirs):
    d = base
    if not os.path.exists(d):
        os.makedirs(d)
    for sub_dir in sub_dirs:
        d = os.path.join(d, sub_dir)
        if not os.path.exists(d):
            os.mkdir(d)
    return d

def any_permission_required(perms, login_url=None, raise_exception=False):
    def check_perms(user):
        for perm in perms:
            if perm == 'is_superuser' and user.is_superuser:
                return True
            if perm == 'is_staff' and user.is_staff:
                return True
            if user.has_perm(perm):
                return True
        if raise_exception:
            raise PermissionDenied
        return False
    return user_passes_test(check_perms, login_url=login_url)

def get_post_datas(request):
    pass