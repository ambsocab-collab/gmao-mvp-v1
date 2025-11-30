"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database, UserRole } from "@/types";

type _User = Database["public"]["Tables"]["profiles"]["Row"];

interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Query para obtener el usuario actual y su perfil
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        // Obtener usuario autenticado
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error("Error getting auth user:", authError);
          throw authError;
        }

        if (!authUser) {
          return null;
        }

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileError) {
          console.error("Error getting user profile:", profileError);
          // Si no existe el perfil, creamos uno básico
          if (profileError.code === 'PGRST116') { // No rows returned
            const { data: newProfile, error: insertError } = await supabase
              .from("profiles")
              .insert({
                id: authUser.id,
                email: authUser.email!,
                full_name: authUser.user_metadata?.full_name || null,
                role: 'operator' as UserRole,
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating profile:", insertError);
              throw insertError;
            }

            return newProfile;
          }
          throw profileError;
        }

        return profile;
      } catch (error) {
        console.error("Auth query error:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Mutation para login
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar la query del usuario para que se refresque
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // El error será manejado por el componente que usa el hook
    },
  });

  // Mutation para logout
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Limpiar todas las queries al hacer logout
      queryClient.clear();
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  // Mutation para signup
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, full_name }: SignInData & { full_name?: string }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || "",
          },
        },
      });

      if (error) {
        console.error("Sign up error:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // No redirigimos automáticamente, el usuario necesita verificar su email
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error) => {
      console.error("Signup failed:", error);
    },
  });

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    signUp: signUpMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    loginError: signInMutation.error,
    logoutError: signOutMutation.error,
    signupError: signUpMutation.error,
  };
}