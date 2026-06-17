"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const UserMenu = ({ userName, userEmail }: { userName: string; userEmail: string }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const initial = userName.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 rounded-full bg-primary-200 text-dark-100 font-bold text-base flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white border border-light-800 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-light-800 bg-orange-50">
            <p className="text-sm font-semibold text-light-100 truncate">{userName}</p>
            <p className="text-xs text-light-400 truncate">{userEmail}</p>
          </div>
          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-light-100 hover:bg-orange-50 transition-colors"
            >
              Editar perfil
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
