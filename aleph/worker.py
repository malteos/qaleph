import logging
from servicelayer.jobs import Dataset
from servicelayer.worker import Worker

from aleph.core import kv, db, create_app
from aleph.model import Collection
from aleph.queues import get_rate_limit
from aleph.queues import OP_INDEX, OP_REINDEX, OP_REINGEST, OP_XREF
from aleph.queues import OP_LOAD_MAPPING, OP_FLUSH_MAPPING
from aleph.logic.alerts import check_alerts
from aleph.logic.collections import compute_collections, refresh_collection
from aleph.logic.collections import reindex_collection, reingest_collection
from aleph.logic.notifications import generate_digest
from aleph.logic.mapping import load_mapping, flush_mapping
from aleph.logic.roles import update_roles
from aleph.logic.xref import xref_collection
from aleph.logic.processing import index_many

log = logging.getLogger(__name__)
app = create_app()

# All stages that aleph should listen for. Does not include ingest,
# which is received and processed by the ingest-file service.
OPERATIONS = (
    OP_INDEX,
    OP_XREF,
    OP_REINGEST,
    OP_REINDEX,
    OP_LOAD_MAPPING,
    OP_FLUSH_MAPPING,
)


class AlephWorker(Worker):
    def boot(self):
        self.often = get_rate_limit("often", unit=300, interval=1, limit=1)
        self.hourly = get_rate_limit("hourly", unit=3600, interval=1, limit=1)
        self.daily = get_rate_limit("daily", unit=3600, interval=24, limit=1)

    def run_often(self):
        log.info("Self-check...")
        self.cleanup_jobs()
        compute_collections()

        if self.hourly.check():
            self.hourly.update()
            log.info("Running hourly tasks...")
            check_alerts()

        if self.daily.check():
            self.daily.update()
            log.info("Running daily tasks...")
            generate_digest()
            update_roles()

    def periodic(self):
        with app.app_context():
            db.session.remove()
            if self.often.check():
                self.often.update()
                self.run_often()

    def dispatch_task(self, collection, task):
        stage = task.stage
        payload = task.payload
        sync = task.context.get("sync", False)
        if stage.stage == OP_INDEX:
            index_many(stage, collection, sync=sync, **payload)
        if stage.stage == OP_LOAD_MAPPING:
            load_mapping(stage, collection, **payload)
        if stage.stage == OP_FLUSH_MAPPING:
            flush_mapping(stage, collection, sync=sync, **payload)
        if stage.stage == OP_REINGEST:
            reingest_collection(collection, job_id=stage.job.id, **payload)
        if stage.stage == OP_REINDEX:
            reindex_collection(collection, sync=sync, **payload)
        if stage.stage == OP_XREF:
            xref_collection(stage, collection)
        log.info("Task [%s]: %s (done)", task.job.dataset, stage.stage)

    def handle(self, task):
        with app.app_context():
            collection = Collection.by_foreign_id(task.job.dataset.name)
            if collection is None:
                log.error("Collection not found: %s", task.job.dataset)
                return
            self.dispatch_task(collection, task)

    def cleanup_job(self, job):
        if job.is_done():
            collection = Collection.by_foreign_id(job.dataset.name)
            if collection is not None:
                refresh_collection(collection.id)
            job.remove()

    def cleanup_jobs(self):
        for dataset in Dataset.get_active_datasets(kv):
            for job in dataset.get_jobs():
                self.cleanup_job(job)

    def after_task(self, task):
        with app.app_context():
            self.cleanup_job(task.job)


def get_worker():
    log.info("Worker active, stages: %s", OPERATIONS)
    return AlephWorker(conn=kv, stages=OPERATIONS, num_threads=None)
