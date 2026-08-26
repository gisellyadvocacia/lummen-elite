"use client";

// ============================================================
// Lummen Elite — Histórico de Resgates do Corretor
// Lista todas as recompensas resgatadas com status e data
// ============================================================

import { useState } from "react";
import {
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Coins,
  Calendar,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { subscribeBrokerRedemptions } from "@/lib/firestore-ops";
import { REDEMPTION_STATUS, type Redemption } from "@/lib/types";

// ============================================================
// Componente: Card de Resgate
// ============================================================

function RedemptionCard({
  redemption,
  index,
}: {
  redemption: Redemption;
  index: number;
}) {
  const statusConfig = REDEMPTION_STATUS[redemption.status];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="card-premium p-5 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Gift className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {redemption.rewardName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar className="w-3 h-3 text-slate-600" />
              <span className="text-xs text-slate-500">
                {formatDate(redemption.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          <span className="text-sm font-bold text-amber-400">
            {redemption.pointsCost.toLocaleString("pt-BR")}
          </span>
          <span className="text-[10px] text-slate-500">pontos</span>
        </div>

        <div className="flex items-center gap-1.5">
          {redemption.status === "approved" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
          )}
          {redemption.status === "pending" && (
            <Clock className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
          )}
          {redemption.status === "cancelled" && (
            <XCircle className="w-4 h-4 text-red-400" strokeWidth={1.5} />
          )}
          <span className="text-xs text-slate-500">
            {redemption.status === "approved"
              ? "Aprovado"
              : redemption.status === "pending"
                ? "Aguardando"
                : "Cancelado"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Página Principal
// ============================================================

export default function RedemptionsPage() {
  return (
    <ProtectedRoute>
      <RedemptionsContent />
    </ProtectedRoute>
  );
}

function RedemptionsContent() {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to broker's redemptions
  useState(() => {
    if (!user) return;
    const unsub = subscribeBrokerRedemptions(user.uid, (data) => {
      setRedemptions(data);
      setLoading(false);
    });
    return () => unsub();
  });

  const stats = {
    total: redemptions.length,
    approved: redemptions.filter((r) => r.status === "approved").length,
    pending: redemptions.filter((r) => r.status === "pending").length,
    totalPoints: redemptions
      .filter((r) => r.status !== "cancelled")
      .reduce((acc, r) => acc + r.pointsCost, 0),
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 animate-fade-up">
          <Link
            href="/rewards"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Voltar para Recompensas
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
              Meus Resgates
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Histórico de <span className="text-amber-400">Resgates</span>
          </h1>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, accent: false },
            { label: "Aprovados", value: stats.approved, accent: true },
            { label: "Pendentes", value: stats.pending, accent: stats.pending > 0 },
            {
              label: "Pontos Gastos",
              value: stats.totalPoints.toLocaleString("pt-BR"),
              accent: false,
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card-premium p-4 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {stat.label}
              </p>
              <p
                className={`text-xl font-bold ${
                  stat.accent ? "text-amber-400" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Lista de Resgates ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : redemptions.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Gift className="w-12 h-12 text-slate-700 mx-auto mb-4" strokeWidth={1} />
            <p className="text-lg text-slate-400 font-medium mb-2">
              Nenhum resgate ainda
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Visite a vitrine de recompensas para resgatar seus primeiros prêmios
            </p>
            <Link
              href="/rewards"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#0B0F19] text-sm font-bold hover:bg-amber-400 transition-all"
            >
              <Gift className="w-4 h-4" strokeWidth={2} />
              Ver Recompensas
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {redemptions.map((redemption, i) => (
              <RedemptionCard
                key={redemption.id}
                redemption={redemption}
                index={i}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
