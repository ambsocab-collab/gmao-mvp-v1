"use client";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        // Usuario hizo login - refrescar datos del usuario
        queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      } else if (event === "SIGNED_OUT") {
        // Usuario hizo logout - limpiar todas las queries
        queryClient.clear();
      } else if (event === "TOKEN_REFRESHED") {
        // Token fue refrescado - mantener el estado actual
        console.log("Token refreshed");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return <>{children}</>;
}