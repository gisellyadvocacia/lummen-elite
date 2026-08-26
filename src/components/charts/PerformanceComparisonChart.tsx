"use client";

// ============================================================
// Lummen Elite — Gráfico Comparativo de Performance
// Compara pontos, vendas e VGV entre corretores
// ============================================================

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { TIER_CONFIG, type UserProfile } from "@/lib/types";

interface PerformanceComparisonChartProps {
  users: UserProfile[];
  currentUid?: string;
}

interface ChartData {
  nome: string;
  nomeShort: string;
  pontos: number;
  vgv: number;
  vendas: number;
  tier: string;
  isCurrent: boolean;
}

const TIER_COLORS: Record<string, string> = {
  Diamante: "#A78BFA",
  Rubi: "#F472B6",
  Safira: "#60A5FA",
  Esmeralda: "#34D399",
  "Sem Classificacao": "#64748B",
};

function processPerformanceData(
  users: UserProfile[],
  currentUid?: string
): ChartData[] {
  return users
    .sort((a, b) => b.pontos_semestre - a.pontos_semestre)
    .slice(0, 10) // Top 10
    .map((user) => ({
      nome: user.nome,
      nomeShort: user.nome.split(" ")[0],
      pontos: user.pontos_semestre,
      vgv: Math.round(user.vgv_acumulado_ano / 1000),
      vendas: 0, // Will be calculated from notes if available
      tier: user.classificacao_atual,
      isCurrent: user.uid === currentUid,
    }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ChartData;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const tierConfig = TIER_CONFIG[data.tier as keyof typeof TIER_CONFIG];

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs font-semibold text-white">{data.nome}</p>
        {tierConfig && (
          <span className={`text-[10px] font-bold ${tierConfig.text}`}>
            {tierConfig.label}
          </span>
        )}
      </div>
      {data.isCurrent && (
        <p className="text-[10px] text-amber-400 mb-2">Você</p>
      )}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] text-slate-400">Pontos:</span>
          <span className="text-[11px] font-semibold text-white">
            {data.pontos.toLocaleString("pt-BR")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-[11px] text-slate-400">VGV:</span>
          <span className="text-[11px] font-semibold text-white">
            R$ {data.vgv.toLocaleString("pt-BR")}k
          </span>
        </div>
      </div>
    </div>
  );
}

export function PerformanceComparisonChart({
  users,
  currentUid,
}: PerformanceComparisonChartProps) {
  const data = processPerformanceData(users, currentUid);

  if (data.length === 0) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Comparativo de Performance
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Sem dados suficientes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Comparativo de Performance
        </h2>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-bold">
          Top {data.length}
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBarPontos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#D97706" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="colorBarVGV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="nomeShort"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
              iconType="circle"
              iconSize={8}
            />

            <Bar
              dataKey="pontos"
              name="Pontos Semestre"
              fill="url(#colorBarPontos)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  stroke={entry.isCurrent ? "#F59E0B" : "transparent"}
                  strokeWidth={entry.isCurrent ? 2 : 0}
                />
              ))}
            </Bar>

            <Bar
              dataKey="vgv"
              name="VGV (R$ mil)"
              fill="url(#colorBarVGV)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
