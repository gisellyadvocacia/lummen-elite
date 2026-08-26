"use client";

// ============================================================
// Lummen Elite — Gerenciamento de Recompensas (Admin)
// CRUD completo: criar, editar, excluir recompensas
// ============================================================

import { useState, useCallback } from "react";
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Package,
  Tag,
  Coins,
  AlertTriangle,
  CheckCircle2,
  Power,
  PowerOff,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeRewards,
  createReward,
  updateReward,
  deleteReward,
} from "@/lib/firestore-ops";
import type { Reward } from "@/lib/types";

// ============================================================
// Modal de Criar/Editar Recompensa
// ============================================================

interface RewardFormData {
  nome: string;
  description: string;
  pointsCost: number;
  category: string;
  stock: number;
  isActive: boolean;
}

const INITIAL_FORM: RewardFormData = {
  nome: "",
  description: "",
  pointsCost: 100,
  category: "experiencias",
  stock: 10,
  isActive: true,
};

const CATEGORIES = [
  { value: "experiencias", label: "🌟 Experiências" },
  { value: "produtos", label: "🎁 Produtos" },
  { value: "servicos", label: "🔧 Serviços" },
  { value: "vouchers", label: "💳 Vouchers" },
];

function RewardModal({
  isOpen,
  onClose,
  onSave,
  reward,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RewardFormData) => Promise<void>;
  reward: Reward | null;
  saving: boolean;
}) {
  const [form, setForm] = useState<RewardFormData>(
    reward
      ? {
          nome: reward.nome,
          description: reward.description,
          pointsCost: reward.pointsCost,
          category: reward.category,
          stock: reward.stock,
          isActive: reward.isActive,
        }
      : INITIAL_FORM
  );

  const isEditing = !!reward;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <Gift className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? "Editar Recompensa" : "Nova Recompensa"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Atualize os dados da recompensa"
                  : "Preencha os dados para criar uma nova recompensa"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Nome da Recompensa
            </label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Vale-Parking Premium"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Descreva a recompensa em detalhes..."
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
            />
          </div>

          {/* Pontos + Estoque */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                <Coins className="w-3 h-3 inline mr-1" />
                Custo em Pontos
              </label>
              <input
                type="number"
                value={form.pointsCost}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pointsCost: parseInt(e.target.value) || 0,
                  })
                }
                min={1}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                <Package className="w-3 h-3 inline mr-1" />
                Estoque
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                }
                min={0}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              <Tag className="w-3 h-3 inline mr-1" />
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat.value}
                  value={cat.value}
                  className="bg-[#111827]"
                >
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
              {form.isActive ? (
                <Power className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
              ) : (
                <PowerOff className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {form.isActive ? "Ativa" : "Inativa"}
                </p>
                <p className="text-xs text-slate-500">
                  {form.isActive
                    ? "Visível para os corretores"
                    : "Oculta da vitrine"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`w-12 h-6 rounded-full transition-all ${
                form.isActive
                  ? "bg-emerald-500/20 border border-emerald-500/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full transition-all ${
                  form.isActive
                    ? "bg-emerald-400 translate-x-6"
                    : "bg-slate-500 translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-[#0B0F19] text-sm font-bold hover:bg-amber-400 transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              )}
              {isEditing ? "Salvar Alterações" : "Criar Recompensa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Modal de Confirmação de Exclusão
// ============================================================

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  rewardName,
  deleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  rewardName: string;
  deleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[#111827] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 animate-scale-in p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-red-500/10">
            <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-bold text-white">Excluir Recompensa</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Tem certeza que deseja excluir{" "}
          <span className="text-white font-semibold">{rewardName}</span>?
          Esta ação não pode ser desfeita.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-slate-400 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            )}
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Página Principal
// ============================================================

export default function AdminRewardsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminRewardsContent />
    </ProtectedRoute>
  );
}

function AdminRewardsContent() {
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deleteModal, setDeleteModal] = useState<Reward | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Subscribe to rewards
  useState(() => {
    const unsub = subscribeRewards((data) => {
      setRewards(data);
      setLoading(false);
    });
    return () => unsub();
  });

  const handleCreate = () => {
    setEditingReward(null);
    setModalOpen(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setModalOpen(true);
  };

  const handleSave = async (data: RewardFormData) => {
    setSaving(true);
    try {
      if (editingReward) {
        await updateReward(editingReward.id, data);
      } else {
        await createReward(data);
      }
      setModalOpen(false);
      setEditingReward(null);
    } catch (err) {
      console.error("Erro ao salvar recompensa:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteReward(deleteModal.id);
      setDeleteModal(null);
    } catch (err) {
      console.error("Erro ao excluir recompensa:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (reward: Reward) => {
    try {
      await updateReward(reward.id, { isActive: !reward.isActive });
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found?.label ?? cat;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
                Gerenciamento
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              <span className="text-amber-400">Recompensas</span>
            </h1>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#0B0F19] text-sm font-bold hover:bg-amber-400 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:block">Nova Recompensa</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : rewards.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <Gift className="w-12 h-12 text-slate-700 mx-auto mb-4" strokeWidth={1} />
            <p className="text-lg text-slate-400 font-medium mb-2">
              Nenhuma recompensa cadastrada
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Crie a primeira recompensa para os corretores resgatarem
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#0B0F19] text-sm font-bold hover:bg-amber-400 transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Criar Recompensa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward, i) => (
              <div
                key={reward.id}
                className={`card-premium p-5 animate-fade-up transition-all ${
                  !reward.isActive ? "opacity-60" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-400 text-[10px] font-semibold">
                      {getCategoryLabel(reward.category)}
                    </span>
                    {!reward.isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 text-[10px] font-semibold">
                        INATIVA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(reward)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors"
                      title={
                        reward.isActive
                          ? "Desativar recompensa"
                          : "Ativar recompensa"
                      }
                    >
                      {reward.isActive ? (
                        <Power className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                      ) : (
                        <PowerOff className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(reward)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setDeleteModal(reward)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-base font-bold text-white mb-2">
                  {reward.nome}
                </h3>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                  {reward.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                    <span className="text-sm font-bold text-amber-400">
                      {reward.pointsCost.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[10px] text-slate-500">pontos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
                    <span className="text-xs text-slate-400">
                      {reward.stock} {reward.stock === 1 ? "unidade" : "unidades"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      <RewardModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReward(null);
        }}
        onSave={handleSave}
        reward={editingReward}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        rewardName={deleteModal?.nome ?? ""}
        deleting={deleting}
      />
    </div>
  );
}
