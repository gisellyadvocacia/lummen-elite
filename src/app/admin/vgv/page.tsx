"use client";

// ============================================================
// Lummen Elite — Dashboard de Métricas VGV (Admin)
// Análise de Valor Geral de Vendas com gráficos e comparativos
// ============================================================

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Trophy,
  Target,
  Calendar,
  Gem,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers, useAllNotes } from "@/hooks/useFirestore";
import { TIER_CONFIG, type UserProfile, type WeeklyNote, type UserTier } from "@/lib/types";

// ============================================================
// Tipos
// ============================================================

interface VGVByTier {
  tier: string;
  total: number;
  count: number;
  average: number;
  color: string;
}

interface VGVByWeek {
  semana: string;
  label: string;
  total: number;
  meta: number;
}

interface TopBroker {
  uid: string;
  nome: string;
  vgv: number;
  tier: UserTier;
  initials: string;
}

// ============================================================
// Cores por Tier
// ============================================================

const TIER_COLORS: Record<string, string> = {
  Diamante: "#F59E0B",
  Rubi: "#EF4444",
  Safira: "#3B82F6",
  Esmeralda: "#10B981",
  "Sem Classificacao": "#6B7280",
};

// ============================================================
// Tooltip Customizado
// ============================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number) => string;
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/40">
      <p className="text-xs font-semibold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-slate-400">{entry.name}:</span>
          <span className="text-[11px] font-semibold text-white">
            {formatter ? formatter(entry.value) : entry.value.toLocaleString("pt-BR")}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Componente: Stat Card
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  changeLabel,
  accent,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  accent?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="card-premium p-5 animate-fade-up"
      style={{ animationDelay: `${delay ?? 0}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${accent ? "bg-amber-500/10" : "bg-white/5"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-amber-400" : "text-slate-400"}`} strokeWidth={1.5} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? (
              <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
            ) : (
              <ArrowDownRight className="w-4 h-4" strokeWidth={2} />
            )}
            <span className="text-xs font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${accent ? "text-amber-400" : "text-white"}`}>
        {value}
      </p>
      {changeLabel && (
        <p className="text-[10px] text-slate-600 mt-1">{changeLabel}</p>
      )}
    </div>
  );
}

// ============================================================
// Página Principal
// ============================================================

export default function AdminVGVPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminVGVContent />
    </ProtectedRoute>
  );
}

