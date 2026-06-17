import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import { interviewTemplates } from "@/constants";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/sign-in");

  const userInterviews = await getInterviewsByUserId(user.id);
  const hasPastInterviews = userInterviews && userInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Prepárate para tus entrevistas con práctica y retroalimentación impulsada por IA</h2>
          <p className="text-lg">Practica con preguntas reales de entrevistas y obtén retroalimentación instantánea</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Iniciar una entrevista</Link>
          </Button>
        </div>
        <Image
          src="/Robotv3.png"
          alt="AI Robot DevCareer"
          width={550}
          height={550}
          unoptimized
          className="max-sm:hidden object-contain -mr-16 scale-110 hover:scale-115 transition-transform duration-300"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-xl md:text-2xl">Tus entrevistas</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>Aún no has realizado ninguna entrevista</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-xl md:text-2xl">Plantillas de entrevistas</h2>
        <div className="interviews-section">
          {interviewTemplates.map((template) => (
            <InterviewCard
              {...template}
              key={template.id}
              isTemplate={true}
              currentUserId={user?.id}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Page;
