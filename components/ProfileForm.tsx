"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/auth.action";
import { createClient } from "@/lib/supabase/client";

const inputClass = "bg-white rounded-full min-h-12 px-5 text-light-100 placeholder:text-light-600 border border-light-800 focus:outline-none focus:border-primary-200 transition-colors w-full";

const ProfileForm = ({ user }: { user: User }) => {
  const [name, setName] = useState(user.name);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profileImage || null);
  const fileRef = useRef<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 2 MB.");
      return;
    }
    fileRef.current = file;
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío."); return; }
    if (newPassword && newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden."); return; }
    if (newPassword && newPassword.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres."); return; }

    setLoading(true);

    let imageUrl: string | undefined = undefined;

    if (fileRef.current) {
      try {
        const supabase = createClient();
        const ext = fileRef.current.name.split(".").pop() || "jpg";
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, fileRef.current, { upsert: true });

        if (uploadError) {
          toast.error("No se pudo subir la imagen. Verifica que el bucket 'avatars' exista en Supabase.");
        } else {
          const { data } = supabase.storage.from("avatars").getPublicUrl(path);
          imageUrl = data.publicUrl;
        }
      } catch {
        toast.error("Error al subir la imagen.");
      }
    }

    const result = await updateProfile({ name, newPassword: newPassword || undefined, profileImage: imageUrl });
    if (result.success) {
      toast.success("Perfil actualizado correctamente.");
      setNewPassword("");
      setConfirmPassword("");
      fileRef.current = null;
    } else {
      toast.error(result.message || "Error al actualizar.");
    }
    setLoading(false);
  };

  const initial = name.charAt(0).toUpperCase() || "U";

  return (
    <div className="card-border w-full max-w-xl mx-auto">
      <div className="card p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Información personal</h3>
          <p className="text-sm text-light-400">Actualiza tus datos de perfil</p>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group">
            {previewUrl ? (
              <img src={previewUrl} alt={name} className="w-24 h-24 rounded-full object-cover border-2 border-light-800" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-200 text-white flex items-center justify-center text-4xl font-bold select-none">
                {initial}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-light-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-200 transition-colors shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <p className="text-xs text-light-400">Haz clic para cambiar tu foto</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-light-100 font-medium">Nombre</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-light-100 font-medium">Correo electrónico</label>
          <input className="bg-orange-50 rounded-full min-h-12 px-5 text-light-400 border border-light-800 cursor-not-allowed w-full" value={user.email} disabled />
        </div>

        <div className="border-t border-light-800 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold">Cambiar contraseña</h4>
            <p className="text-sm text-light-400">Deja en blanco si no quieres cambiarla</p>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">Nueva contraseña</label>
            <input type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contraseña" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-light-100 font-medium">Confirmar contraseña</label>
            <input type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" />
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary w-full min-h-12 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
};

export default ProfileForm;
