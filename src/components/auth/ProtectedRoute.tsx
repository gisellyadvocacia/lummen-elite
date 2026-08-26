"use client";

// ============================================================
// Lummen Elite — ProtectedRoute
// Guard de rotas: verifica auth, perfil ativo e role
// ============================================================

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Se fornecido, restringe acesso apenas a esta role */
  requiredRole?: UserRole;
}

/**
 * Wrapper que protege páginas autenticadas.
 *
 * Comportamento:
 * 1. Loading → exibe spinner
 * 2. Não autenticado → redireciona para /login
 * 3. Perfil desativado (ativo: false) → bloqueia acesso
 * 4. Role insuficiente → redireciona para /dashboard
 * 5. Tudo ok → renderiza children
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, profile, loading, profileLoading } = useAuth();
  const router = useRouter();

  // ── Loading inicial ──
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
            Verificando acesso...
          </p>
        </div>
      </div>
    );
  }

  // ── Não autenticado → /login ──
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (!user) return null;

  // ── Perfil desativado ──
  useEffect(() => {
    if (!profileLoading && profile && !profile.ativo) {
      router.replace("/login?blocked=true");
    }
  }, [profileLoading, profile, router]);

  if (profile && !profile.ativo) return null;

  // ── Verificação de role ──
  useEffect(() => {
    if (!profileLoading && profile && requiredRole) {
      if (profile.role !== requiredRole && profile.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [profileLoading, profile, requiredRole, router]);

  if (profile && requiredRole && profile.role !== requiredRole && profile.role !== "admin") {
    return null;
  }

  // ── Acesso permitido ──
  return <>{children}</>;
}
