import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas - no requieren autenticación
  const publicRoutes = ["/login", "/auth/login", "/auth/callback", "/_next", "/favicon.ico", "/manifest.json"];

  // Si es una ruta pública, permitir acceso
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si el usuario está autenticado
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no está autenticado y trata de acceder a ruta protegida, redirigir a login
  if (!user && pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si está autenticado y trata de acceder a login, redirigir a dashboard
  if (user && (pathname === "/login" || pathname === "/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};