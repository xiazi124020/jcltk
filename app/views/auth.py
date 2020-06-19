"""
user auth relative handles
"""
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.views import (
    LoginView, LogoutView
)
from django.contrib.auth import login
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from app.forms.forms import SignUpForm, LoginForm

class Login(LoginView):
    """ログインページ"""

    form_class = LoginForm
    template_name = 'registration/login.html'

class Logout(LoginRequiredMixin, LogoutView):
    """ログアウトページ"""

    template_name = 'registration/logged_out.html'

class SignUp(CreateView):
    """ユーザ登録六ページ"""

    form_class = SignUpForm
    template_name = "registration/signup.html"
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        user = form.save() # formの情報を保存
        login(self.request, user) # 認証
        self.object = user
        return HttpResponseRedirect(self.get_success_url()) # リダイレクト
