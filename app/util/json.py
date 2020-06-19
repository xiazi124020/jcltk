
import json
import logging
from decimal import Decimal

logger = logging.getLogger(__name__)

def decimal_default_proc(obj):
    if isinstance(obj, Decimal):
        return str(obj)
    elif isinstance(obj, int):
        return int(obj)
    else:
        return str(obj)

def parse_parameters_asjson(request):
    req_body = request.body.decode('utf-8')
    if req_body:
        json_datas = json.loads(req_body)
        if 'data' in json_datas:
            logger.debug(json_datas['data'])
            return json_datas['data']
        else:
            return {}
    return {}

def parse_post_parameters_asjson(request):
    params = {}
    for key in request.POST:
        params[key] = request.POST.get(key, "")
    logger.debug(params)
    return params