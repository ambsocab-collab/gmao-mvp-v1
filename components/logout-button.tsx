"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";

export function LogoutButton() {
  const { signOut, isSigningOut } = useAuth();

  return (
    <Button
      onClick={() => signOut()}
      disabled={isSigningOut}
      variant="outline"
      size="sm"
    >
      {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  );
}
