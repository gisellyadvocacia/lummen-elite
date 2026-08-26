"use client";

// ============================================================
// Lummen Elite — Login Page
// Dark Premium · Amber Accents · Email/Senha + Google
// ============================================================

import { useState, useCallback, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Gem,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    loginWithEmail,
    loginWithGoogle,
    resetPassword,
    error: authError,
    clearError,
  } = useAuth();

  // ── Estado do formulário ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Modal de recuperação de senha ──
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // ── Checar se veio de bloqueio ──
  const isBlocked = searchParams.get("blocked") === "true";

  // ── Login com e-mail ──
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await loginWithEmail(email, password);
        router.push("/dashboard");
      } catch {
        // Erro já tratado no AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, loginWithEmail, router],
  );

  // ── Login com Google ──
  const handleGoogleLogin = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      // Erro já tratado no AuthContext
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginWithGoogle, router]);

  // ── Enviar redefinição de senha ──
  const handleResetPassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsResetting(true);
      try {
        await resetPassword(resetEmail);
        setResetSent(true);
      } catch {
        // Erro já tratado
      } finally {
        setIsResetting(false);
      }
    },
    [resetEmail, resetPassword],
  );

  return (
    <div className="min-h-screen flex bg-[#0B0F19]">
      {/* ──────────────────────────────────────────────
          LADO ESQUERDO — Branding (hidden no mobile)
      ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center p-12 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-600/[0.04] rounded-full blur-[100px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Gem className="w-5 h-5 text-[#0B0F19]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Lummen <span className="text-amber-400">Elite</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Transforme suas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              vendas
            </span>{" "}
            em conquistas.
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            Acumule pontos, suba de tier e resgate recompensas exclusivas do
            programa Lummen Elite.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: "2.5k+", label: "Corretores ativos" },
              { value: "150+", label: "Recompensas" },
              { value: "98%", label: "Satisfação" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-amber-400">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          LADO DIREITO — Formulário
      ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Gem className="w-4.5 h-4.5 text-[#0B0F19]" />
            </div>
            <span className="text-lg font-bold text-white">
              Lummen <span className="text-amber-400">Elite</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-slate-400 text-sm">
              Entre na sua conta para continuar
            </p>
          </div>

          {/* Aviso de bloqueio */}
          {isBlocked && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-fade-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Sua conta foi desativada. Contate o suporte.
              </span>
            </div>
          )}

          {/* Erro de autenticação */}
          {authError && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-fade-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{authError}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 disabled:opacity-50 mb-6"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>Continuar com Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0B0F19] text-slate-500 text-xs">
                ou continue com e-mail
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="input-premium pl-11"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-premium pl-11 pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(true);
                  setResetEmail(email);
                  setResetSent(false);
                }}
                className="text-xs font-medium text-amber-400/80 hover:text-amber-400 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0B0F19] font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────
          MODAL — Redefinição de Senha
      ────────────────────────────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setShowResetModal(false);
              setResetSent(false);
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">
              Redefinir senha
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Informe o e-mail da sua conta para receber o link de redefinição.
            </p>

            {resetSent ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-300 font-medium mb-1">
                  E-mail enviado!
                </p>
                <p className="text-xs text-slate-500 text-center">
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
                <button
                  onClick={() => {
                    setShowResetModal(false);
                    setResetSent(false);
                  }}
                  className="mt-6 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="input-premium pl-11"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(false);
                      setResetSent(false);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0B0F19] text-sm font-semibold hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Enviar"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
