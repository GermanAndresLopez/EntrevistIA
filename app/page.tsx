import Link from "next/link";
import Image from "next/image";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { isAuthenticated } from "@/lib/actions/auth.action";
import {
  Mic,
  FileText,
  Search,
  ArrowRight,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Star,
} from "lucide-react";

const features = [
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Entrevistas con IA",
    description:
      "Practica entrevistas técnicas y conductuales con nuestro agente de voz. Recibe retroalimentación detallada e instantánea.",
    href: "/dashboard",
    badge: null,
    color: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Creador de CV con IA",
    description:
      "Genera hojas de vida profesionales en los formatos que las empresas más solicitan, adaptadas a tu rol objetivo.",
    href: "/cv-creator",
    badge: "Nuevo",
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Análisis de CV con IA",
    description:
      "Compara tu CV contra ofertas laborales y obtén score ATS, palabras clave faltantes y sugerencias de mejora.",
    href: "/cv-analyzer",
    badge: "Nuevo",
    color: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
  },
];

const steps = [
  {
    step: "01",
    title: "Crea tu cuenta",
    description: "Regístrate en segundos con tu correo electrónico.",
  },
  {
    step: "02",
    title: "Elige tu módulo",
    description:
      "Practica una entrevista, crea tu CV o analiza tu perfil laboral.",
  },
  {
    step: "03",
    title: "Obtén retroalimentación",
    description:
      "Recibe insights accionables con IA para acelerar tu carrera.",
  },
];



export default async function LandingPage() {
  const userAuthenticated = await isAuthenticated();

  return (
    <div className="min-h-screen bg-[#030303] text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-[#030303]/80 backdrop-blur-md border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="EntrevistIA Logo" width={36} height={36} />
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-violet-300">
            Entrenamiento de Entrevistas con IA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">
            Módulos
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            Cómo funciona
          </a>
          
        </nav>

        <div className="flex items-center gap-3">
          {userAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
            >
              Ir al Panel <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
              >
                Crear cuenta gratis
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative">
        <HeroGeometric
          badge="Plataforma de Carrera con IA"
          title1="Impulsa tu Carrera"
          title2="con Inteligencia Artificial"
        >
          {userAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]"
            >
              Ir a mi Panel <ArrowRight className="h-5 w-5" />
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/sign-up"
                className="flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]"
              >
                Comenzar gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-4 rounded-full bg-white/[0.05] border border-white/[0.12] text-white/80 hover:text-white hover:bg-white/[0.1] font-semibold text-base transition-all"
              >
                Iniciar sesión
              </Link>
            </div>
          )}
          <p className="text-white/30 text-sm mt-2">
            Sin tarjeta de crédito · Gratis para empezar
          </p>
        </HeroGeometric>
      </section>

      {/* ─── Features / Modules ─── */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Tres módulos poderosos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Todo lo que necesitas para{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              conseguir tu trabajo ideal
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Desde practicar entrevistas hasta optimizar tu CV, tenemos todas las
            herramientas que necesitas en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={userAuthenticated ? feature.href : "/sign-up"}
              className={`group relative flex flex-col gap-5 p-8 rounded-3xl bg-gradient-to-br border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${feature.color}`}
            >
              {feature.badge && (
                <span className="absolute top-6 right-6 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
                  {feature.badge}
                </span>
              )}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.05] ${feature.iconColor}`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white/60 group-hover:text-white transition-colors mt-auto">
                Explorar <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section
        id="how-it-works"
        className="py-24 px-6 md:px-12 bg-white/[0.02] border-y border-white/[0.06]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Cómo funciona
            </h2>
            <p className="text-white/50 text-lg">
              Tres pasos simples para transformar tu búsqueda de empleo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center gap-4">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] right-[-calc(50%-3rem)] h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
                )}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/10 border border-indigo-400/30 text-2xl font-bold text-indigo-300">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-white">{s.title}</h3>
                <p className="text-white/50 text-sm max-w-xs">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
     
      {/* ─── Footer ─── */}
      <footer className="border-t border-white/[0.06] py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EntrevistIA " width={28} height={28} />
            <span className="text-sm font-semibold text-white/70">EntrevistIA </span>
          </div>
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} EntrevistIA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
