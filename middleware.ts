import { type NextRequest, NextResponse } from "next/server";

/**
 * Middleware Next.js simplifié
 *
 * L'authentification est gérée côté client via localStorage
 * Ce middleware ne fait que passer les requêtes sans vérification serveur
 *
 * La protection des routes est assurée par les composants React qui
 * vérifient getCurrentUser() et redirigent si non authentifié
 */

export async function middleware(_request: NextRequest) {
  // Simplement passer la requête
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

