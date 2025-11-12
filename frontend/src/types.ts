export type Pressao = Record<string, number>;

export interface Patient {
  id: string;
  name: string;
  identifier?: string | null;
  age?: number | null;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  patient_id: string;
  note?: string | null;
  start_time: string;
  end_time?: string | null;
  sample_count: number;
  max_pressure_kpa: number;
  duration_seconds?: number | null;
  region_averages: Record<string, number>;
}

export interface SessionDetail extends SessionSummary {
  samples?: Array<{
    timestamp: string;
    pressures: Pressao;
  }>;
}

export interface AuthUser {
  email: string;
  name: string;
}
