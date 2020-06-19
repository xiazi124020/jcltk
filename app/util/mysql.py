import os
import codecs
import configparser as cp
from uuid import getnode as get_mac

SITE_ROOT = os.path.abspath(os.path.dirname(__name__))

def get_datasource():

    mac = str(get_mac())
    config = cp.RawConfigParser()
    config_file = os.path.join(SITE_ROOT, "apps", "mysql.ini")
    config.read(config_file, 'UTF-8')
    crypt = config.get("db", "crypt")
    passwd = config.get("db", "PASSWORD")
    if crypt == "0":
        with codecs.open(config_file, 'w', 'utf-8') as cfgfile:
            config.set("db", "crypt", "1")
            config.set("db", "PASSWORD", passwd)
            config.write(cfgfile)

    ssl = None if not config.has_option("db", "SSL") else config.get("db", "SSL")
    result = None
    if ssl is not None and ssl == '1':
        result = {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': config.get("db", "NAME"),
            'USER': config.get("db", "USER"),
            "PASSWORD": passwd,
            'HOST': config.get("db", "HOST"),
            'PORT': config.get("db", "PORT"),
            'OPTIONS': {
                'ssl': {
                    'ca': r'C:\Users\chuaxin\Desktop\work\workspace\rpa_web\apps\rds-ca-2019-ap-northeast-1.pem',
                }
            }
        }
    else:
        result = {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': config.get("db", "NAME"),
            'USER': config.get("db", "USER"),
            "PASSWORD": passwd,
            'HOST': config.get("db", "HOST"),
            'PORT': config.get("db", "PORT")
        }
    return result
