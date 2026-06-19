"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClient } from "@/lib/supabase/client";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

const authFormSchema = (type: FormType) =>
  z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const supabase = createClient();

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (signUpError) { toast.error(signUpError.message); return; }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) { toast.error(signInError.message); return; }

        toast.success("Cuenta creada. Bienvenido/a.");
        router.push("/dashboard");
      } else {
        const { email, password } = data;

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { toast.error(error.message); return; }

        toast.success("Sesión iniciada correctamente.");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(`Hubo un error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo de EntrevistIA" height={36} width={36} />
          <h2 className="text-primary-200">EntrevistIA</h2>
        </div>

        <h3>Practica entrevistas de trabajo con IA</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField control={form.control} name="name" label="Nombre" placeholder="Tu nombre" type="text" />
            )}
            <FormField control={form.control} name="email" label="Correo electrónico" placeholder="Tu correo electrónico" type="email" />
            <FormField control={form.control} name="password" label="Contraseña" placeholder="Ingresa tu contraseña" type="password" />
            <Button className="btn" type="submit">
              {isSignIn ? "Iniciar sesión" : "Crear cuenta"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
          <Link href={!isSignIn ? "/sign-in" : "/sign-up"} className="font-bold text-primary-200 ml-1">
            {!isSignIn ? "Iniciar sesión" : "Regístrate"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
