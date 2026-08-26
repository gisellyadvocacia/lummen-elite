"use client";

// ============================================================
// Lummen Elite — useFirestore Hooks
// Subscriptions em tempo real para dados do Firestore
// ============================================================

import { useState, useEffect, useCallback } from "react";
import {
  subscribeBrokerNotes,
  subscribePendingNotes,
  subscribeAllUsers,
  subscribeAllNotes,
  getAllBrokers,
} from "@/lib/firestore-ops";
import type {
  UserProfile,
  WeeklyNote,
  RankingEntry,
  DashboardData,
  UserTier,
} from "@/lib/types";

// ============================================================
// Tiers para cálculo de classificação
// ============================================================

function calcTier(pontos: number): UserTier {
  if (pontos >= 5000) return "Diamante";
  if (pontos >= 3000) return "Rubi";
  if (pontos >= 1500) return "Safira";
  if (pontos >= 500) return "Esmeralda";
  return "Sem Classificacao";
}

// ============================================================
// Hook: Notas aprovadas do corretor
// ============================================================

export function useBrokerNotes(brokerUid: string | null) {
  const [notes, setNotes] = useState<WeeklyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brokerUid) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeBrokerNotes(brokerUid, (data) => {
      setNotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, [brokerUid]);

  return { notes, loading };
}

// ============================================================
// Hook: Notas pendentes (admin)
// ============================================================

export function usePendingNotes() {
  const [notes, setNotes] = useState<WeeklyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribePendingNotes((data) => {
      setNotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { notes, loading };
}

// ============================================================
// Hook: Todos os usuários (ranking)
// ============================================================

export function useAllUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeAllUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { users, loading };
}

// ============================================================
// Hook: Notas de todos (admin)
// ============================================================

export function useAllNotes() {
  const [notes, setNotes] = useState<WeeklyNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeAllNotes((data) => {
      setNotes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { notes, loading };
}

// ============================================================
// Hook: Dados completos do dashboard do corretor
// ============================================================

export function useDashboardData(profile: UserProfile | null) {
  const { notes, loading: notesLoading } = useBrokerNotes(profile?.uid ?? null);
  const [rankingPosicao, setRankingPosicao] = useState(0);
  const [totalCorretores, setTotalCorretores] = useState(0);
  const [loadingRanking, setLoadingRanking] = useState(true);

  useEffect(() => {
    if (!profile) {
      setLoadingRanking(false);
      return;
    }

    setLoadingRanking(true);

    async function fetchRanking() {
      try {
        const allBrokers = await getAllBrokers();
        setTotalCorretores(allBrokers.length);
        const pos = allBrokers.findIndex((b) => b.uid === profile!.uid);
        setRankingPosicao(pos >= 0 ? pos + 1 : allBrokers.length);
      } catch {
        // Silently handle ranking fetch errors
      } finally {
        setLoadingRanking(false);
      }
    }

    fetchRanking();
  }, [profile]);

  const notasAprovadas = notes.filter((n) => n.status === "approved");
  const notasPendentes = notes.filter((n) => n.status === "pending");
  const totalNotasSemestre = notasAprovadas.length;
  const mediaNotas =
    notasAprovadas.length > 0
      ? notasAprovadas.reduce((acc, n) => acc + n.nota_semanal, 0) /
        notasAprovadas.length
      : 0;

  return {
    profile,
    notesAprovadas: notasAprovadas,
    notasPendentes,
    totalNotasSemestre,
    mediaNotas: Math.round(mediaNotas),
    rankingPosicao,
    totalCorretores,
    loading: notesLoading || loadingRanking,
  };
}
