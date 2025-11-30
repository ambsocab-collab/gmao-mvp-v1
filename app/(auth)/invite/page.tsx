"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PasswordSetupForm } from "@/components/password-setup-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-red-600">
              ❌ Enlace Inválido
            </CardTitle>
            <CardDescription className="text-center">
              El enlace de invitación no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Por favor, solicita una nueva invitación al administrador del sistema.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
            >
              Ir al Inicio de Sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PasswordSetupForm
      invitationToken={token}
      className="mx-auto"
    />
  );
}

export default function InvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            GMAO MVP
          </h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Completa tu Registro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Has sido invitado a unirte al sistema de Gestión de Mantenimiento
          </p>
        </div>

        {/* Form */}
        <Suspense fallback={
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Cargando formulario de registro...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        }>
          <InviteContent />
        </Suspense>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}