import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-10 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">GaitVision Rehab</p>
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === "login" ? "Bem-vindo(a) de volta" : "Crie sua conta"}
          </h1>
          <p className="text-sm text-slate-500">
            Plataforma para análise de pressão plantar com foco em fisioterapia.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@clinica.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={4}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-brand-purple to-brand-pink text-white rounded-xl py-3 font-semibold shadow-lg shadow-purple-200 hover:opacity-95 transition disabled:opacity-60"
          >
            {isSubmitting ? "Entrando..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="text-sm text-center text-slate-500">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button className="text-brand-purple font-semibold" onClick={() => setMode("register")}>
                Cadastre-se
              </button>
            </>
          ) : (
            <>
              Já possui conta?{" "}
              <button className="text-brand-purple font-semibold" onClick={() => setMode("login")}>
                Fazer login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
