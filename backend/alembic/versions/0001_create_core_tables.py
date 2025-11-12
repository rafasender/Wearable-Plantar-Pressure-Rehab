"""create core tables

Revision ID: 0001
Revises: 
Create Date: 2025-01-04
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "physiotherapists",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=func.now()),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "patients",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("physiotherapist_id", sa.String(length=36), sa.ForeignKey("physiotherapists.id"), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("identifier", sa.String(length=60)),
        sa.Column("age", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=func.now()),
    )
    op.create_index("ix_patients_physio", "patients", ["physiotherapist_id"])

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("patient_id", sa.String(length=36), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("physiotherapist_id", sa.String(length=36), sa.ForeignKey("physiotherapists.id"), nullable=False),
        sa.Column("note", sa.Text()),
        sa.Column("start_time", sa.DateTime(timezone=True), server_default=func.now()),
        sa.Column("end_time", sa.DateTime(timezone=True)),
        sa.Column("sample_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("max_pressure_kpa", sa.Float(), server_default="0", nullable=False),
    )
    op.create_index("ix_sessions_patient", "sessions", ["patient_id"])

    op.create_table(
        "pressure_samples",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("session_id", sa.String(length=36), sa.ForeignKey("sessions.id"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=func.now()),
        sa.Column("pressures", postgresql.JSONB()),
    )
    op.create_index("ix_samples_session", "pressure_samples", ["session_id"])


def downgrade() -> None:
    op.drop_index("ix_samples_session", table_name="pressure_samples")
    op.drop_table("pressure_samples")
    op.drop_index("ix_sessions_patient", table_name="sessions")
    op.drop_table("sessions")
    op.drop_index("ix_patients_physio", table_name="patients")
    op.drop_table("patients")
    op.drop_table("physiotherapists")
