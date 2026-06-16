"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createInterviewFromTemplate } from "@/lib/actions/general.action";

const StartTemplateButton = ({ templateId, userId }: { templateId: string; userId: string }) => {
  const router = useRouter();

  const handleStart = async () => {
    const newId = await createInterviewFromTemplate(templateId, userId);
    if (newId) router.push(`/interview/${newId}`);
  };

  return (
    <Button className="btn-primary" onClick={handleStart}>
      Comenzar
    </Button>
  );
};

export default StartTemplateButton;
