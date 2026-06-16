import { getCurrentUser } from "@/lib/actions/auth.action";
import InterviewPage from "@/components/InterviewPage";

const Page = async () => {
  const user = await getCurrentUser();

  return <InterviewPage userName={user?.name!} userId={user?.id!} />;
};

export default Page;
