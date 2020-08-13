from unittest import TestCase
from followthemoney import model
import requests
from requests.auth import HTTPBasicAuth

class CWMTest(TestCase):
    def test_api(self):

        text = 'Berlin ist die Hauptstadts Deutschland, und Angela Merkel wohnt hier als Bundespresidentin.'
        res = requests.post(
            url='https://demo.qurator.ai/pub/srv-workflow/wfmanager/QuratorWF1_102/processDocument?synchronous=true',
            json=dict(text=text),
            auth=HTTPBasicAuth('qurator', 'dd17f230-a879-48cf-9220-55b4fcd4b941'),
            headers={'Content-Type': 'application/json'}
        )
        
        self.assertEqual(200, res.status_code)
        
        r = res.json()

        def get_annotations(api_response):
            annotations = []
            for annotation in api_response['annotations']:
                annotations.append({
                    'start': annotation['offset_ini'],
                    'end': annotation['offset_end'],
                    'labels': [label['itsrdf:taClassRef'].split('/')[-1] for label in annotation['labelUnits']]
                })
            return annotations
                
        annos = get_annotations(r)

        print(annos)

        print(text.find('Deutschland'))
        print(text.find('Angela Merkel'))

    def test_entity_add(self):
        entity = model.make_entity("PlainText")
        entity.id = "foo"
        entity.add("indexText", "fooo bar")
        entity.add("annotatedEntitiesPosition", "fooo bar")

        self.assertEqual("foo", entity.id)

        print(entity)



