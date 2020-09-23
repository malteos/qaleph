import json
import logging
import os

import requests
from followthemoney.types import registry
from ftmstore import Dataset
from requests.auth import HTTPBasicAuth
from servicelayer.worker import Worker

log = logging.getLogger(__name__)
OP_CWM = "cwm"

CWM_USER = os.environ.get("CWM_USER", "qurator")
CWM_PASSWORD = os.environ.get("CWM_PASSWORD", "dd17f230-a879-48cf-9220-55b4fcd4b941")
CWM_WORKFLOW_ID = os.environ.get("CWM_WORKFLOW_ID", "QuratorWF2_104")


class ServiceWorker(Worker):
    """A long running task runner that uses Redis as a task queue"""

    def dispatch_next(self, task, entity_ids):
        if not len(entity_ids):
            return
        pipeline = task.context.get("pipeline")
        if pipeline is None or not len(pipeline):
            return
        # Find what the next index stage is:
        next_stage = pipeline.pop(0)
        stage = task.job.get_stage(next_stage)
        context = task.context
        context["pipeline"] = pipeline
        log.info("Sending %s entities to: %s", len(entity_ids), next_stage)
        stage.queue({"entity_ids": entity_ids}, context)

    @staticmethod
    def get_annotations(api_response):
        annotations = []
        for annotation in api_response['annotations']:
            annotations.append({
                'start': annotation['offset_ini'],
                'end': annotation['offset_end'],
                'labels': [label['itsrdf:taClassRef'].split('/')[-1] for label in annotation['labelUnits']]
            })
        return annotations

    def process_entity(self, writer, entity):
        if not entity.schema.is_a("Analyzable"):
            return

        # Get all the text parts of the entity:
        contents = entity.get_type_values(registry.text)
        if not len(contents):
            return
        log.info("Send to Qurator CWM %r", entity)

        # Get text fields
        texts = entity.get_type_values(registry.text)

        # join text chunks to single text
        text = '\n'.join(texts)

        # Send to CWM API
        res = requests.post(
            url=f'https://demo.qurator.ai/pub/srv-workflow/wfmanager/{CWM_WORKFLOW_ID}/processDocument?synchronous=true',
            json={'text': text},
            auth=HTTPBasicAuth(CWM_USER, CWM_PASSWORD),
            headers={'Content-Type': 'application/json'}
        )

        if res.status_code == 200:
            api_res = res.json()

            if 'annotations' in api_res:
                # entity.add('annotatedEntitiesPosition', self.get_annotations(api_res))
                annotations = json.dumps(self.get_annotations(api_res))
                entity.add('annotatedEntitiesPosition', annotations)

                log.info(f'Annotations saved for {entity}: {annotations}')

            if 'topics' in api_res:
                topics = api_res['topics']

                if isinstance(topics, list):
                    # List of topics
                    for topic in topics:
                        entity.add('annotatedTopics', topic)
                        log.info(f'Topic saved for {entity}: {topic}')
                else:
                    entity.add('annotatedTopics', topics)
                    log.info(f'Topics saved for {entity}: {topics}')

            # Send entity to writer
            writer.put(entity)

        else:
            log.error(f'CWM returned error: {res.text}')

    def handle(self, task):
        name = task.context.get("ftmstore", task.job.dataset.name)
        entity_ids = task.payload.get("entity_ids")
        dataset = Dataset(name, OP_CWM)
        try:
            writer = dataset.bulk()
            for entity in dataset.partials(entity_id=entity_ids):
                self.process_entity(writer, entity)
            writer.flush()
            self.dispatch_next(task, entity_ids)
        finally:
            dataset.close()

        log.info('task completed')
