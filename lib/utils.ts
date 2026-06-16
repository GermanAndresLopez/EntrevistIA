import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    })),
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

export const getRoleDisplay = (role: string): { emoji: string; gradient: string } => {
  const r = role.toLowerCase();
  if (/l[ií]der|gerente|director|manager|supervisor|jefe|coordinador/.test(r))
    return { emoji: "👔", gradient: "from-blue-700 to-blue-900" };
  if (/rrhh|recursos humanos|talento|reclutamiento|selección|personal/.test(r))
    return { emoji: "🤝", gradient: "from-violet-700 to-violet-900" };
  if (/venta|comercial|ejecutivo de cuenta|asesor comercial|representante/.test(r))
    return { emoji: "📈", gradient: "from-emerald-700 to-emerald-900" };
  if (/marketing|publicidad|marca|contenido|community|digital/.test(r))
    return { emoji: "📣", gradient: "from-pink-700 to-pink-900" };
  if (/finanz|contab|audit|tesorero|presupuesto|costos/.test(r))
    return { emoji: "💼", gradient: "from-amber-700 to-amber-900" };
  if (/logística|operaciones|supply|almacén|inventario|compras/.test(r))
    return { emoji: "🚚", gradient: "from-orange-700 to-orange-900" };
  if (/servicio al cliente|atención|soporte|call center|helpdesk/.test(r))
    return { emoji: "🎯", gradient: "from-teal-700 to-teal-900" };
  if (/salud|médico|enfermería|psicolog|terapeuta|clínico/.test(r))
    return { emoji: "🏥", gradient: "from-red-700 to-red-900" };
  if (/educaci|docente|profesor|capacitaci|formaci/.test(r))
    return { emoji: "📚", gradient: "from-cyan-700 to-cyan-900" };
  if (/legal|abogado|jurídico|compliance|contratos/.test(r))
    return { emoji: "⚖️", gradient: "from-slate-700 to-slate-900" };
  return { emoji: "🏆", gradient: "from-indigo-700 to-indigo-900" };
};
