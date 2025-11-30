"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthLoading({ children, fallback }: AuthLoadingProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Esperar un poco para que Supabase se inicialice completamente
        await new Promise(resolve => setTimeout(resolve, 100));

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error initializing auth:", error);
        } else {
          console.log("Auth initialized with session:", session?.user?.id || "No session");
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}