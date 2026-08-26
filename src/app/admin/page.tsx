"use client";

// ============================================================
// Lummen Elite — Admin Panel
// Ranking de corretores + Validação de notas semanais
// ============================================================

import { useState, useCallback } from "react";
import {
  Gem,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers, usePendingNotes } from "@/hooks/useFirestore";
import { validateWeeklyNote } from "@/lib/firestore-ops";
import { TIER_CONFIG, type UserProfile, type WeeklyNote } from "@/lib/types";

// ============================================================
// Componente: Badge de Posição no Ranking
// ============================================================

function RankBadge({ position }: { position: number }) {
  const cls =
    position === 1
      ? "rank-1"
      : position === 2
        ? "rank-2"
        : position === 3
          ? "rank-3"
          : "rank-default";
  return <span className={`rank-badge ${cls}`}>{position}</span>;
}

// ============================================================
// Componente: Card de Ranking
// ============================================================

function RankingRow({
  user,
  position,
}: {
  user: UserProfile;
  position: number;
}) {
  const tierConfig = TIER_CONFIG[user.classificacao_atual];
  const initials = user.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 animate-fade-up ${
        position === 1
          ? "bg-amber-500/[0.06] border border-amber-500/20"
          : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
      }`}
      style={{ animationDelay: `${position * 50}ms` }}
    >
      <RankBadge position={position} />

      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-amber-400 text-xs font-bold">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white truncate">{user.nome}</p>
          {user.creci && (
            <span className="text-[10px] text-slate-600 font-mono">{user.creci}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-semibold ${tierConfig.text}`}>
            {tierConfig.label}
          </span>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold text-amber-400">
          {user.pontos_semestre.toLocaleString("pt-BR")}
        </p>
        <p className="text-[10px] text-slate-500">pts semestre</p>
      </div>

      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-white">
          R$ {user.vgv_acumulado_ano.toLocaleString("pt-BR")}
        </p>
        <p className="text-[10px] text-slate-500">VGV ano</p>
      </div>
    </div>
  );
}

// ============================================================
// Componente: Card de Nota Pendente
// ============================================================

function PendingNoteCard({
  note,
  brokerName,
  onValidate,
  validating,
}: {
  note: WeeklyNote;
  brokerName: string;
  onValidate: (id: string, status: "approved" | "rejected") => void;
  validating: string | null;
}) {
  const isLoading = validating === note.id;

  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-fade-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-white">{brokerName}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Semana {note.semana_inicio}
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
          PENDENTE
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Vendas</p>
          <p className="text-lg font-bold text-white">{note.vendas_fechadas}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">VGV</p>
          <p className="text-lg font-bold text-white">
            R$ {(note.vgv_semanal / 1000).toFixed(0)}k
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Nota</p>
          <p className={`text-lg font-bold ${note.nota_semanal >= 70 ? "text-emerald-400" : note.nota_semanal >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {note.nota_semanal}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onValidate(note.id, "approved")}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
          )}
          Aprovar
        </button>
        <button
          onClick={() => onValidate(note.id, "rejected")}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" strokeWidth={1.5} />
          Rejeitar
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Página Principal Admin
// ============================================================

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { profile } = useAuth();
  const { users, loading: usersLoading } = useAllUsers();
  const { notes: pendingNotes, loading: notesLoading } = usePendingNotes();
  const [validating, setValidating] = useState<string | null>(null);

  // Map uid → nome para exibição nas notas pendentes
  const userMap = new Map(users.map((u) => [u.uid, u.nome]));

  const handleValidate = useCallback(
    async (noteId: string, status: "approved" | "rejected") => {
      if (!profile) return;
      setValidating(noteId);
      try {
        await validateWeeklyNote(noteId, status, profile.uid);
      } catch (err) {
        console.error("Erro ao validar nota:", err);
      } finally {
        setValidating(null);
      }
    },
    [profile],
  );

  const loading = usersLoading || notesLoading;

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-10 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
              Painel Administrativo
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Gestão e <span className="text-amber-400">Auditoria</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ── Ranking (3 cols) ── */}
            <div className="lg:col-span-3">
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Ranking de Corretores
                  </h2>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-bold">
                    {users.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {users
                    .sort((a, b) => b.pontos_semestre - a.pontos_semestre)
                    .map((user, i) => (
                      <RankingRow key={user.uid} user={user} position={i + 1} />
                    ))}
                </div>
              </div>
            </div>

            {/* ── Notas Pendentes (2 cols) ── */}
            <div className="lg:col-span-2">
              <div className="card-premium p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                    Validação Semanal
                  </h2>
                  {pendingNotes.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                      {pendingNotes.length}
                    </span>
                  )}
                </div>

                {pendingNotes.length > 0 ? (
                  <div className="space-y-4">
                    {pendingNotes.map((note) => (
                      <PendingNoteCard
                        key={note.id}
                        note={note}
                        brokerName={userMap.get(note.brokerUid) ?? "Corretor"}
                        onValidate={handleValidate}
                        validating={validating}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-10 h-10 text-slate-700 mx-auto mb-3" strokeWidth={1} />
                    <p className="text-sm text-slate-400 font-medium">
                      Nenhuma nota pendente
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Todas as notas semanais foram validadas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
