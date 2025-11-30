"use client";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Inicializar la sesión de forma asíncrona
    const initializeAuth = async () => {
      try {
        // Obtener la sesión actual para evitar el error "Auth session missing!"
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
        } else {
          console.log("Initial session loaded:", session?.user?.id || "No session");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

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
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return <>{children}</>;
}