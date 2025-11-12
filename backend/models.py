from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


def _uuid() -> str:
    return str(uuid4())


class Physiotherapist(Base):
    __tablename__ = "physiotherapists"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    patients: Mapped[list["Patient"]] = relationship("Patient", back_populates="physiotherapist")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    physiotherapist_id: Mapped[str] = mapped_column(String(36), ForeignKey("physiotherapists.id"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    identifier: Mapped[str | None] = mapped_column(String(60), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    physiotherapist: Mapped[Physiotherapist] = relationship("Physiotherapist", back_populates="patients")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="patient")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    patient_id: Mapped[str] = mapped_column(String(36), ForeignKey("patients.id"), index=True)
    physiotherapist_id: Mapped[str] = mapped_column(String(36), ForeignKey("physiotherapists.id"), index=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sample_count: Mapped[int] = mapped_column(Integer, default=0)
    max_pressure_kpa: Mapped[float] = mapped_column(Float, default=0)

    patient: Mapped[Patient] = relationship("Patient", back_populates="sessions")
    physiotherapist: Mapped[Physiotherapist] = relationship("Physiotherapist")
    samples: Mapped[list["PressureSample"]] = relationship(
        "PressureSample", back_populates="session", cascade="all, delete-orphan"
    )


class PressureSample(Base):
    __tablename__ = "pressure_samples"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    pressures: Mapped[dict | None] = mapped_column(JSONB)

    session: Mapped[Session] = relationship("Session", back_populates="samples")
