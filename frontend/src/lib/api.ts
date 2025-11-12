import { Patient, Pressao, SessionDetail, SessionSummary } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let detail = "Erro ao comunicar com a API.";
    try {
      const payload = await response.json();
      detail = payload.detail ?? payload.error ?? detail;
    } catch {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function fetchPatients(): Promise<Patient[]> {
  return request<Patient[]>("/patients");
}

export async function fetchPatient(patientId: string): Promise<Patient> {
  return request<Patient>(`/patients/${patientId}`);
}

export async function createPatient(payload: {
  name: string;
  identifier?: string | null;
  age?: number | null;
}): Promise<Patient> {
  return request<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchSessions(patientId: string): Promise<SessionSummary[]> {
  return request<SessionSummary[]>(`/patients/${patientId}/sessions`);
}

export async function startSession(patientId: string, note?: string | null): Promise<SessionSummary> {
  return request<SessionSummary>(`/patients/${patientId}/sessions`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export async function fetchSession(sessionId: string): Promise<SessionDetail> {
  return request<SessionDetail>(`/sessions/${sessionId}`);
}

export async function appendSessionSample(
  sessionId: string,
  sensor_readings: Pressao,
  timestamp: string,
): Promise<SessionSummary> {
  return request<SessionSummary>(`/sessions/${sessionId}/data`, {
    method: "POST",
    body: JSON.stringify({ sensor_readings, timestamp }),
  });
}

export async function endSession(sessionId: string): Promise<SessionSummary> {
  return request<SessionSummary>(`/sessions/${sessionId}/end`, {
    method: "POST",
  });
}

export async function fetchPressure(): Promise<Pressao | null> {
  const data = await request<{ pressao?: Pressao }>("/pressao");
  return data.pressao ?? null;
}

export const api = {
  fetchPatients,
  fetchPatient,
  createPatient,
  fetchSessions,
  startSession,
  fetchSession,
  appendSessionSample,
  endSession,
  fetchPressure,
};

export default api;
