import logging
from datetime import datetime
from flask_babel import gettext
from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from followthemoney import model
from followthemoney.types import registry
from followthemoney.exc import InvalidData

from aleph.core import db
from aleph.model.collection import Collection
from aleph.model.common import DatedModel
from aleph.model.common import iso_text, make_textid, ENTITY_ID_LEN

from aleph.model.role import Role

log = logging.getLogger(__name__)


class AnnotatedEntity(db.Model, DatedModel):
    """
    Holds annotations created by users
    """
    __tablename__ = "annotated_entity"

    ACCEPTED = "accepted"
    REJECTED = "rejected"
    SKIPPED = "skipped"
    STATUS_TYPES = [ACCEPTED, REJECTED, SKIPPED]

    id = db.Column(db.Integer, primary_key=True)

    annotations = db.Column("annotations", JSONB)  # array of spacy-ents format (one per each page)
    status_type = db.Column(db.Enum(*STATUS_TYPES, name="status_type"), nullable=True)
    entity_id = db.Column(
        db.String(ENTITY_ID_LEN), index=True
    )
    collection_id = db.Column(
        db.Integer, db.ForeignKey("collection.id"), nullable=False, index=True
    )  # noqa
    collection = db.relationship(
        Collection, backref=db.backref("annotated_entities", lazy="dynamic")
    )  # noqa

    author_id = db.Column(db.Integer, db.ForeignKey("role.id"), index=True)
    author = db.relationship(Role, backref=db.backref("annotated_entities", lazy="dynamic"))  # noqa

    __table_args__ = (UniqueConstraint('entity_id', 'author_id', name='_entity_role_uc'),)

    @classmethod
    def by_entity_and_author(cls, entity_id, author_id):
        q = cls.all().filter_by(entity_id=entity_id, author_id=author_id)

        return q.first()

    def __repr__(self):
        return "<AnnotatedEntity(%r, %r)>" % (self.id, self.annotations)