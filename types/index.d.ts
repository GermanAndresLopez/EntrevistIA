interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  transcript?: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level?: string;
  questions: string[];
  techstack?: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  coverImage?: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  profileImage?: string;
}

interface InterviewCardProps {
  id?: string;
  userId?: string;
  role: string;
  type?: string;
  techstack?: string[];
  createdAt?: string;
  isTemplate?: boolean;
  currentUserId?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  userImage?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
