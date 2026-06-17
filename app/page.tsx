import Link from "next/link";
import Image from "next/image";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { Mic, BarChart2, MessageSquare, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import WarmBackground from "@/components/WarmBackground";

const features = [
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Entrevistas con voz real",
    description: "Conversá con un entrevistador de IA que te hace preguntas conductuales adaptadas a tu cargo y nivel de experiencia.",
    color: "bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Retroalimentación detallada",
    description: "Recibí un análisis de tu comunicación, confianza, profesionalismo y claridad — con puntaje por categoría.",
    color: "bg-amber-50 border-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Transcripción completa",
    description: "Revisá exactamente qué escuchó la IA — identificá muletillas, pausas y áreas de mejora en tu forma de hablar.",
    color: "bg-rose-50 border-rose-100",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

const steps = [
  { step: "01", title: "Creá tu cuenta", description: "Registrate en segundos con tu correo electrónico. Sin tarjeta de crédito." },
  { step: "02", title: "Elegí tu cargo", description: "Ingresá el puesto al que aplicás y tu nivel de experiencia." },
  { step: "03", title: "Practicá y mejorá", description: "Realizá la entrevista, revisá tu retroalimentación y volvé a practicar." },
];

const benefits = [
  "Preguntas conductuales personalizadas por cargo",
  "Evaluación de comunicación y profesionalismo",
  "Detección de muletillas y falta de claridad",
  "Transcripción completa para auto-revisión",
  "Plantillas de entrevistas por área profesional",
  "100% gratuito, sin límites",
];

export default async function LandingPage() {
  const userAuthenticated = await isAuthenticated();

  return (
    <div className="min-h-screen text-[#1c1917] overflow-x-hidden">
      <WarmBackground />

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#fffbf5]/90 backdrop-blur-md border-b border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="EntrevistIA" width={36} height={36} />
            <span className="text-lg font-bold text-orange-600">EntrevistIA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#57534e]">
            <a href="#features" className="hover:text-[#1c1917] transition-colors">Funciones</a>
            <a href="#how-it-works" className="hover:text-[#1c1917] transition-colors">Cómo funciona</a>
          </nav>

          <div className="flex items-center gap-3">
            {userAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-all">
                Ir al Panel <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="px-4 py-2 text-sm text-[#57534e] hover:text-[#1c1917] transition-colors">
                  Iniciar sesión
                </Link>
                <Link href="/sign-up" className="px-4 py-2 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-all shadow-sm">
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-32 px-6 md:px-12 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-sm font-medium mb-8">
            ✨ Entrevistas conductuales con IA
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-[#1c1917] leading-tight mb-6">
            Practicá entrevistas de trabajo
            <span className="block text-orange-600 mt-2">como si fuera el día real</span>
          </h1>

          <p className="text-lg md:text-xl text-[#57534e] max-w-2xl mx-auto mb-10 leading-relaxed">
            Un entrevistador de IA te hace preguntas conductuales adaptadas a tu cargo, escucha tus respuestas y te da retroalimentación detallada sobre tu comunicación, confianza y profesionalismo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {userAuthenticated ? (
              <Link href="/dashboard" className="flex items-center gap-2 px-8 py-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-base transition-all shadow-lg shadow-orange-200">
                Ir a mi Panel <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link href="/sign-up" className="flex items-center gap-2 px-8 py-4 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-base transition-all shadow-lg shadow-orange-200">
                  Comenzar gratis <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/sign-in" className="px-8 py-4 rounded-full bg-white border border-[#e7e5e4] text-[#1c1917] hover:bg-orange-50 font-semibold text-base transition-all shadow-sm">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>

          <p className="text-[#78716c] text-sm mt-4">Sin tarjeta de crédito · 100% gratuito</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-12 bg-white border-y border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1917] mb-4">
              Todo lo que necesitás para mejorar en entrevistas
            </h2>
            <p className="text-[#57534e] text-lg max-w-2xl mx-auto">
              No más practicar solo frente al espejo. EntrevistIA te da retroalimentación real sobre cómo hablás.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className={`flex flex-col gap-5 p-8 rounded-3xl border ${f.color} transition-all hover:shadow-md`}>
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${f.iconBg} ${f.iconColor}`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1c1917] mb-2">{f.title}</h3>
                  <p className="text-[#44403c] text-[15px] font-medium leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1c1917] mb-6">
                ¿Por qué EntrevistIA?
              </h2>
              <p className="text-[#57534e] text-lg mb-8 leading-relaxed">
                Las entrevistas conductuales son las más comunes y las menos practicadas. EntrevistIA te ayuda a estructurar mejor tus respuestas y hablar con más seguridad.
              </p>
              <ul className="flex flex-col gap-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-3 text-[#1c1917] font-medium">
                    <CheckCircle className="h-5 w-5 text-orange-600 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-lg shrink-0">🤖</div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-orange-100 text-sm text-[#292524]">
                    Buenos días. Gracias por tu tiempo. Vamos a comenzar. Contame sobre una situación en la que tuviste que trabajar bajo mucha presión. ¿Cómo lo manejaste?
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-orange-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-sm text-white max-w-[80%]">
                    En mi trabajo anterior tuve que entregar un proyecto en 48 horas...
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg shrink-0">👤</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-lg shrink-0">🤖</div>
                  <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-orange-100 text-sm text-[#292524]">
                    Claro, esa situación de presión.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 bg-white border-y border-[#e7e5e4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1c1917] mb-4">Cómo funciona</h2>
            <p className="text-[#57534e] text-lg">Tres pasos simples para mejorar tus entrevistas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative flex flex-col items-center text-center gap-4">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+3rem)] right-[-calc(50%-3rem)] h-px bg-gradient-to-r from-orange-300/60 to-transparent" />
                )}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 text-2xl font-bold text-orange-600">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-[#1c1917]">{s.title}</h3>
                <p className="text-[#44403c] text-[15px] font-medium max-w-xs">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl px-12 py-16 shadow-xl shadow-orange-200">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para practicar?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Creá tu cuenta gratis y realizá tu primera entrevista en menos de 5 minutos.
            </p>
            <Link
              href={userAuthenticated ? "/dashboard" : "/sign-up"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-orange-600 font-bold text-base hover:bg-orange-50 transition-all shadow-md"
            >
              {userAuthenticated ? "Ir al Panel" : "Empezar ahora"} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e7e5e4] py-8 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="EntrevistIA" width={28} height={28} />
            <span className="text-sm font-semibold text-[#57534e]">EntrevistIA</span>
          </div>
          <p className="text-[#78716c] text-sm">
            © {new Date().getFullYear()} EntrevistIA. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
