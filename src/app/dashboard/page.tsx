"use client";

// ============================================================
// Lummen Elite — Dashboard do Corretor
// Stats completos, progressão de tier, ranking e atividade
// ============================================================

import {
  Gem,
  Trophy,
  TrendingUp,
  Coins,
  BarChart3,
  Crown,
  Target,
  Calendar,
  ArrowUpRight,
  Star,
  Clock,
  Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useFirestore";
import { TIER_CONFIG, type UserTier } from "@/lib/types";

// ── Ordem dos tiers para progressão ──
const TIER_ORDER: UserTier[] = [
  "Sem Classificacao",
  "Esmeralda",
  "Safira",
  "Rubi",
  "Diamante",
];

function getProgressPercent(current: number, min: number, max: number): number {
  if (current >= max) return 100;
  if (current <= min) return 0;
  return Math.round(((current - min) / (max - min)) * 100);
}

function getTierProgress(pontos: number): {
  current: UserTier;
  next: UserTier | null;
  percent: number;
  pointsToNext: number;
} {
  const tiers: Array<{ tier: UserTier; min: number }> = [
    { tier: "Sem Classificacao", min: 0 },
    { tier: "Esmeralda", min: 500 },
    { tier: "Safira", min: 1500 },
    { tier: "Rubi", min: 3000 },
    { tier: "Diamante", min: 5000 },
  ];

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (pontos >= tiers[i].min) {
      const next = tiers[i + 1] ?? null;
      const percent = next
        ? getProgressPercent(pontos, tiers[i].min, next.min)
        : 100;
      const pointsToNext = next ? next.min - pontos : 0;
      return { current: tiers[i].tier, next: next?.tier ?? null, percent, pointsToNext };
    }
  }

  return { current: "Sem Classificacao", next: "Esmeralda", percent: 0, pointsToNext: 500 };
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, profile } = useAuth();
  const data = useDashboardData(profile);

  const nome = profile?.nome?.split(" ")[0] ?? user?.displayName?.split(" ")[0] ?? "Corretor";
  const tier = profile?.classificacao_atual ?? "Sem Classificacao";
  const tierConfig = TIER_CONFIG[tier];
  const progress = getTierProgress(profile?.pontos_semestre ?? 0);
  const nextConfig = progress.next ? TIER_CONFIG[progress.next] : null;

  if (data.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Olá, <span className="text-amber-400">{nome}</span>
          </h1>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: Coins,
              label: "Pontos (Trim.)",
              value: (profile?.pontos_trimestre ?? 0).toLocaleString("pt-BR"),
              accent: true,
            },
            {
              icon: TrendingUp,
              label: "Pontos (Sem.)",
              value: (profile?.pontos_semestre ?? 0).toLocaleString("pt-BR"),
              accent: false,
            },
            {
              icon: Trophy,
              label: "VGV Acumulado",
              value: `R$ ${(profile?.vgv_acumulado_ano ?? 0).toLocaleString("pt-BR")}`,
              accent: false,
            },
            {
              icon: Crown,
              label: "Ranking",
              value: `${data.rankingPosicao}º / ${data.totalCorretores}`,
              accent: true,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card-premium p-5 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {stat.label}
                  </p>
                  <p className={`text-xl font-bold ${stat.accent ? "text-amber-400" : "text-white"}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5">
                  <stat.icon
                    className={`w-5 h-5 ${stat.accent ? "text-amber-400" : "text-slate-400"}`}
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tier + Progressão ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Tier Card */}
          <div className={`card-premium p-6 ${tierConfig.glow} animate-fade-up delay-200`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${tierConfig.bg} ${tierConfig.border} border flex items-center justify-center`}>
                <Gem className={`w-7 h-7 ${tierConfig.text}`} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                  Classificação Atual
                </p>
                <p className={`text-2xl font-bold ${tierConfig.text}`}>
                  {tierConfig.label}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card-premium p-6 animate-fade-up delay-300">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Progresso para {nextConfig?.label ?? "Máximo"}
              </p>
              <p className="text-sm font-bold text-amber-400">{progress.percent}%</p>
            </div>
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000 ease-out"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            {progress.next && (
              <p className="text-xs text-slate-500">
                Faltam <span className="text-amber-400 font-semibold">{progress.pointsToNext.toLocaleString("pt-BR")}</span> pontos
              </p>
            )}
          </div>

          {/* Média de Notas */}
          <div className="card-premium p-6 animate-fade-up delay-400">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Média Semanal
                </p>
                <p className="text-3xl font-bold text-white">{data.mediaNotas}</p>
                <p className="text-xs text-slate-500 mt-1">pontos por semana</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/10">
                <Star className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Atividade Semanal ── */}
        <div className="card-premium p-6 mb-8 animate-fade-up delay-300">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Notas Semanais Aprovadas
            </h2>
          </div>

          {data.notesAprovadas.length > 0 ? (
            <div className="space-y-3">
              {data.notesAprovadas.slice(0, 5).map((note, i) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Semana {note.semana_inicio}
                      </p>
                      <p className="text-xs text-slate-500">
                        {note.vendas_fechadas} vendas · VGV R$ {note.vgv_semanal.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400">{note.nota_semanal}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold">+{note.pontos_ganhos} pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-slate-700 mx-auto mb-2" strokeWidth={1} />
              <p className="text-sm text-slate-500">Nenhuma nota aprovada ainda</p>
            </div>
          )}
        </div>

        {/* ── Notas Pendentes ── */}
        {data.notasPendentes.length > 0 && (
          <div className="card-premium p-6 animate-fade-up delay-400">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-amber-400/70" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Aguardando Validação
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                {data.notasPendentes.length}
              </span>
            </div>

            <div className="space-y-3">
              {data.notasPendentes.map((note, i) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-amber-500/[0.03] border border-amber-500/10 animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400/70" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Semana {note.semana_inicio}
                      </p>
                      <p className="text-xs text-slate-500">
                        {note.vendas_fechadas} vendas · VGV R$ {note.vgv_semanal.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-400/70">{note.nota_semanal}</p>
                    <p className="text-[10px] text-slate-500 font-medium">pendente</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
