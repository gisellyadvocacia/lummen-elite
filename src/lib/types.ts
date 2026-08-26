// ============================================================
// Lummen Elite — Tipos e Interfaces do Sistema
// Dark Premium · RBAC · Firestore Model
// ============================================================

import type { Timestamp } from "firebase/firestore";

// ============================================================
// RBAC — Perfis de Usuário e Controle de Acesso
// ============================================================

/** Papéis do sistema */
export type UserRole = "corretor" | "admin";

/** Classificações do corretor (tiers de pedras preciosas) */
export type UserTier =
  | "Sem Classificacao"
  | "Esmeralda"
  | "Safira"
  | "Rubi"
  | "Diamante";

/** Documento completo do usuário no Firestore `/users/{uid}` */
export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  role: UserRole;
  creci?: string;
  classificacao_atual: UserTier;
  pontos_trimestre: number;
  pontos_semestre: number;
  vgv_acumulado_ano: number;
  ativo: boolean;
  criado_em: Timestamp;
  atualizado_em: Timestamp;
}

/** Payload para criação de novo perfil (sem timestamps, uid é a chave) */
export type CreateUserProfile = Omit<UserProfile, "criado_em" | "atualizado_em">;

/** Dados padrão para provisionamento automático */
export const DEFAULT_USER_PROFILE: CreateUserProfile = {
  uid: "",
  nome: "",
  email: "",
  role: "corretor",
  classificacao_atual: "Sem Classificacao",
  pontos_trimestre: 0,
  pontos_semestre: 0,
  vgv_acumulado_ano: 0,
  ativo: true,
};

// ============================================================
// Configuração Visual por Tier
// ============================================================

export interface TierConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  glow: string;
  minPontos: number;
}

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  "Sem Classificacao": {
    label: "Sem Classificação",
    bg: "bg-slate-800/50",
    text: "text-slate-400",
    border: "border-slate-700/50",
    glow: "",
    minPontos: 0,
  },
  Esmeralda: {
    label: "Esmeralda",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "shadow-[0_0_32px_rgba(16,185,129,0.15)]",
    minPontos: 500,
  },
  Safira: {
    label: "Safira",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    glow: "shadow-[0_0_32px_rgba(59,130,246,0.15)]",
    minPontos: 1500,
  },
  Rubi: {
    label: "Rubi",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "shadow-[0_0_32px_rgba(239,68,68,0.15)]",
    minPontos: 3000,
  },
  Diamante: {
    label: "Diamante",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_48px_rgba(245,158,11,0.2)]",
    minPontos: 5000,
  },
};

// ============================================================
// Mapeamento de Erros Firebase → Português
// ============================================================

export const FIREBASE_ERROR_MAP: Record<string, string> = {
  // ── Autenticação ──
  "auth/invalid-email": "E-mail inválido. Verifique o formato.",
  "auth/user-disabled": "Esta conta foi desativada. Contate o suporte.",
  "auth/user-not-found": "Usuário não encontrado. Verifique seu e-mail.",
  "auth/wrong-password": "Senha incorreta. Tente novamente.",
  "auth/invalid-credential":
    "Credenciais inválidas. Verifique e-mail e senha.",
  "auth/email-already-in-use":
    "Este e-mail já está em uso. Tente fazer login.",
  "auth/weak-password":
    "Senha fraca. Use pelo menos 6 caracteres com letras e números.",
  "auth/too-many-requests":
    "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
  "auth/network-request-failed":
    "Erro de conexão. Verifique sua internet e tente novamente.",
  "auth/popup-closed-by-user": "Login cancelado. A janela foi fechada.",
  "auth/popup-blocked":
    "Pop-up bloqueado pelo navegador. Permita pop-ups para este site.",
  "auth/operation-not-allowed":
    "Este método de login não está habilitado. Contate o suporte.",
  "auth/account-exists-with-different-credential":
    "Já existe uma conta com este e-mail usando outro método de login.",
  "auth/credential-already-in-use":
    "Esta credencial já está associada a outra conta.",
  "auth/requires-recent-login":
    "Operação requer re-autenticação. Faça login novamente.",

  // ── Firestore ──
  "permission-denied": "Sem permissão para acessar estes dados.",
  "not-found": "Documento não encontrado.",
  "already-exists": "Este registro já existe.",
  "resource-exhausted": "Limite de requisições atingido. Aguarde.",
  "failed-precondition": "Operação não permitida no estado atual.",
  "unauthenticated": "Usuário não autenticado. Faça login novamente.",
  "unavailable": "Serviço temporariamente indisponível. Tente novamente.",

  // ── Genérico ──
  "auth/unknown": "Erro desconhecido. Tente novamente.",
};

/**
 * Traduz erro do Firebase para mensagem em português.
 * Retorna a mensagem original caso não haja mapeamento.
 */
export function translateFirebaseError(error: {
  code?: string;
  message?: string;
}): string {
  const code = error.code ?? "";
  return (
    FIREBASE_ERROR_MAP[code] ??
    `Erro: ${error.message ?? "Tente novamente."}`
  );
}

// ============================================================
// Status de Resgate
// ============================================================

export type RedemptionStatus =
  | "pending"
  | "approved"
  | "delivered"
  | "cancelled";

export const REDEMPTION_STATUS: Record<
  RedemptionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "Pendente",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  approved: {
    label: "Aprovado",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  delivered: {
    label: "Entregue",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
};

// ============================================================
// Transações e Recompensas
// ============================================================

export interface PointsTransaction {
  id: string;
  brokerUid: string;
  type: "earned" | "redeemed";
  points: number;
  description: string;
  createdAt: Date;
  propertyId?: string;
}

export interface Reward {
  id: string;
  nome: string;
  description: string;
  pointsCost: number;
  category: string;
  stock: number;
  isActive: boolean;
  criado_em: Date;
}

export interface Redemption {
  id: string;
  brokerUid: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  status: RedemptionStatus;
  createdAt: Date;
}

// ============================================================
// Notas Semanais e Ranking
// ============================================================

/** Status de uma nota semanal */
export type WeeklyNoteStatus =
  | "pending"   // Aguardando validação do admin
  | "approved"  // Validada pelo admin
  | "rejected"; // Rejeitada pelo admin

/** Registro de nota semanal de desempenho */
export interface WeeklyNote {
  id: string;
  brokerUid: string;
  semana_inicio: string;  // "2026-W35" (ISO week)
  semana_fim: string;     // "2026-W35"
  vendas_fechadas: number;
  vgv_semanal: number;     // Valor Geral de Vendas da semana
  pontos_ganhos: number;   // Pontos calculados com base na nota
  nota_semanal: number;    // Nota de 0 a 100
  status: WeeklyNoteStatus;
  validado_por?: string;   // uid do admin
  validado_em?: Date;
  criado_em: Date;
}

/** Dados para exibição do ranking */
export interface RankingEntry {
  position: number;
  uid: string;
  nome: string;
  creci?: string;
  classificacao: UserTier;
  pontos_semestre: number;
  vgv_acumulado: number;
  vendas_semana: number;
  fotoUrl?: string;
}

/** Dados agregados do dashboard do corretor */
export interface DashboardData {
  profile: UserProfile;
  notesAprovadas: WeeklyNote[];
  notasPendentes: WeeklyNote[];
  totalNotasSemestre: number;
  mediaNotas: number;
  rankingPosicao: number;
  totalCorretores: number;
}

/** Estatísticas do painel admin */
export interface AdminStats {
  totalCorretores: number;
  corretoresAtivos: number;
  totalNotasPendentes: number;
  totalVendasSemana: number;
  mediaGeral: number;
}
