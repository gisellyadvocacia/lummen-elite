"use client";

// ============================================================
// Lummen Elite — useAuth Hook
// Hook tipado para consumir o AuthContext de forma segura
// ============================================================

import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/context/AuthContext";

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado exclusivamente dentro de componentes Client
 * que estejam encaixados no <AuthProvider>.
 *
 * @throws Error se usado fora do AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "[useAuth] Hook usado fora do <AuthProvider>. " +
        "Envolva seus componentes com <AuthProvider> no layout raiz.",
    );
  }

  return context;
}
