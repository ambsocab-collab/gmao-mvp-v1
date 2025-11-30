"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Form validation schema
const passwordSetupSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe incluir mayúsculas, minúsculas y números"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PasswordSetupFormData = z.infer<typeof passwordSetupSchema>;

interface PasswordSetupFormProps {
  invitationToken: string;
  onSuccess?: () => void;
  className?: string;
}

export function PasswordSetupForm({
  invitationToken,
  onSuccess,
  className,
}: PasswordSetupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<PasswordSetupFormData>({
    resolver: zodResolver(passwordSetupSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordSetupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // First, get invitation details
      const { data: invitation, error: invitationError } = await supabase.rpc(
        "get_invitation_by_token",
        { token: invitationToken }
      );

      if (invitationError || !invitation?.[0]) {
        setError("Invitación inválida o expirada");
        return;
      }

      const invitationData = invitation[0];

      // Accept the invitation in the database
      const { error: acceptError } = await supabase.rpc("accept_invitation", {
        invitation_token: invitationToken,
      });

      if (acceptError) {
        setError("Error al aceptar la invitación");
        return;
      }

      // Get the user from Supabase Auth (they should exist from the invitation)
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // Try to get user by email from invitation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithOtp({
          email: invitationData.email,
          options: {
            shouldCreateUser: false,
          },
        });

        if (signInError) {
          setError("Error al verificar la cuenta de usuario");
          return;
        }
      }

      // Update user password
      const { error: passwordError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (passwordError) {
        setError("Error al establecer la contraseña");
        return;
      }

      // Update profile with role from invitation
      if (user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            role: invitationData.role,
            full_name: user.user_metadata?.full_name || "Usuario",
            invitation_status: "accepted",
          })
          .eq("id", user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't fail the whole process if profile update fails
        }
      }

      setIsSuccess(true);
      onSuccess?.();

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);

    } catch (err) {
      setError("Ha ocurrido un error inesperado");
      console.error("Password setup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("w-full max-w-md", className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-600">
              ✅ ¡Configuración Completada!
            </CardTitle>
            <CardDescription className="text-center">
              Tu cuenta ha sido configurada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Serás redirigido al panel principal en unos momentos...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-md", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Configurar Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            Establece tu contraseña para completar el registro de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                data-testid="password-input"
                className="h-12 text-base"
                disabled={isLoading}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500" data-testid="password-error">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...form.register("confirmPassword")}
                data-testid="confirm-password-input"
                className="h-12 text-base"
                disabled={isLoading}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500" data-testid="confirm-password-error">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password requirements */}
            <div className="p-4 rounded-md bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Requisitos de contraseña:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Mínimo 8 caracteres</li>
                <li>• Al menos una letra mayúscula</li>
                <li>• Al menos una letra minúscula</li>
                <li>• Al menos un número</li>
              </ul>
            </div>

            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800" data-testid="error-message">
                  ❌ {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              disabled={isLoading}
              data-testid="complete-registration-button"
            >
              {isLoading ? "Configurando..." : "Configurar Contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}