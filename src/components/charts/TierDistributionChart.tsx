"use client";

// ============================================================
// Lummen Elite — Gráfico de Distribuição por Tier
// Exibe a distribuição de corretores por classificação
// ============================================================

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Gem } from "lucide-react";
import { TIER_CONFIG, type UserProfile, type UserTier } from "@/lib/types";

interface TierDistributionChartProps {
  users: UserProfile[];
}

interface TierData {
  name: string;
  value: number;
  color: string;
  text: string;
}

const TIER_COLORS: Record<UserTier, string> = {
  Diamante: "#A78BFA",
  Rubi: "#F472B6",
  Safira: "#60A5FA",
  Esmeralda: "#34D399",
  "Sem Classificacao": "#475569",
};

function processTierData(users: UserProfile[]): TierData[] {
  const tierCounts: Record<string, number> = {};

  for (const user of users) {
    if (user.role === "corretor") {
      const tier = user.classificacao_atual;
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    }
  }

  return Object.entries(tierCounts)
    .map(([tier, count]) => {
      const config = TIER_COLORS[tier as UserTier];
      const tierConfig = TIER_CONFIG[tier as UserTier];
      return {
        name: tierConfig?.label ?? tier,
        value: count,
        color: config,
        text: tierConfig?.text ?? "text-slate-400",
      };
    })
    .sort((a, b) => b.value - a.value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: TierData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <p className="text-xs font-semibold text-white">{data.name}</p>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        {data.value} corretor{data.value > 1 ? "es" : ""}
      </p>
    </div>
  );
}

export function TierDistributionChart({ users }: TierDistributionChartProps) {
  const data = processTierData(users);

  if (data.length === 0) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <Gem className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Distribuição por Tier
          </h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Sem corretores cadastrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-6">
        <Gem className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Distribuição por Tier
        </h2>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-slate-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
