"use client";

import React, { useState } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUserInvitation } from "@/lib/hooks/use-user-invitation";
import { InvitationManagementTable } from "@/components/invitation-management-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, RefreshCw, Filter } from "lucide-react";

export default function AdminInvitationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [client] = useState(() => createClient());

  // Check admin role client-side
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    invitations = [],
    isLoading: invitationsLoading,
    fetchError,
  } = useUserInvitation();

  // Check admin role
  React.useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        redirect("/login");
        return;
      }

      const { data: profile, error } = await client
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        redirect("/dashboard");
        return;
      }

      setIsAdmin(true);
      setIsLoading(false);
    };

    checkAdminRole();
  }, [client]);

  if (isLoading || isAdmin === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Filter invitations
  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.invited_by_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invitation.invited_by_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: invitations.length,
    pending: invitations.filter(inv => inv.status === "pending").length,
    accepted: invitations.filter(inv => inv.status === "accepted").length,
    expired: invitations.filter(inv => inv.status === "expired").length,
    revoked: invitations.filter(inv => inv.status === "revoked").length,
  };

  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              No se pudieron cargar las invitaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-4">
              {fetchError.message}
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="space-y-2">
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
          <span className="text-foreground">Invitaciones</span>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestión de Invitaciones
            </h1>
            <p className="text-muted-foreground">
              Ver y gestionar todas las invitaciones enviadas a usuarios
            </p>
          </div>

          <Button
            asChild
            className="h-14 px-8 text-base font-semibold"
            data-testid="new-invitation-button"
          >
            <Link href="/dashboard/admin/users/invite">
              Nueva Invitación
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas las invitaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Esperando registro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Enlaces vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revocadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.revoked}</div>
            <p className="text-xs text-muted-foreground">
              Canceladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por correo o invitador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="accepted">Aceptadas</SelectItem>
                  <SelectItem value="expired">Expiradas</SelectItem>
                  <SelectItem value="revoked">Revocadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredInvitations.length} de {invitations.length} invitaciones
        </p>
        {searchTerm && (
          <Badge variant="outline">
            Búsqueda: "{searchTerm}"
          </Badge>
        )}
        {statusFilter !== "all" && (
          <Badge variant="outline">
            Estado: {statusFilter}
          </Badge>
        )}
      </div>

      {/* Invitations Table */}
      {invitationsLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Cargando invitaciones...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <InvitationManagementTable invitations={filteredInvitations} />
      )}
    </div>
  );
}