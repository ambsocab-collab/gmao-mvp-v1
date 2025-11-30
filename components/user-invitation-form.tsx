"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserInvitation } from "@/lib/hooks/use-user-invitation";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

// Form validation schema
const invitationSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Ingrese un correo electrónico válido")
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, "Formato de correo inválido"),
  role: z.enum(["operator", "technician", "supervisor", "admin"], {
    required_error: "Seleccione un rol para el usuario",
  }),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface UserInvitationFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function UserInvitationForm({ onSuccess, className }: UserInvitationFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    createInvitation,
    isLoading,
    createError,
    resetCreateError,
  } = useUserInvitation();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: undefined,
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    setIsSuccess(false);
    resetCreateError();

    try {
      await new Promise<void>((resolve, reject) => {
        createInvitation(data, {
          onSuccess: () => {
            setIsSuccess(true);
            form.reset();
            onSuccess?.();
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        });
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: "operator", label: "Operador" },
    { value: "technician", label: "Técnico" },
    { value: "supervisor", label: "Supervisor" },
    { value: "admin", label: "Administrador" },
  ];

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <Card data-testid="invitation-form">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Invitar Nuevo Usuario
          </CardTitle>
          <CardDescription className="text-center">
            Envíe una invitación por correo electrónico para que un nuevo usuario se registre en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                {...form.register("email")}
                data-testid="invitation-email-input"
                className="h-12 text-base"
                disabled={isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500" data-testid="email-error">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Rol del Usuario
              </Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value) => form.setValue("role", value as UserRole)}
                disabled={isLoading}
              >
                <SelectTrigger className="h-12 text-base" data-testid="role-selector">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500" data-testid="role-error">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            {isSuccess && (
              <div className="p-4 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-800" data-testid="success-message">
                  ✅ Invitación enviada correctamente. El usuario recibirá un correo para completar su registro.
                </p>
              </div>
            )}

            {createError && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-800" data-testid="error-message">
                  ❌ {createError.message}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold"
              disabled={isLoading}
              data-testid="send-invitation-button"
            >
              {isLoading ? "Enviando invitación..." : "Enviar Invitación"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}