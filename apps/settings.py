"""
Django settings for web project.

Generated by 'django-admin startproject' using Django 2.2.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
from app.util.mysql import get_datasource

APP_NAME = 'jcl'

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA_URL = '/csv/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'csv')

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'oyfts+$x%%^_(257+tp^!cp)()r27g^#(p9()eg^b&t%yhirv9'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

#ALLOWED_IPS = ["127.0.0.1", "10.112.50.*", "118.103.121.173", "101.102.143.238"]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django_filters',
    'crispy_forms',
    'app',
]

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'apps.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

#AUTHENTICATION_BACKENDS = [
#    'django.contrib.auth.backends.ModelBackend',
#    'app.views.auth.RpaAuthBackend',  # 追加
#]

WSGI_APPLICATION = 'apps.wsgi.application'

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases
DATABASES = {
    'default': get_datasource()
}

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    }
}

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

#LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'ja'

#TIME_ZONE = 'UTC'
TIME_ZONE = 'Asia/Tokyo'

USE_I18N = True

USE_L10N = True

USE_TZ = False

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR,  'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'static_collected')

# ログイン
#LOGIN_URL = '/login'
LOGIN_REDIRECT_URL = f"/{APP_NAME}/"
LOGOUT_REDIRECT_URL = f'/{APP_NAME}/'

AUTH_USER_MODEL = 'app.User' # 追加

#セッションタイムアウト 60分
SESSION_TIMEOUT_SECONDS = 60*60
if not DEBUG:
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
    SESSION_EXPIRE_AT_BROWSER_CLOSE = True
    SESSION_COOKIE_AGE = SESSION_TIMEOUT_SECONDS
    SESSION_IDLE_TIMEOUT = SESSION_TIMEOUT_SECONDS

#django debug tool
#INTERNAL_IPS = ['127.0.0.1']

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'formatters': {
        #プロジェクト用のフォーマットを追加
        'heibon': {
            'format': ' '.join([
                "[%(levelname)s]",
                "[%(asctime)s]",
                "[%(name)s.%(funcName)s:%(lineno)s]",
                "%(message)s",
            ])
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
            'formatter': 'heibon'   #フォーマッター追加
        },
        'file': {
            'level': 'DEBUG',
            'filters': ['require_debug_false'],
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'filename': os.path.join('/home/logs/jcl_logs' if DEBUG else '/home/logs/jcl_logs', 'rpa.log'),
            # 'filename': os.path.join(r'C:\rpa-work\logs' if DEBUG else '/home/logs/jcl_logs', 'rpa.log'),
            'formatter': 'heibon',
            'when': 'D',  # 単位 Dは日
            'interval': 1,  # 何日おきか指定
            'backupCount': 30,  # バックアップ世代数
        }
    },
    'loggers': {
        'app': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    }
}

OFFICE_SERVER_IP = '127.0.0.1:8000'
