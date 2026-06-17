"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AMOUNTS = [5, 8, 10];

const EXPERIENCE_LEVELS = [
  { value: "sin-experiencia", label: "Sin experiencia" },
  { value: "novato", label: "Novato" },
  { value: "intermedio", label: "Intermedio" },
  { value: "avanzado", label: "Avanzado" },
] as const;

const InterviewForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState<string>("intermedio");
  const [amount, setAmount] = useState(5);

  const handleSubmit = async () => {
    if (!role.trim()) {
      setError("Por favor indicá el cargo o rol.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}api/vapi/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, experience, amount, userid: userId }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error("Error al generar la entrevista.");
      router.push(`/interview/${data.interviewId}`);
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6">
      <div className="card-border w-full">
        <div className="card p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-primary-100">Nueva entrevista</h3>
            <p className="text-sm text-light-400">
              Indicá el cargo y te generamos preguntas conductuales personalizadas
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">Cargo o rol</label>
            <input
              className="bg-white rounded-full min-h-12 px-5 text-light-100 placeholder:text-light-600 border border-light-800 focus:outline-none focus:border-primary-200 transition-colors"
              placeholder="Ej: Gerente de ventas, Coordinador de RRHH, Analista..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">Nivel de experiencia</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="bg-white rounded-full min-h-12 px-5 text-light-100 border border-light-800 focus:outline-none focus:border-primary-200 transition-colors appearance-none cursor-pointer"
            >
              {EXPERIENCE_LEVELS.map(({ value, label }) => (
                <option key={value} value={value} className="bg-white">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">Número de preguntas</label>
            <div className="flex gap-3">
              {AMOUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setAmount(n)}
                  className={`w-12 h-12 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                    amount === n
                      ? "bg-primary-200 text-dark-100 border-primary-200"
                      : "bg-white text-light-400 border-light-800 hover:border-primary-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-destructive-100 text-sm text-center">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full min-h-12 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Generando entrevista..." : "Comenzar entrevista"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;
