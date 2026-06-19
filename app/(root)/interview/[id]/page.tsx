import { getInterviewById } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import { getRoleDisplay } from "@/lib/utils";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  const interview = await getInterviewById(id);

  if (!interview) redirect("/dashboard");

  const { emoji, gradient } = getRoleDisplay(interview.role);

  return (
    <>
      <div className="flex flex-row gap-4 justify-between items-center">
        <div className="flex flex-row gap-4 items-center">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xl`}>
            {emoji}
          </div>
          <h3 className="capitalize">Entrevista — {interview.role}</h3>
        </div>

        <span className="bg-orange-100 border border-orange-200 px-4 py-1.5 rounded-full text-xs font-bold text-orange-700 tracking-wide">
          {interview.type}
        </span>
      </div>

      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        userImage={user?.profileImage}
        interviewId={id}
        type="interview"
        questions={interview.questions}
      />
    </>
  );
};
export default Page;
