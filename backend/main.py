from datetime import datetime
from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from arduino_reader import read_pressure_data
from session_store import (
    append_sample,
    create_patient,
    end_session,
    get_patient,
    get_session,
    list_patients,
    list_sessions,
    start_session,
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientPayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    identifier: Optional[str] = Field(default=None, max_length=60)
    age: Optional[int] = Field(default=None, ge=1, le=120)


class SessionPayload(BaseModel):
    note: Optional[str] = Field(default=None, max_length=240)


class SamplePayload(BaseModel):
    sensor_readings: Dict[str, float]
    timestamp: Optional[datetime] = None


@app.get("/")
def root():
    return {"message": "API da GaitVision ativa 🚀"}


@app.get("/pressao")
def get_pressao():
    try:
        data = read_pressure_data()
        return {"pressao": data}
    except Exception as exc:
        return {"error": str(exc)}


@app.get("/patients")
def api_list_patients():
    return list_patients()


@app.post("/patients")
def api_create_patient(payload: PatientPayload):
    try:
        return create_patient(payload.name, identifier=payload.identifier, age=payload.age)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/patients/{patient_id}")
def api_get_patient(patient_id: str):
    try:
        return get_patient(patient_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@app.post("/patients/{patient_id}/sessions")
def api_start_session(patient_id: str, payload: SessionPayload):
    try:
        return start_session(patient_id, payload.note)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/patients/{patient_id}/sessions")
def api_list_sessions(patient_id: str):
    return list_sessions(patient_id)


@app.post("/sessions/{session_id}/data")
def api_append_sample(session_id: str, payload: SamplePayload):
    try:
        timestamp = payload.timestamp.isoformat() if payload.timestamp else None
        return append_sample(session_id, payload.sensor_readings, timestamp=timestamp)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/sessions/{session_id}/end")
def api_end_session(session_id: str):
    try:
        return end_session(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/sessions/{session_id}")
def api_get_session(session_id: str):
    try:
        return get_session(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
