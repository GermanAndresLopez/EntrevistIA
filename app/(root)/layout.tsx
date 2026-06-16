import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/actions/auth.action";
import UserMenu from "@/components/UserMenu";

const Layout = async ({ children }: { children: ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo de EntrevistIA" width={38} height={38} />
          <h2 className="text-primary-100 text-xl font-bold">EntrevistIA</h2>
        </Link>
        <UserMenu userName={user.name} userEmail={user.email} />
      </nav>

      {children}
    </div>
  );
};

export default Layout;
