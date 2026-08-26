"use client";

// ============================================================
// Lummen Elite — Gráfico de Evolução Semanal
// Exibe a evolução de pontos, vendas e VGV ao longo das semanas
// ============================================================

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { WeeklyNote } from "@/lib/types";

interface WeeklyEvolutionChartProps {
  notes: WeeklyNote[];
}

interface ChartData {
  semana: string;
  semanaLabel: string;
  pontos: number;
  vendas: number;
  vgv: number;
  nota: number;
}

function processWeeklyData(notes: WeeklyNote[]): ChartData[] {
  // Group notes by week
  const weekMap = new Map<
    string,
    { pontos: number; vendas: number; vgv: number; nota: number; count: number }
  >();

  for (const note of notes) {
    const semana = note.semana_inicio;
    if (!weekMap.has(semana)) {
      weekMap.set(semana, { pontos: 0, vendas: 0, vgv: 0, nota: 0, count: 0 });
    }
    const week = weekMap.get(semana)!;
    week.pontos += note.pontos_ganhos;
    week.vendas += note.vendas_fechadas;
    week.vgv += note.vgv_semanal;
    week.nota += note.nota_semanal;
    week.count++;
  }

  // Sort by week and format labels
  const weekLabels: Record<string, string> = {
    "2026-W30": "Sem 30",
    "2026-W31": "Sem 31",
    "2026-W32": "Sem 32",
    "2026-W33": "Sem 33",
    "2026-W34": "Sem 34",
  };

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([semana, data]) => ({
      semana,
      semanaLabel: weekLabels[semana] ?? semana,
      pontos: data.pontos,
      vendas: data.vendas,
      vgv: Math.round(data.vgv / 1000),
      nota: Math.round(data.nota / data.count),
    }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#111827]/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl shadow-black/40">
      <p className="text-xs font-semibold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[11px] text-slate-400">{entry.name}:</span>
          <span className="text-[11px] font-semibold text-white">
            {entry.name === "VGV" ? `R$ ${entry.value}k` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function WeeklyEvolutionChart({ notes }: WeeklyEvolutionChartProps) {
  const data = processWeeklyData(notes);

  if (data.length === 0) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Evolução Semanal
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
        <TrendingUp className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Evolução Semanal
        </h2>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-bold">
          {data.length} semanas
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPontos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />

            <XAxis
              dataKey="semanaLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#94a3b8" }}
              iconType="circle"
              iconSize={8}
            />

            <Area
              type="monotone"
              dataKey="pontos"
              name="Pontos"
              stroke="#F59E0B"
              strokeWidth={2}
              fill="url(#colorPontos)"
              dot={{ r: 4, fill: "#F59E0B", strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#F59E0B", strokeWidth: 2, fill: "#0B0F19" }}
            />

            <Area
              type="monotone"
              dataKey="nota"
              name="Nota Média"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorNota)"
              dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#10B981", strokeWidth: 2, fill: "#0B0F19" }}
            />

            <Area
              type="monotone"
              dataKey="vendas"
              name="Vendas"
              stroke="#6366F1"
              strokeWidth={2}
              fill="url(#colorVendas)"
              dot={{ r: 4, fill: "#6366F1", strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: "#6366F1", strokeWidth: 2, fill: "#0B0F19" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
