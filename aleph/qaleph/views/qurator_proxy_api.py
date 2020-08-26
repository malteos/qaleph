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

    if request.args:
        # Forward data
        api_kwargs['json'] = request.args

    log.info(f'Forward API request to: {api_url}')

    res = requests.request(
        request.method,
        api_url,
        auth=HTTPBasicAuth(QURATOR_API_USER, QURATOR_API_PASSWORD),
        **api_kwargs
    )

    # Return API response as JSON if possible
    try:
        api_res = res.json()
        return jsonify(api_res)

    except JSONDecodeError:
        return res.content
