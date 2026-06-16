import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import ProfileForm from "@/components/ProfileForm";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="flex flex-col gap-8 items-center py-8">
      <div className="w-full max-w-xl">
        <h2 className="text-2xl font-bold text-primary-100">Mi perfil</h2>
        <p className="text-light-400 mt-1">Gestioná tu información personal y contraseña</p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
};

export default Page;
