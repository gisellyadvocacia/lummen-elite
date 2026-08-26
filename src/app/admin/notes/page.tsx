"use client";

// ============================================================
// Lummen Elite — Gerenciamento de Notas Semanais (Admin)
// Criar, editar, excluir e validar notas semanais
// ============================================================

import { useState, useMemo } from "react";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Calendar,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  subscribeAllNotes,
  subscribeAllUsers,
  createWeeklyNote,
  updateWeeklyNote,
  deleteWeeklyNote,
  validateWeeklyNote,
} from "@/lib/firestore-ops";
import type { WeeklyNote, UserProfile, WeeklyNoteStatus } from "@/lib/types";

// ============================================================
// Modal de Criar/Editar Nota
// ============================================================

interface NoteFormData {
  brokerUid: string;
  semana_inicio: string;
  semana_fim: string;
  vendas_fechadas: number;
  vgv_semanal: number;
  pontos_ganhos: number;
  nota_semanal: number;
  status: WeeklyNoteStatus;
}

const INITIAL_FORM: NoteFormData = {
  brokerUid: "",
  semana_inicio: "",
  semana_fim: "",
  vendas_fechadas: 0,
  vgv_semanal: 0,
  pontos_ganhos: 0,
  nota_semanal: 0,
  status: "pending",
};

const WEEKS = [
  "2026-W30",
  "2026-W31",
  "2026-W32",
  "2026-W33",
  "2026-W34",
  "2026-W35",
  "2026-W36",
  "2026-W37",
  "2026-W38",
  "2026-W39",
  "2026-W40",
  "2026-W41",
  "2026-W42",
  "2026-W43",
  "2026-W44",
  "2026-W45",
  "2026-W46",
  "2026-W47",
  "2026-W48",
  "2026-W49",
  "2026-W50",
  "2026-W51",
  "2026-W52",
];