function AdminVGVContent() {
  const { users: allUsers, loading: usersLoading } = useAllUsers();
  const { notes: allNotes, loading: notesLoading } = useAllNotes();
  const [periodFilter, setPeriodFilter] = useState<"all" | "week" | "month" | "quarter">("all");

  // ── Calcular métricas ──
  const metrics = useMemo(() => {
    // VGV Total
    const totalVGV = allUsers.reduce((acc, u) => acc + u.vgv_acumulado_ano, 0);

    // VGV por Tier
    const vgvByTier: VGVByTier[] = [];
    const tierGroups = new Map<string, UserProfile[]>();

    for (const user of allUsers) {
      if (user.role !== "corretor") continue;
      const tier = user.classificacao_atual;
      if (!tierGroups.has(tier)) tierGroups.set(tier, []);
      tierGroups.get(tier)!.push(user);
    }

    tierGroups.forEach((users, tier) => {
      const total = users.reduce((acc, u) => acc + u.vgv_acumulado_ano, 0);
      vgvByTier.push({
        tier,
        total,
        count: users.length,
        average: Math.round(total / users.length),
        color: TIER_COLORS[tier] || "#6B7280",
      });
    });

    vgvByTier.sort((a, b) => b.total - a.total);

    // VGV por Semana (das notas)
    const weekMap = new Map<string, number>();
    for (const note of allNotes) {
      if (note.status !== "approved") continue;
      const semana = note.semana_inicio;
      weekMap.set(semana, (weekMap.get(semana) || 0) + note.vgv_semanal);
    }

    const vgvByWeek: VGVByWeek[] = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, total]) => ({
        semana,
        label: semana.replace("2026-", "S"),
        total,
        meta: 500000, // Meta semanal
      }));

    // Top 5 corretores por VGV
    const topBrokers: TopBroker[] = allUsers
      .filter((u) => u.role === "corretor")
      .sort((a, b) => b.vgv_acumulado_ano - a.vgv_acumulado_ano)
      .slice(0, 5)
      .map((u) => ({
        uid: u.uid,
        nome: u.nome,
        vgv: u.vgv_acumulado_ano,
        tier: u.classificacao_atual,
        initials: u.nome.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      }));

    // Média VGV por corretor
    const brokers = allUsers.filter((u) => u.role === "corretor");
    const avgVGV = brokers.length > 0 ? totalVGV / brokers.length : 0;

    // Total vendas (das notas)
    const totalVendas = allNotes
      .filter((n) => n.status === "approved")
      .reduce((acc, n) => acc + n.vendas_fechadas, 0);

    // Notas aprovadas
    const notesApproved = allNotes.filter((n) => n.status === "approved").length;

    return {
      totalVGV,
      vgvByTier,
      vgvByWeek,
      topBrokers,
      avgVGV,
      totalVendas,
      notesApproved,
      totalBrokers: brokers.length,
    };
  }, [allUsers, allNotes]);

  const loading = usersLoading || notesLoading;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toLocaleString("pt-BR")}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
                Métricas de Vendas
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Dashboard <span className="text-amber-400">VGV</span>
            </h1>
          </div>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as typeof periodFilter)}
            className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
          >
            <option value="all" className="bg-[#111827]">Todo o Período</option>
            <option value="week" className="bg-[#111827]">Esta Semana</option>
            <option value="month" className="bg-[#111827]">Este Mês</option>
            <option value="quarter" className="bg-[#111827]">Este Trimestre</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={DollarSign}
                label="VGV Total"
                value={formatCurrency(metrics.totalVGV)}
                change={12}
                changeLabel="vs. trimestre anterior"
                accent
                delay={0}
              />
              <StatCard
                icon={Target}
                label="Média por Corretor"
                value={formatCurrency(metrics.avgVGV)}
                change={8}
                changeLabel="média por corretor ativo"
                delay={80}
              />
              <StatCard
                icon={TrendingUp}
                label="Total Vendas"
                value={metrics.totalVendas.toString()}
                change={15}
                changeLabel="vendas fechadas no ano"
                delay={160}
              />
              <StatCard
                icon={BarChart3}
                label="Corretores Ativos"
                value={metrics.totalBrokers.toString()}
                changeLabel={`${metrics.notesApproved} notas aprovadas`}
                delay={240}
              />
            </div>

            {/* ── Gráficos ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Evolução VGV Semanal */}
              <div className="lg:col-span-2 card-premium p-6 animate-fade-up delay-300">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Evolução VGV Semanal
                  </h2>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.vgvByWeek} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVGV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip formatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />} />
                      <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} iconType="circle" iconSize={8} />
                      <Area type="monotone" dataKey="meta" name="Meta" stroke="#6366F1" strokeWidth={1.5} strokeDasharray="5 5" fill="url(#colorMeta)" dot={false} />
                      <Area type="monotone" dataKey="total" name="VGV Real" stroke="#F59E0B" strokeWidth={2} fill="url(#colorVGV)" dot={{ r: 4, fill: "#F59E0B", strokeWidth: 0 }} activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2, fill: "#0B0F19" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* VGV por Tier */}
              <div className="card-premium p-6 animate-fade-up delay-400">
                <div className="flex items-center gap-3 mb-6">
                  <Gem className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    VGV por Tier
                  </h2>
                </div>

                <div className="h-52 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.vgvByTier}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="total"
                        stroke="none"
                      >
                        {metrics.vgvByTier.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const data = payload[0]?.payload as VGVByTier;
                          return (
                            <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/40">
                              <p className="text-xs font-semibold text-white">{data.tier}</p>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {formatCurrency(data.total)} total
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {data.count} corretor{data.count > 1 ? "es" : ""}
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legenda */}
                <div className="space-y-2">
                  {metrics.vgvByTier.map((item) => (
                    <div key={item.tier} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-slate-400">{item.tier}</span>
                      </div>
                      <span className="text-xs font-semibold text-white">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Top Corretores ── */}
            <div className="card-premium p-6 animate-fade-up delay-500">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                  Top 5 Corretores por VGV
                </h2>
              </div>

              <div className="space-y-3">
                {metrics.topBrokers.map((broker, i) => {
                  const maxVGV = metrics.topBrokers[0]?.vgv || 1;
                  const percent = (broker.vgv / maxVGV) * 100;
                  const tierConfig = TIER_CONFIG[broker.tier];

                  return (
                    <div
                      key={broker.uid}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-fade-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <span className={`rank-badge ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : "rank-default"}`}>
                        {i + 1}
                      </span>

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                        {broker.initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-white truncate">{broker.nome}</p>
                          <span className={`text-[10px] font-semibold ${tierConfig.text}`}>
                            {tierConfig.label}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-1000"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">
                          {formatCurrency(broker.vgv)}
                        </p>
                        <p className="text-[10px] text-slate-500">VGV ano</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
