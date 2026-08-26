"use client";

// ============================================================
// Lummen Elite — Register Page
// Dark Premium · Cadastro de Corretores com CRECI
// ============================================================

import { useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  Gem,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// ── Requisitos de senha ──
interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "Mínimo 6 caracteres", test: (pw) => pw.length >= 6 },
  { label: "Uma letra maiúscula", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Um número", test: (pw) => /[0-9]/.test(pw) },
];

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle, error: authError, clearError } =
    useAuth();

  // ── Estado do formulário ──
  const [nome, setNome] = useState("");
  const [creci, setCreci] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Validações derivadas ──
  const passwordRulesMet = PASSWORD_RULES.every((rule) => rule.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid =
    nome.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordRulesMet &&
    passwordsMatch;

  // ── Cadastro com e-mail ──
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isFormValid) return;

      setIsSubmitting(true);
      try {
        await registerWithEmail(
          nome.trim(),
          email.trim(),
          password,
          creci.trim() || undefined,
        );
        router.push("/dashboard");
      } catch {
        // Erro já tratado no AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [nome, email, password, creci, isFormValid, registerWithEmail, router],
  );

  // ── Cadastro via Google ──
  const handleGoogleRegister = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch {
      // Erro já tratado
    } finally {
      setIsGoogleLoading(false);
    }
  }, [loginWithGoogle, router]);

  return (
    <div className="min-h-screen flex bg-[#0B0F19]">
      {/* ──────────────────────────────────────────────
          LADO ESQUERDO — Branding
      ────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-amber-600/[0.04] rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Gem className="w-5 h-5 text-[#0B0F19]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Lummen <span className="text-amber-400">Elite</span>
            </span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Junte-se aos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              melhores
            </span>{" "}
            corretores.
          </h1>

          <p className="text-lg text-slate-400 leading-relaxed mb-12">
            Crie sua conta, comece a acumular pontos e desbloqueie recompensas
            exclusivas do programa Lummen Elite.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              "Acumule pontos a cada venda realizada",
              "Suba de tier e desbloqueie vantagens",
              "Resgate experiências e produtos exclusivos",
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-slate-300">{benefit}</span>
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
              Crie sua conta
            </h2>
            <p className="text-slate-400 text-sm">
              Comece a acumular pontos e resgatar recompensas
            </p>
          </div>

          {/* Erro */}
          {authError && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 animate-fade-up">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{authError}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleRegister}
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
            <span>Cadastrar com Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0B0F19] text-slate-500 text-xs">
                ou preencha os dados abaixo
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  className="input-premium pl-11"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            {/* CRECI */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                CRECI{" "}
                <span className="text-slate-600 font-normal normal-case tracking-normal">
                  (opcional)
                </span>
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  placeholder="Ex: 12345-F"
                  className="input-premium pl-11"
                  autoComplete="off"
                />
              </div>
            </div>

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
                  placeholder="Mínimo 6 caracteres"
                  className="input-premium pl-11 pr-11"
                  required
                  autoComplete="new-password"
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

              {/* Password rules */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  {PASSWORD_RULES.map((rule, i) => {
                    const met = rule.test(password);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                            met ? "bg-emerald-500/20" : "bg-white/5"
                          }`}
                        >
                          {met && (
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          )}
                        </div>
                        <span
                          className={`text-xs ${
                            met ? "text-emerald-400" : "text-slate-500"
                          }`}
                        >
                          {rule.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className={`input-premium pl-11 ${
                    confirmPassword && !passwordsMatch
                      ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                      : ""
                  }`}
                  required
                  autoComplete="new-password"
                />
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  As senhas não coincidem
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0B0F19] font-semibold text-sm hover:from-amber-400 hover:to-amber-500 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20 mt-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Criar conta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
