"use client";

// ============================================================
// Lummen Elite — Filtros do Painel Admin
// Busca, filtro por tier, status e período
// ============================================================

import { useState } from "react";
import {
  Search,
  Filter,
  X,
  Gem,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import { TIER_CONFIG, type UserTier } from "@/lib/types";

export interface AdminFiltersState {
  search: string;
  tier: UserTier | "all";
  status: "all" | "approved" | "pending" | "rejected";
  period: "all" | "week" | "month" | "quarter";
}

interface AdminFiltersProps {
  filters: AdminFiltersState;
  onFiltersChange: (filters: AdminFiltersState) => void;
  resultCount: number;
}

const TIER_OPTIONS: Array<{ value: UserTier | "all"; label: string }> = [
  { value: "all", label: "Todos os Tiers" },
  { value: "Diamante", label: "💎 Diamante" },
  { value: "Rubi", label: "🔴 Rubi" },
  { value: "Safira", label: "🔵 Safira" },
  { value: "Esmeralda", label: "🟢 Esmeralda" },
  { value: "Sem Classificacao", label: "⚪ Sem Classificação" },
];

const STATUS_OPTIONS = [
  { value: "all" as const, label: "Todos os Status" },
  { value: "approved" as const, label: "✅ Aprovados" },
  { value: "pending" as const, label: "⏳ Pendentes" },
  { value: "rejected" as const, label: "❌ Rejeitados" },
];

const PERIOD_OPTIONS = [
  { value: "all" as const, label: "Todo o Período" },
  { value: "week" as const, label: "Esta Semana" },
  { value: "month" as const, label: "Este Mês" },
  { value: "quarter" as const, label: "Este Trimestre" },
];

export function AdminFilters({
  filters,
  onFiltersChange,
  resultCount,
}: AdminFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.tier !== "all" ||
    filters.status !== "all" ||
    filters.period !== "all" ||
    filters.search.length > 0;

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      tier: "all",
      status: "all",
      period: "all",
    });
  };

  return (
    <div className="card-premium p-4 animate-fade-up">
      {/* ── Search Bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Buscar corretor por nome, CRECI ou email..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showAdvanced || hasActiveFilters
              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
              : "bg-white/[0.03] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.05]"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:block">Filtros</span>
          {hasActiveFilters && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-[#0B0F19] text-[10px] font-bold flex items-center justify-center">
              {[filters.tier !== "all", filters.status !== "all", filters.period !== "all"].filter(Boolean).length +
                (filters.search ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* ── Advanced Filters ── */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-white/[0.04] animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tier Filter */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                <Gem className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
                Classificação
              </label>
              <select
                value={filters.tier}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    tier: e.target.value as UserTier | "all",
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
              >
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111827]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                <Filter className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    status: e.target.value as AdminFiltersState["status"],
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111827]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                <Calendar className="w-3 h-3 inline mr-1" strokeWidth={1.5} />
                Período
              </label>
              <select
                value={filters.period}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    period: e.target.value as AdminFiltersState["period"],
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#111827]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                <span className="text-white font-semibold">{resultCount}</span> resultado{resultCount !== 1 ? "s" : ""} encontrado{resultCount !== 1 ? "s" : ""}
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
