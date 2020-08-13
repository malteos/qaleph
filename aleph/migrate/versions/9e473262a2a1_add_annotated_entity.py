"""add annotated entity

Revision ID: 9e473262a2a1
Revises: aa486b9e627e
Create Date: 2020-08-10 10:30:54.237224

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "9e473262a2a1"
down_revision = "aa486b9e627e"


def upgrade():
    op.create_table(
        "annotated_entity",
        sa.Column("created_at", sa.DateTime(), nullable=True),  # noqa
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("annotations", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "status_type", sa.Enum("accepted", "rejected", "skipped", name="status_type"), nullable=False
        ),
        sa.Column("entity_id", sa.String(length=128), nullable=False),
        sa.Column("collection_id", sa.Integer(), nullable=True),
        sa.Column("author_id", sa.Integer()),
        sa.ForeignKeyConstraint(["collection_id"], ["collection.id"],),
        sa.ForeignKeyConstraint(["author_id"], ["role.id"],),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_annotated_entity_entity_role_uc"), "annotated_entity", ['entity_id', 'author_id'], unique=True
    )  # noqa


def downgrade():
    op.drop_table("annotated_entity")
