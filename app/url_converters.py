#-*- coding: utf-8 -*
"""define url converter"""

from django.urls import register_converter

class ServiceConverter:
    """url mapping for fx/ac/op"""

    regex = 'fx|ac|op'
    def to_python(self, value):
        return value
    def to_url(self, value):
        return value

class YmdConverter:
    """url mapping for yyyyymmdd"""

    regex = '[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])'
    def to_python(self, value):
        ymd = str(value)
        #ymd = pre_ymd_process(ymd)[0]
        return ymd

    def to_url(self, value):
        return '%08d' % value

class YmdRangeConverter:
    """url mapping for yyyyymmdd"""

    regex = '[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])' + '-' + '[0-9]{4}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])'
    def to_python(self, value):
        slices = value.split('-')
        #start, end = pre_ymd_process(slices[0], slices[1])
        return (slices[0], slices[1])

    def to_url(self, value):
        return '%08d' % value

class YmConverter:
    """url mapping for yyyyymm"""

    regex = '[0-9]{4}(0[1-9]|1[0-2])'
    def to_python(self, value):
        return str(value)

    def to_url(self, value):
        return '%06d' % value

class YmRangeConverter:
    """url mapping for yyyyymm"""

    regex = '([0-9]{4}(0[1-9]|1[0-2]))' + '-' + '([0-9]{4}(0[1-9]|1[0-2]))'
    def to_python(self, value):
        slices = value.split('-')
        return (slices[0], slices[1])

    def to_url(self, value):
        return '%06d' % value



class DdRangeConverter:
    """url mapping for dd-dd"""

    regex = '(0[1-9]|[1-2][0-9]|3[0-1])' + '-' + '(0[1-9]|[1-2][0-9]|3[0-1])'
    def to_python(self, value):
        slices = value.split('-')
        return (slices[0], slices[1])

    def to_url(self, value):
        return '%02d' % value


def register():
    register_converter(ServiceConverter, 'service')
    register_converter(YmdConverter, 'yyyymmdd')
    register_converter(YmConverter, 'yyyymm')
    register_converter(YmdRangeConverter, 'yyyymmdd-yyyymmdd')
    register_converter(YmRangeConverter, 'yyyymm-yyyymm')
    register_converter(DdRangeConverter, 'dd-dd')
