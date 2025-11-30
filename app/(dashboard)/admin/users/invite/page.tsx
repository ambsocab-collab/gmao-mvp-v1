import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserInvitationForm } from "@/components/user-invitation-form";
import Link from "next/link";

export default async function AdminInvitePage() {
  const supabase = await createClient();

  // Check if user is authenticated and has admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role from profiles table
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  // Only allow admin users
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 flex flex-col gap-4 items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Navigation breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Panel Principal
          </Link>
          <span>/</span>
          <Link
            href="/dashboard/admin/users"
            className="hover:text-foreground transition-colors"
          >
            Usuarios
          </Link>
          <span>/</span>
          <span className="text-foreground">Invitar Usuario</span>
        </nav>

        {/* Page title and description */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Invitar Nuevo Usuario
          </h1>
          <p className="text-muted-foreground">
            Enviar una invitación por correo electrónico para que un nuevo miembro del equipo se una al sistema GMAO
          </p>
        </div>

        {/* Invitation form */}
        <UserInvitationForm
          onSuccess={() => {
            // Success message is handled in the component
          }}
          className="mx-auto"
        />

        {/* Additional information */}
        <div className="rounded-lg border bg-muted/50 p-4">
          <h2 className="font-semibold mb-2">📋 Información importante:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• El usuario recibirá un correo con un enlace para registrarse</li>
            <li>• El enlace expirará en 7 días por seguridad</li>
            <li>• El usuario deberá configurar su contraseña al primer acceso</li>
            <li>• Podrá ver el estado de todas las invitaciones en el panel de gestión</li>
          </ul>
        </div>
      </div>
    </div>
  );
}