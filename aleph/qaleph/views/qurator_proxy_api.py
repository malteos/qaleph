import logging
import os
from json import JSONDecodeError

import requests
from flask import Blueprint, request
from requests.auth import HTTPBasicAuth

from aleph.views.util import jsonify

QURATOR_API_USER = os.environ.get("QURATOR_API_USER", "qurator")
QURATOR_API_PASSWORD = os.environ.get("QURATOR_API_PASSWORD", "dd17f230-a879-48cf-9220-55b4fcd4b941")
QURATOR_API_URL = os.environ.get("QURATOR_API_URL", "https://demo.qurator.ai/pub/")


log = logging.getLogger(__name__)
blueprint = Blueprint('qurator_proxy_api', __name__)


@blueprint.route('/api/2/qurator_proxy/<path:api_path>', methods=['GET', 'POST'])
def view(api_path):
    """
    Send everything to the qurator API (like a proxy)

    Example:

    curl -XGET http://localhost:5000/api/2/qurator_proxy/srv-textclass/models
    curl -X POST "http://localhost:5000/api/2/qurator_proxy/srv-textclass/models/spacy_dewikinews/classify?text=In%20Berlin%20wird%20Politik%20gemacht.&classification_threshold=0.1" -H  "accept: application/json"
    """

    api_url = QURATOR_API_URL + api_path
    api_kwargs = {}

    if request.query_string:
        log.info('QUERY string: %s' % request.query_string.decode('utf-8'))
        api_url += '?%s' % request.query_string.decode('utf-8')

    if request.args:
        # Forward data
        api_kwargs['data'] = request.args
        log.info('Data from Args: %s' % request.args)

    if request.data:
        # Forward data (override args)
        api_kwargs['data'] = request.data
        log.info('Data from raw data: %s' % request.data)

    if request.is_json:
        log.info('JSON: %s' % request.json)
        api_kwargs['json'] = request.json

    log.info(f'Forward API request to (method: {request.method}): {api_url}')

    headers = {
        # Default headers
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    headers.update(dict(request.headers))

    for k, v in list(headers.items()):
        if k == 'Host' or k == 'Cookie' or 'Accept=' in k:
            del headers[k]
            continue

        log.info(f' - header: {k} = {v}')

    res = requests.request(
        request.method,
        api_url,
        auth=HTTPBasicAuth(QURATOR_API_USER, QURATOR_API_PASSWORD),
        headers=headers,
        # headers={
        #     'Content-Type': 'application/json'
        # },
        **api_kwargs
    )

    if res.status_code != 200:
        log.error(f'API response has error code: {res.status_code}')

    # Return API response as JSON if possible
    try:
        api_res = res.json()
        return jsonify(api_res)

    except JSONDecodeError:
        log.warning(f'API response is not JSON encoded.')
        return res.content
