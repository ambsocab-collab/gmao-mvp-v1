"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";

// Schema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const _router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isSigningIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Mensaje de redirección si viene de una ruta protegida
  const redirectTo = searchParams.get("redirectTo");
  const redirectMessage = redirectTo ?
    "Por favor inicia sesión para acceder a la página solicitada" : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data);
      // La redirección se maneja en el hook useAuth
    } catch (error) {
      // Manejar errores específicos de autenticación
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("root", {
            type: "manual",
            message: "Email o contraseña incorrectos",
          });
        } else if (error.message.includes("Email not confirmed")) {
          setError("root", {
            type: "manual",
            message: "Por favor confirma tu email antes de iniciar sesión",
          });
        } else {
          setError("root", {
            type: "manual",
            message: "Error al iniciar sesión. Inténtalo de nuevo.",
          });
        }
      }
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          Iniciar Sesión
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mensaje de redirección */}
        {redirectMessage && (
          <Alert>
            <AlertDescription>{redirectMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error general del formulario */}
        {errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Error del hook de autenticación */}
        {loginError && (
          <Alert variant="destructive">
            <AlertDescription>
              Error de autenticación: {loginError.message}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              {...register("email")}
              disabled={isSigningIn}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                className="w-full px-4 py-3 pr-12 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register("password")}
                disabled={isSigningIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                disabled={isSigningIn}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Botón de Submit - Industrial Design con botón grande */}
          <Button
            type="submit"
            disabled={isSigningIn}
            className="w-full py-4 text-lg font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-700 hover:border-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            style={{ minHeight: "56px" }} // Industrial design: >44px
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        {/* Enlace de recuperación (futuro) */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Olvidaste tu contraseña?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:text-blue-500"
              disabled
              title="Función no disponible aún"
            >
              Recuperar contraseña
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    }>
      <LoginPageContent />
    </Suspense>
  );
}