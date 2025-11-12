import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPatient, fetchPatients, fetchSessions, startSession } from "../lib/api";
import { Patient, SessionSummary } from "../types";
import { useAuth } from "../contexts/AuthContext";

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [patientForm, setPatientForm] = useState({
    name: "",
    identifier: "",
    age: "",
  });
  const [sessionNote, setSessionNote] = useState("");
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === selectedPatientId) ?? null,
    [patients, selectedPatientId],
  );

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    return patients.filter((patient) =>
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      (patient.identifier ?? "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [patients, search]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const data = await fetchPatients();
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatientId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        setStatusMessage((error as Error).message);
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedPatientId) {
        setSessions([]);
        return;
      }
      try {
        setLoadingSessions(true);
        const data = await fetchSessions(selectedPatientId);
        setSessions(data);
      } catch (error) {
        console.error(error);
        setStatusMessage((error as Error).message);
      } finally {
        setLoadingSessions(false);
      }
    };
    loadSessions();
  }, [selectedPatientId]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [statusMessage]);

  const handleCreatePatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!patientForm.name.trim()) return;
    setIsSubmittingPatient(true);
    try {
      const newPatient = await createPatient({
        name: patientForm.name.trim(),
        identifier: patientForm.identifier.trim() || undefined,
        age: patientForm.age ? Number(patientForm.age) : undefined,
      });
      setPatients((prev) => [newPatient, ...prev]);
      setSelectedPatientId(newPatient.id);
      setPatientForm({ name: "", identifier: "", age: "" });
      setStatusMessage("Paciente cadastrado com sucesso.");
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setIsSubmittingPatient(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedPatientId || !selectedPatient) return;
    setIsStartingSession(true);
    try {
      const session = await startSession(selectedPatientId, sessionNote || null);
      setStatusMessage("Sessão iniciada!");
      navigate(`/session/${session.id}`, {
        state: { patient: selectedPatient },
      });
    } catch (error) {
      setStatusMessage((error as Error).message);
    } finally {
      setIsStartingSession(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-purple-500 font-semibold">GaitVision Rehab</p>
            <h1 className="text-2xl font-bold text-slate-900">Painel do fisioterapeuta</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-500">Conectado como</p>
              <p className="font-semibold text-slate-900">{user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-100 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Cadastrar novo paciente</h2>
            <form className="space-y-4" onSubmit={handleCreatePatient}>
              <div>
                <label className="text-sm font-medium text-slate-600">Nome completo *</label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                  value={patientForm.name}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Maria Ana - Paciente hemiplégica"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Identificador/Prontuário</label>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                    value={patientForm.identifier}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, identifier: event.target.value }))}
                    placeholder="PBL-2025-01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Idade</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 mt-1 focus:ring-2 focus:ring-purple-300 focus:outline-none"
                    value={patientForm.age}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, age: event.target.value }))}
                    placeholder="65"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmittingPatient}
                className="w-full md:w-auto bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-200 hover:opacity-95 transition disabled:opacity-50"
              >
                {isSubmittingPatient ? "Salvando..." : "Salvar paciente"}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Pacientes cadastrados</h2>
              <span className="text-sm text-slate-500">
                {loadingPatients ? "carregando..." : `${patients.length} registro(s)`}
              </span>
            </div>
            <input
              type="search"
              placeholder="Buscar pelo nome ou prontuário"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  className={`w-full text-left border rounded-2xl px-4 py-3 transition ${
                    patient.id === selectedPatientId
                      ? "border-brand-purple/60 bg-purple-50"
                      : "border-slate-200 hover:border-brand-purple/30"
                  }`}
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-sm text-slate-500">
                    {patient.identifier || "Sem identificador"} • cadastrado em{" "}
                    {new Date(patient.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </button>
              ))}
              {!filteredPatients.length && !loadingPatients && (
                <p className="text-sm text-slate-500 text-center py-10">
                  Nenhum paciente encontrado. Cadastre o primeiro na aba ao lado.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-purple-500 font-semibold">Sessões</p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {selectedPatient ? `Sessões de ${selectedPatient.name}` : "Selecione um paciente"}
              </h2>
            </div>
            {selectedPatient && (
              <div className="flex flex-wrap gap-3">
                <textarea
                  placeholder="Notas rápidas antes de iniciar"
                  value={sessionNote}
                  onChange={(event) => setSessionNote(event.target.value)}
                  className="min-w-[240px] border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-300"
                  rows={2}
                />
                <button
                  onClick={handleStartSession}
                  disabled={isStartingSession}
                  className="bg-gradient-to-r from-brand-purple to-brand-pink text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-purple-200 hover:opacity-95 transition disabled:opacity-50"
                >
                  {isStartingSession ? "Iniciando..." : "Iniciar sessão"}
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {loadingSessions && <p>Carregando histórico...</p>}
            {!loadingSessions &&
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-brand-purple/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {new Date(session.start_time).toLocaleString("pt-BR")}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        session.end_time
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {session.end_time ? "Encerrada" : "Em andamento"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">Máx: {session.max_pressure_kpa.toFixed(1)} kPa</p>
                  <p className="text-sm text-slate-500">Amostras: {session.sample_count}</p>
                  <button
                    className="text-brand-purple text-sm font-semibold"
                    onClick={() =>
                      navigate(`/session/${session.id}`, { state: { patient: selectedPatient } })
                    }
                  >
                    Ver sessão
                  </button>
                </div>
              ))}
            {!loadingSessions && sessions.length === 0 && (
              <p className="text-slate-500">Ainda não há sessões registradas para este paciente.</p>
            )}
          </div>
        </section>

        {statusMessage && (
          <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg">
            {statusMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
