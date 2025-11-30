"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function TestAuthPage() {
  const { user, isLoading, isAuthenticated, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando estado de autenticación...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Autenticación</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-red-50 p-4 rounded-lg overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Test de Estado de Autenticación</h1>

        {/* Estado General */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span>Autenticado:</span>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                {isAuthenticated ? "SÍ" : "NO"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span>Cargando:</span>
              <Badge variant={isLoading ? "default" : "secondary"}>
                {isLoading ? "SÍ" : "NO"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Usuario */}
        {user ? (
          <Card>
            <CardHeader>
              <CardTitle>Datos del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nombre:</strong> {user.full_name || "No especificado"}</p>
                <p><strong>Rol:</strong> <Badge variant="outline">{user.role}</Badge></p>
                <p><strong>Nivel de Capacidad:</strong> {user.capacity_level || "No asignado"}</p>
                <p><strong>URL Avatar:</strong> {user.avatar_url || "No especificado"}</p>
                <p><strong>Creado:</strong> {new Date(user.created_at).toLocaleString()}</p>
                <p><strong>Actualizado:</strong> {new Date(user.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Sin Usuario Autenticado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No hay información de usuario disponible.</p>
            </CardContent>
          </Card>
        )}

        {/* Instrucciones para prueba de persistencia */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones para Prueba de Persistencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Inicia sesión en <a href="/login" className="text-blue-600 hover:underline">/login</a></li>
              <li>Visita esta página para verificar tu estado de autenticación</li>
              <li>Cierra completamente el navegador</li>
              <li>Reabre el navegador y visita directamente esta página</li>
              <li>Si la persistencia funciona, deberías seguir viendo tus datos de usuario</li>
            </ol>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Para una prueba completa, cierra todas las pestañas y ventanas del navegador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}