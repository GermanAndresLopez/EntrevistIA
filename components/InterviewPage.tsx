"use client";

import InterviewForm from "@/components/InterviewForm";

interface InterviewPageProps {
  userName: string;
  userId: string;
}

const InterviewPage = ({ userId }: InterviewPageProps) => {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3>Genera tu entrevista</h3>
        <p className="text-light-400 text-sm">
          Completa el formulario para crear una entrevista personalizada
        </p>
      </div>
      <div className="w-full">
        <InterviewForm userId={userId} />
      </div>
    </div>
  );
};

export default InterviewPage;
