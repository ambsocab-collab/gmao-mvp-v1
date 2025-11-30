"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserInvitation } from "@/lib/hooks/use-user-invitation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  sent_at: string;
  accepted_at?: string;
  expires_at: string;
  invited_by_email?: string;
  invited_by_name?: string;
  current_status: string;
}

interface InvitationManagementTableProps {
  invitations: Invitation[];
}

export function InvitationManagementTable({
  invitations,
}: InvitationManagementTableProps) {
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);
  const {
    resendInvitation,
    revokeInvitation,
    isLoading,
    resendError,
    revokeError,
  } = useUserInvitation();

  const getStatusBadge = (status: InvitationStatus, currentStatus: string) => {
    const statusConfig = {
      pending: {
        variant: "default" as const,
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      accepted: {
        variant: "default" as const,
        label: "Aceptada",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      expired: {
        variant: "default" as const,
        label: "Expirada",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      revoked: {
        variant: "default" as const,
        label: "Revocada",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    const config = currentStatus === "active"
      ? statusConfig.pending
      : statusConfig[status];

    return (
      <Badge className={config.className} variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      operator: "Operador",
      technician: "Técnico",
      supervisor: "Supervisor",
      admin: "Administrador",
    };
    return roleLabels[role] || role;
  };

  const handleResend = async (invitationId: string) => {
    resendInvitation({ invitationId });
  };

  const handleRevoke = async (invitationId: string) => {
    revokeInvitation(invitationId);
    setConfirmRevoke(null);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP 'a las' p", { locale: es });
    } catch {
      return dateString;
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay invitaciones
        </h3>
        <p className="text-gray-500">
          No se han enviado invitaciones todavía.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error messages */}
      {resendError && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">
            ❌ Error al reenviar invitación: {resendError.message}
          </p>
        </div>
      )}

      {revokeError && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-800">
            ❌ Error al revocar invitación: {revokeError.message}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Enviada por</TableHead>
              <TableHead>Fecha Envío</TableHead>
              <TableHead>Expiración</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id} data-testid={`invitation-row-${invitation.id}`}>
                <TableCell className="font-medium">
                  {invitation.email}
                </TableCell>
                <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                <TableCell>
                  {getStatusBadge(invitation.status, invitation.current_status)}
                </TableCell>
                <TableCell>
                  <div>
                    {invitation.invited_by_name && (
                      <div className="font-medium">{invitation.invited_by_name}</div>
                    )}
                    {invitation.invited_by_email && (
                      <div className="text-sm text-gray-500">
                        {invitation.invited_by_email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(invitation.sent_at)}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(invitation.expires_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(invitation.status === "pending" || invitation.current_status === "active") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invitation.id)}
                        disabled={isLoading}
                        data-testid={`resend-button-${invitation.id}`}
                      >
                        {isLoading ? "Reenviando..." : "Reenviar"}
                      </Button>
                    )}

                    {(invitation.status === "pending" ||
                      invitation.status === "expired" ||
                      invitation.current_status === "active") && (
                      <>
                        {confirmRevoke === invitation.id ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevoke(invitation.id)}
                              disabled={isLoading}
                              data-testid={`confirm-revoke-button-${invitation.id}`}
                            >
                              {isLoading ? "Revocando..." : "Confirmar"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmRevoke(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setConfirmRevoke(invitation.id)}
                            disabled={isLoading}
                            data-testid={`revoke-button-${invitation.id}`}
                          >
                            Revocar
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}