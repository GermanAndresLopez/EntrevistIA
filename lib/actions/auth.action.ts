"use server";

import { createClient } from "@/lib/supabase/server";

export async function signUp(_params: SignUpParams) {
  // El trigger handle_new_user en Supabase inserta automáticamente en la tabla users
  return { success: true, message: "Cuenta creada con éxito. Por favor inicia sesión." };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      name: profile.name,
      email: profile.email,
      profileImage: profile.profile_image || undefined,
    } as User;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

export async function updateProfile({ name, newPassword, profileImage }: { name: string; newPassword?: string; profileImage?: string }) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "No autenticado" };

    const updateData: Record<string, unknown> = { name };
    if (profileImage !== undefined) updateData.profile_image = profileImage;

    const { error: profileError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (profileError) throw profileError;

    if (newPassword) {
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
