"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/auth.action";

const inputClass = "bg-white rounded-full min-h-12 px-5 text-light-100 placeholder:text-light-600 border border-light-800 focus:outline-none focus:border-primary-200 transition-colors w-full";

const ProfileForm = ({ user }: { user: User }) => {
  const [name, setName] = useState(user.name);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío."); return; }
    if (newPassword && newPassword !== confirmPassword) { toast.error("Las contraseñas no coinciden."); return; }
    if (newPassword && newPassword.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres."); return; }

    setLoading(true);
    const result = await updateProfile({ name, newPassword: newPassword || undefined });
    if (result.success) {
      toast.success("Perfil actualizado correctamente.");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.message || "Error al actualizar.");
    }
    setLoading(false);
  };

  return (
    <div className="card-border w-full max-w-xl mx-auto">
      <div className="card p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">Información personal</h3>
          <p className="text-sm text-light-400">Actualiza tus datos de perfil</p>
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
