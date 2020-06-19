from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import AuthenticationForm
from app.models.users import User

class SignUpForm(UserCreationForm):
    """ユーザ登録フォーム"""

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'password1', 'password2')

class LoginForm(AuthenticationForm):
    """ログインフォーム"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.widget.attrs['class'] = 'form-control'
            field.widget.attrs['placeholder'] = field.label
