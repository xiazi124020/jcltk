import os
import configparser as cp
from app.util.algorithm.sim import *

SITE_ROOT = os.path.abspath(os.path.dirname(__name__))

class Context():
    """
    リゴリズムを設定によって実行するためのクラス
    """
    @staticmethod
    def get_instance():
        return Context()

    def __init__(self):
        config = cp.RawConfigParser()
        config.read(os.path.join(SITE_ROOT, "apps", "algorithm.ini"), 'UTF-8')
        self._config = config
        self._instances = {}

    def construct(self, section):
        if section in self._instances:
            return self._instances[section]

        configs = dict(self._config.items(section))
        class_name = section.capitalize() + configs["resolves"].capitalize()
        constructor = globals()[class_name]
        instance = constructor(configs)
        self._instances[section] = instance
        return instance

    def sim(self, v1, v2, **kwargs):
        return self.construct('sim').calc(v1, v2, **kwargs)