function NoteModal({
  isOpen,
  onClose,
  onSave,
  note,
  brokers,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => Promise<void>;
  note: WeeklyNote | null;
  brokers: UserProfile[];
  saving: boolean;
}) {
  const [form, setForm] = useState<NoteFormData>(
    note
      ? {
          brokerUid: note.brokerUid,
          semana_inicio: note.semana_inicio,
          semana_fim: note.semana_fim,
          vendas_fechadas: note.vendas_fechadas,
          vgv_semanal: note.vgv_semanal,
          pontos_ganhos: note.pontos_ganhos,
          nota_semanal: note.nota_semanal,
          status: note.status,
        }
      : INITIAL_FORM
  );

  const isEditing = !!note;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  // Auto-calculate points based on nota
  const handleNotaChange = (nota: number) => {
    const pontos = Math.floor(nota * 2);
    setForm({ ...form, nota_semanal: nota, pontos_ganhos: pontos });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10">
              <ClipboardList className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? "Editar Nota" : "Nova Nota Semanal"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Atualize os dados da nota"
                  : "Preencha os dados para criar uma nova nota"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Corretor */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Corretor
            </label>
            <select
              value={form.brokerUid}
              onChange={(e) =>
                setForm({ ...form, brokerUid: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#111827]">
                Selecione um corretor
              </option>
              {brokers.map((b) => (
                <option key={b.uid} value={b.uid} className="bg-[#111827]">
                  {b.nome} {b.creci ? `(${b.creci})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Semana */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              <Calendar className="w-3 h-3 inline mr-1" />
              Semana
            </label>
            <select
              value={form.semana_inicio}
              onChange={(e) =>
                setForm({
                  ...form,
                  semana_inicio: e.target.value,
                  semana_fim: e.target.value,
                })
              }
              required
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#111827]">
                Selecione a semana
              </option>
              {WEEKS.map((w) => (
                <option key={w} value={w} className="bg-[#111827]">
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Vendas + VGV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Vendas Fechadas
              </label>
              <input
                type="number"
                value={form.vendas_fechadas}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vendas_fechadas: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                VGV Semanal (R$)
              </label>
              <input
                type="number"
                value={form.vgv_semanal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vgv_semanal: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
          </div>

          {/* Nota + Pontos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Nota (0-100)
              </label>
              <input
                type="number"
                value={form.nota_semanal}
                onChange={(e) =>
                  handleNotaChange(parseInt(e.target.value) || 0)
                }
                min={0}
                max={100}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                Pontos Ganhos
              </label>
              <input
                type="number"
                value={form.pontos_ganhos}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pontos_ganhos: parseInt(e.target.value) || 0,
                  })
                }
                min={0}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all"
              />
              <p className="text-[10px] text-slate-600 mt-1">
                Auto: nota × 2 = {form.nota_semanal * 2} pts
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as WeeklyNoteStatus,
                })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="pending" className="bg-[#111827]">
                ⏳ Pendente
              </option>
              <option value="approved" className="bg-[#111827]">
                ✅ Aprovado
              </option>
              <option value="rejected" className="bg-[#111827]">
                ❌ Rejeitado
              </option>
            </select>
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
              {isEditing ? "Salvar" : "Criar Nota"}
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
  noteInfo,
  deleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteInfo: string;
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
          <h3 className="text-lg font-bold text-white">Excluir Nota</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Tem certeza que deseja excluir a nota{" "}
          <span className="text-white font-semibold">{noteInfo}</span>?
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

export default function AdminNotesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminNotesContent />
    </ProtectedRoute>
  );
}

function AdminNotesContent() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<WeeklyNote[]>([]);
  const [brokers, setBrokers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<WeeklyNoteStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WeeklyNote | null>(null);
  const [deleteModal, setDeleteModal] = useState<WeeklyNote | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  // Subscribe to data
  useState(() => {
    const unsubNotes = subscribeAllNotes((data) => {
      setNotes(data);
      setLoading(false);
    });
    const unsubBrokers = subscribeAllUsers((data) => {
      setBrokers(data);
    });
    return () => {
      unsubNotes();
      unsubBrokers();
    };
  });

  // Map uid → nome
  const userMap = useMemo(
    () => new Map(brokers.map((b) => [b.uid, b.nome])),
    [brokers]
  );

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      if (search) {
        const brokerName = userMap.get(note.brokerUid) ?? "";
        if (
          !brokerName.toLowerCase().includes(search.toLowerCase()) &&
          !note.semana_inicio.toLowerCase().includes(search.toLowerCase())
        ) {
          return false;
        }
      }
      if (filterStatus !== "all" && note.status !== filterStatus) return false;
      return true;
    });
  }, [notes, search, filterStatus, userMap]);

  const handleCreate = () => {
    setEditingNote(null);
    setModalOpen(true);
  };

  const handleEdit = (note: WeeklyNote) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleSave = async (data: NoteFormData) => {
    setSaving(true);
    try {
      if (editingNote) {
        await updateWeeklyNote(editingNote.id, data);
      } else {
        await createWeeklyNote(data);
      }
      setModalOpen(false);
      setEditingNote(null);
    } catch (err) {
      console.error("Erro ao salvar nota:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteWeeklyNote(deleteModal.id);
      setDeleteModal(null);
    } catch (err) {
      console.error("Erro ao excluir nota:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleValidate = async (noteId: string, status: "approved" | "rejected") => {
    if (!profile) return;
    setValidating(noteId);
    try {
      await validateWeeklyNote(noteId, status, profile.uid);
    } catch (err) {
      console.error("Erro ao validar nota:", err);
    } finally {
      setValidating(null);
    }
  };

  const stats = {
    total: notes.length,
    approved: notes.filter((n) => n.status === "approved").length,
    pending: notes.filter((n) => n.status === "pending").length,
    rejected: notes.filter((n) => n.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8 animate-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest">
                Gestão de Notas
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Notas <span className="text-amber-400">Semanais</span>
            </h1>
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-[#0B0F19] text-sm font-bold hover:bg-amber-400 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span className="hidden sm:block">Nova Nota</span>
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, accent: false, icon: BarChart3 },
            { label: "Aprovadas", value: stats.approved, accent: true, icon: CheckCircle2 },
            { label: "Pendentes", value: stats.pending, accent: stats.pending > 0, icon: Clock },
            { label: "Rejeitadas", value: stats.rejected, accent: false, icon: XCircle },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card-premium p-4 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <stat.icon
                  className={`w-4 h-4 ${stat.accent ? "text-amber-400" : "text-slate-600"}`}
                  strokeWidth={1.5}
                />
              </div>
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
            <div className="flex-1 relative w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Buscar por corretor ou semana..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30 transition-all"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as WeeklyNoteStatus | "all")}
              className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white focus:outline-none focus:border-amber-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="all" className="bg-[#111827]">Todos os Status</option>
              <option value="approved" className="bg-[#111827]">✅ Aprovadas</option>
              <option value="pending" className="bg-[#111827]">⏳ Pendentes</option>
              <option value="rejected" className="bg-[#111827]">❌ Rejeitadas</option>
            </select>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {filteredNotes.length} resultado{filteredNotes.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ── Lista de Notas ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="card-premium p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-700 mx-auto mb-4" strokeWidth={1} />
            <p className="text-lg text-slate-400 font-medium mb-2">
              Nenhuma nota encontrada
            </p>
            <p className="text-sm text-slate-600">
              {search
                ? "Tente buscar com outros termos"
                : "Clique em 'Nova Nota' para criar a primeira nota semanal"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note, i) => (
              <div
                key={note.id}
                className="card-premium p-5 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {userMap.get(note.brokerUid) ?? "Corretor"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-slate-500">
                          Semana {note.semana_inicio}
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">
                          {note.vendas_fechadas} vendas
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">
                          VGV R$ {note.vgv_semanal.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Nota + Pontos */}
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          note.nota_semanal >= 70
                            ? "text-emerald-400"
                            : note.nota_semanal >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {note.nota_semanal}
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold">
                        +{note.pontos_ganhos} pts
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        note.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : note.status === "pending"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {note.status === "approved"
                        ? "APROVADO"
                        : note.status === "pending"
                          ? "PENDENTE"
                          : "REJEITADO"}
                    </span>

                    {/* Ações */}
                    <div className="flex items-center gap-1">
                      {note.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleValidate(note.id, "approved")}
                            disabled={validating === note.id}
                            className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors"
                            title="Aprovar"
                          >
                            {validating === note.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                            )}
                          </button>
                          <button
                            onClick={() => handleValidate(note.id, "rejected")}
                            disabled={validating === note.id}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Rejeitar"
                          >
                            <XCircle className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-amber-400 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setDeleteModal(note)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      <NoteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
        note={editingNote}
        brokers={brokers}
        saving={saving}
      />

      <DeleteConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        noteInfo={
          deleteModal
            ? `${userMap.get(deleteModal.brokerUid) ?? "Corretor"} - Semana ${deleteModal.semana_inicio}`
            : ""
        }
        deleting={deleting}
      />
    </div>
  );
}
