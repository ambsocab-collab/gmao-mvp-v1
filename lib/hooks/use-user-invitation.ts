"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types";
import { invitationRateLimiter } from "@/lib/rate-limiter";

type CreateInvitationData = {
  email: string;
  role: UserRole;
};

type ResendInvitationData = {
  invitationId: string;
};

export function useUserInvitation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const createInvitationMutation = useMutation({
    mutationFn: async (data: CreateInvitationData) => {
      // Apply rate limiting
      const rateLimitResult = invitationRateLimiter.isAllowed("create_invitation");
      if (!rateLimitResult.allowed) {
        const resetMinutes = Math.ceil((rateLimitResult.resetTime! - Date.now()) / (60 * 1000));
        throw new Error(
          `Límite de velocidad alcanzado. Por favor, espera ${resetMinutes} minutos antes de enviar otra invitación.`
        );
      }

      // Call the database function to create invitation
      const { data: invitationId, error } = await supabase.rpc("create_user_invitation", {
        target_email: data.email,
        target_role: data.role,
        expires_after: "7 days"
      });

      if (error) {
        throw new Error(error.message);
      }

      // Then send Supabase Auth invitation email
      const { error: authError } = await supabase.auth.admin.inviteUserByEmail(
        data.email,
        {
          data: {
            role: data.role,
            invitation_id: invitationId
          },
          redirectTo: `${window.location.origin}/auth/invite`
        }
      );

      if (authError) {
        // Rollback the invitation if email fails
        await supabase.rpc("revoke_invitation", { invitation_id: invitationId });
        throw new Error(`Error al enviar correo de invitación: ${authError.message}`);
      }

      return invitationId;
    },
    onSuccess: () => {
      // Invalidate invitations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Error creating invitation:", error);
    }
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (data: ResendInvitationData) => {
      // Get invitation details first
      const { data: invitation, error: fetchError } = await supabase
        .from("user_invitations")
        .select("email, role")
        .eq("id", data.invitationId)
        .single();

      if (fetchError) {
        throw new Error(`Error al obtener detalles de la invitación: ${fetchError.message}`);
      }

      // Resend the database invitation
      const { data: newInvitationId, error: dbError } = await supabase.rpc("resend_invitation", {
        invitation_id: data.invitationId,
        expires_after: "7 days"
      });

      if (dbError) {
        throw new Error(`Error al reenviar invitación: ${dbError.message}`);
      }

      // Send Supabase Auth invitation email
      const { error: authError } = await supabase.auth.admin.inviteUserByEmail(
        invitation.email,
        {
          data: {
            role: invitation.role,
            invitation_id: newInvitationId
          },
          redirectTo: `${window.location.origin}/auth/invite`
        }
      );

      if (authError) {
        throw new Error(`Error al enviar correo de invitación: ${authError.message}`);
      }

      return newInvitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Error resending invitation:", error);
    }
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.rpc("revoke_invitation", {
        invitation_id: invitationId
      });

      if (error) {
        throw new Error(`Error al revocar invitación: ${error.message}`);
      }

      return invitationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (error) => {
      console.error("Error revoking invitation:", error);
    }
  });

  const getInvitationsQuery = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invitation_management_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error al obtener invitaciones: ${error.message}`);
      }

      return data;
    },
    retry: 1,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    // Mutations
    createInvitation: createInvitationMutation.mutate,
    resendInvitation: resendInvitationMutation.mutate,
    revokeInvitation: revokeInvitationMutation.mutate,

    // Loading states
    isLoading: createInvitationMutation.isPending ||
               resendInvitationMutation.isPending ||
               revokeInvitationMutation.isPending ||
               getInvitationsQuery.isLoading,

    // Data
    invitations: getInvitationsQuery.data,

    // Error states
    createError: createInvitationMutation.error,
    resendError: resendInvitationMutation.error,
    revokeError: revokeInvitationMutation.error,
    fetchError: getInvitationsQuery.error,

    // Reset functions
    resetCreateError: createInvitationMutation.reset,
    resetResendError: resendInvitationMutation.reset,
    resetRevokeError: revokeInvitationMutation.reset,
  };
}