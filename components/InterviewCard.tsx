import "dayjs/locale/es";
import dayjs from "dayjs";
import Image from "next/image";
import { getRoleDisplay } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

dayjs.locale("es");
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import StartTemplateButton from "@/components/StartTemplateButton";

const InterviewCard = async ({
  id,
  userId,
  role,
  createdAt,
  isTemplate = false,
  currentUserId,
}: InterviewCardProps) => {
  const currentUser = await getCurrentUser();
  const isOwner = !isTemplate && currentUser?.id === userId;

  const feedback =
    isOwner && userId && id
      ? await getFeedbackByInterviewId({ interviewId: id, userId })
      : null;

  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format(
    "D [de] MMMM, YYYY",
  );

  const { emoji, gradient } = getRoleDisplay(role);

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">Conductual</p>
          </div>

          {/* Role-based icon */}
          <div className={`w-[90px] h-[90px] rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-4xl shadow-lg`}>
            {emoji}
          </div>

          <h3 className="mt-5 capitalize">{role}</h3>

          <div className="flex flex-row gap-5 mt-3">
            {!isTemplate && (
              <div className="flex flex-row gap-2">
                <Image src="/calendar.svg" alt="calendar" width={22} height={22} />
                <p>{formattedDate}</p>
              </div>
            )}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "Aún no realizaste esta entrevista. Hacela ahora para obtener retroalimentación."}
          </p>
        </div>

        <div className="flex flex-row justify-end items-center w-full">
          {isTemplate ? (
            <StartTemplateButton templateId={id!} userId={currentUserId || ""} />
          ) : (
            <Button className="btn-primary">
              <Link href={feedback ? `/interview/${id}/feedback` : `/interview/${id}`}>
                {feedback ? "Ver retroalimentación" : "Ver entrevista"}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
