import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import WarmBackground from "@/components/WarmBackground";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/dashboard");

  return (
    <div className="auth-layout">
      <WarmBackground />
      {children}
    </div>
  );
};

export default AuthLayout;
