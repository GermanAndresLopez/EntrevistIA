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

const INTERVIEW_TYPES = [
  { value: "conductual", label: "Conductual" },
  { value: "conductual-cargo", label: "Conductual + Cargo" },
] as const;

const InterviewForm = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [interviewType, setInterviewType] = useState<string>("conductual");
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState<string>("intermedio");
  const [amount, setAmount] = useState(5);

  const isCargo = interviewType === "conductual-cargo";

  const handleSubmit = async () => {
    if (isCargo && !role.trim()) {
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
          body: JSON.stringify({
            interviewType,
            role: isCargo ? role : "Competencias Generales",
            experience,
            amount,
            userid: userId,
          }),
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
            <h3>Nueva entrevista</h3>
            <p className="text-sm text-light-400">
              Elegí el tipo de entrevista y configurá los parámetros
            </p>
          </div>

          {/* Tipo de entrevista */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-semibold">Tipo de entrevista</label>
            <div className="flex gap-2">
              {INTERVIEW_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setInterviewType(value)}
                  className={`flex-1 py-3 px-4 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                    interviewType === value
                      ? "bg-primary-200 text-white border-primary-200 shadow-sm"
                      : "bg-white text-light-100 border-light-800 hover:border-primary-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-light-400 mt-1">
              {isCargo
                ? "Preguntas específicas para el cargo que indiques."
                : "10 preguntas de competencias generales (adaptabilidad, trabajo en equipo, liderazgo, etc.)."
              }
            </p>
          </div>

          {/* Cargo (solo para Conductual + Cargo) */}
          {isCargo && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-light-100 font-semibold">Cargo o rol</label>
              <input
                className="bg-white rounded-full min-h-12 px-5 text-light-100 placeholder:text-light-600 border border-light-800 focus:outline-none focus:border-primary-200 transition-colors"
                placeholder="Ej: Secretariado Gerencial, Auxiliar de RRHH, Asistente Administrativo..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          {/* Experiencia */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-semibold">Nivel de experiencia</label>
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

          {/* Cantidad */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-semibold">Número de preguntas</label>
            <div className="flex gap-3">
              {AMOUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setAmount(n)}
                  className={`w-12 h-12 rounded-full text-sm font-bold border transition-all cursor-pointer ${
                    amount === n
                      ? "bg-primary-200 text-white border-primary-200"
                      : "bg-white text-light-100 border-light-800 hover:border-primary-200"
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
