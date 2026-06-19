import "dayjs/locale/es";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

dayjs.locale("es");

import { getFeedbackByInterviewId, getInterviewById } from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getRoleDisplay } from "@/lib/utils";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/dashboard");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  const { emoji, gradient } = getRoleDisplay(interview.role);

  return (
    <section className="section-feedback">
      {/* Header */}
      <div className="flex flex-row justify-center items-center gap-4">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-lg`}>
          {emoji}
        </div>
        <h1 className="text-3xl font-bold capitalize">
          Retroalimentación — {interview.role}
        </h1>
      </div>

      {/* Score + date */}
      <div className="flex flex-row justify-center">
        <div className="flex flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src="/star.svg" width={22} height={22} alt="star" />
            <p>
              Puntaje general:{" "}
              <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>/100
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Image src="/calendar.svg" width={22} height={22} alt="calendar" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format("D [de] MMMM, YYYY h:mm A")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <hr />

      {/* Evaluación general */}
      <p className="text-light-100 leading-relaxed">{feedback?.finalAssessment}</p>

      {/* Desglose por categoría */}
      <div className="flex flex-col gap-4">
        <h2>Desglose por competencia</h2>
        {feedback?.categoryScores?.map((category, index) => (
          <div key={index} className="flex flex-col gap-1 p-5 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center justify-between">
              <p className="font-bold text-light-100 text-base">
                {index + 1}. {category.name}
              </p>
              <span className="text-orange-600 font-extrabold text-base bg-orange-100 px-3 py-0.5 rounded-full">{category.score}/100</span>
            </div>
            <p className="text-light-400 text-sm font-medium mt-1">{category.comment}</p>
          </div>
        ))}
      </div>

      {/* Fortalezas */}
      <div className="flex flex-col gap-3">
        <h3>Fortalezas</h3>
        <ul className="flex flex-col gap-2">
          {feedback?.strengths?.map((strength, index) => (
            <li key={index} className="flex items-start gap-2 text-light-100">
              <span className="text-green-600 mt-0.5 font-bold">✓</span>
              {strength}
            </li>
          ))}
        </ul>
      </div>

      {/* Áreas de mejora */}
      <div className="flex flex-col gap-3">
        <h3>Áreas de mejora</h3>
        <ul className="flex flex-col gap-2">
          {feedback?.areasForImprovement?.map((area, index) => (
            <li key={index} className="flex items-start gap-2 text-light-100">
              <span className="text-amber-600 mt-0.5 font-bold">→</span>
              {area}
            </li>
          ))}
        </ul>
      </div>

      {/* Transcripción */}
      {feedback?.transcript && feedback.transcript.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2>Lo que escuchó la IA</h2>
          <p className="text-light-400 text-sm -mt-2">
            Así fue captada tu conversación durante la entrevista.
          </p>
          <div className="flex flex-col gap-3">
            {feedback.transcript.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-200 text-dark-100 rounded-tr-none"
                      : "bg-dark-200 text-light-100 rounded-tl-none"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1 opacity-60">
                    {msg.role === "user" ? "Tú" : "Entrevistador"}
                  </p>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/dashboard" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Volver al inicio
            </p>
          </Link>
        </Button>
        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">
              Repetir entrevista
            </p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Page;
