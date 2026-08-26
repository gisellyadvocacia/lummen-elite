"use client";

// ============================================================
// Lummen Elite — Gerenciamento de Corretores (Admin)
// Visualizar, ativar/desativar, promover/rebaixar corretores
// ============================================================

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Crown,
  Gem,
  Mail,
  Phone,
  Loader2,
  MoreVertical,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeAllProfiles,
  toggleBrokerActive,
  changeBrokerRole,
} from "@/lib/firestore-ops";
import { TIER_CONFIG, type UserProfile, type UserRole } from "@/lib/types";

// ============================================================
// Componente: Card do Corretor
// ============================================================

function BrokerCard({
  user,
  onToggleActive,
  onChangeRole,
  isCurrentAdmin,
}: {
  user: UserProfile;
  onToggleActive: (uid: string, ativo: boolean) => void;
  onChangeRole: (uid: string, role: UserRole) => void;
  isCurrentAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const tierConfig = TIER_CONFIG[user.classificacao_atual];

  const initials = user.nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleToggleActive = async () => {
    setActionLoading(true);
    await onToggleActive(user.uid, !user.ativo);
    setActionLoading(false);
    setMenuOpen(false);
  };

  const handleChangeRole = async () => {
    const newRole: UserRole = user.role === "admin" ? "corretor" : "admin";
    setActionLoading(true);
    await onChangeRole(user.uid, newRole);
    setActionLoading(false);
    setMenuOpen(false);
  };

  return (
    <div
      className={`card-premium p-5 animate-fade-up transition-all ${
        !user.ativo ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-amber-400 text-sm font-bold">
              {initials}
            </div>
            {user.role === "admin" && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Crown className="w-3 h-3 text-[#0B0F19]" strokeWidth={2} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">{user.nome}</p>
              {user.role === "admin" && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold">
                  ADMIN
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail className="w-3 h-3 text-slate-600" />
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            {user.creci && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-slate-600 font-mono">
                  CRECI: {user.creci}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Menu de ações */}
        {!isCurrentAdmin && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in origin-top-right z-50">
                <div className="p-2">
                  <button
                    onClick={handleToggleActive}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.ativo ? (
                      <UserX className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                    ) : (
                      <UserCheck className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                    )}
                    <span>{user.ativo ? "Desativar" : "Ativar"}</span>
                  </button>

                  <button
                    onClick={handleChangeRole}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : user.role === "admin" ? (
                      <ShieldOff className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                    )}
                    <span>
                      {user.role === "admin"
                        ? "Rebaixar para Corretor"
                        : "Promover a Admin"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-amber-400">
            {user.pontos_semestre.toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px] text-slate-500">Pts Semestre</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/[0.02]">
          <p className="text-lg font-bold text-white">
            R$ {(user.vgv_acumulado_ano / 1000000).toFixed(1)}M
          </p>
          <p className="text-[10px] text-slate-500">VGV Ano</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/[0.02]">
          <div className="flex items-center justify-center gap-1">
            <Gem className={`w-4 h-4 ${tierConfig.text}`} strokeWidth={1.5} />
            <span className={`text-xs font-bold ${tierConfig.text}`}>
              {tierConfig.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Tier Atual</p>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              user.ativo ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span className="text-[10px] text-slate-500">
            {user.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
        <span className="text-[10px] text-slate-600">
          {user.pontos_trimestre.toLocaleString("pt-BR")} pts trimestre
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Página Principal
// ============================================================

export default function AdminBrokersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminBrokersContent />
    </ProtectedRoute>
  );
}

function AdminBrokersContent() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "corretor" | "admin">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Subscribe to all profiles
  useState(() => {
    const unsub = subscribeAllProfiles((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search
      if (search) {
        const s = search.toLowerCase();
        const matches =
          user.nome.toLowerCase().includes(s) ||
          user.email.toLowerCase().includes(s) ||
          (user.creci && user.creci.toLowerCase().includes(s));
        if (!matches) return false;
      }

      // Role filter
      if (filterRole !== "all" && user.role !== filterRole) return false;

      // Status filter
      if (filterStatus === "active" && !user.ativo) return false;
      if (filterStatus === "inactive" && user.ativo) return false;

      return true;
    });
  }, [users, search, filterRole, filterStatus]);

  const handleToggleActive = async (uid: string, ativo: boolean) => {
    await toggleBrokerActive(uid, ativo);
  };

  const handleChangeRole = async (uid: string, role: UserRole) => {
    await changeBrokerRole(uid, role);
  };

  const stats = {
    total: users.length,
    corretores: users.filter((u) => u.role === "corretor").length,
    admins: users.filter((u) => u.role === "admin").length,
    active: users.filter((u) => u.ativo).length,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
              Gestão de Equipe
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            <span className="text-amber-400">Corretores</span>
          </h1>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, accent: false },
            { label: "Corretores", value: stats.corretores, accent: false },
            { label: "Admins", value: stats.admins, accent: true },
            { label: "Ativos", value: stats.active, accent: true },
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
                className={`text-2xl font-bold ${
                  stat.accent ? "text-amber-400" : "text-white"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="card-premium p-4 mb-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CRECI..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#111827]">Todos os Roles</option>
              <option value="corretor" className="bg-[#111827]">Corretores</option>
              <option value="admin" className="bg-[#111827]">Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#111827]">Todos os Status</option>
              <option value="active" className="bg-[#111827]">Ativos</option>
              <option value="inactive" className="bg-[#111827]">Inativos</option>
            </select>

            {/* Result count */}
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredUsers.length} resultado{filteredUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Lista de Corretores ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" strokeWidth={1} />
            <p className="text-lg text-slate-400 font-medium mb-2">
              Nenhum corretor encontrado
            </p>
            <p className="text-sm text-slate-600">
              {search
                ? "Tente buscar com outros termos"
                : "Aguarde o cadastro de novos corretores"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, i) => (
              <BrokerCard
                key={user.uid}
                user={user}
                onToggleActive={handleToggleActive}
                onChangeRole={handleChangeRole}
                isCurrentAdmin={user.uid === profile?.uid}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
