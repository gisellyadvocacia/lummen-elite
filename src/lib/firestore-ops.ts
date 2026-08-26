// ============================================================
// Lummen Elite — Operações Firestore
// Queries, subscriptions e mutações para o sistema
// ============================================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  UserProfile,
  WeeklyNote,
  Reward,
  UserTier,
  WeeklyNoteStatus,
} from "./types";

// ============================================================
// Queries de Leitura
// ============================================================

/** Busca perfil de um usuário específico */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Busca todos os corretores ativos, ordenados por pontos do semestre */
export async function getAllBrokers(): Promise<UserProfile[]> {
  const q = query(
    collection(db, "users"),
    where("role", "==", "corretor"),
    where("ativo", "==", true),
    orderBy("pontos_semestre", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

/** Busca notas semanais aprovadas de um corretor */
export function subscribeBrokerNotes(
  brokerUid: string,
  callback: (notes: WeeklyNote[]) => void,
  max?: number,
) {
  const constraints: any[] = [
    where("brokerUid", "==", brokerUid),
    where("status", "==", "approved" as WeeklyNoteStatus),
    orderBy("criado_em", "desc"),
  ];
  if (max) constraints.push(limit(max));

  const q = query(collection(db, "weekly_notes"), ...constraints);

  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        criado_em: (data.criado_em as Timestamp)?.toDate() ?? new Date(),
        validado_em: (data.validado_em as Timestamp)?.toDate(),
      } as WeeklyNote;
    });
    callback(notes);
  });
}

/** Busca notas semanais pendentes (para admin) */
export function subscribePendingNotes(
  callback: (notes: WeeklyNote[]) => void,
) {
  const q = query(
    collection(db, "weekly_notes"),
    where("status", "==", "pending" as WeeklyNoteStatus),
    orderBy("criado_em", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        criado_em: (data.criado_em as Timestamp)?.toDate() ?? new Date(),
        validado_em: (data.validado_em as Timestamp)?.toDate(),
      } as WeeklyNote;
    });
    callback(notes);
  });
}

/** Busca todas as notas semanais (para admin/auditoria) */
export function subscribeAllNotes(
  callback: (notes: WeeklyNote[]) => void,
) {
  const q = query(
    collection(db, "weekly_notes"),
    orderBy("criado_em", "desc"),
    limit(100),
  );

  return onSnapshot(q, (snap) => {
    const notes = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        criado_em: (data.criado_em as Timestamp)?.toDate() ?? new Date(),
        validado_em: (data.validado_em as Timestamp)?.toDate(),
      } as WeeklyNote;
    });
    callback(notes);
  });
}

/** Busca todos os perfis (para ranking admin) */
export function subscribeAllUsers(
  callback: (users: UserProfile[]) => void,
) {
  const q = query(
    collection(db, "users"),
    where("role", "==", "corretor"),
    orderBy("pontos_semestre", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => d.data() as UserProfile);
    callback(users);
  });
}

// ============================================================
// Recompensas — Queries
// ============================================================

/** Busca todas as recompensas ativas */
export function subscribeRewards(callback: (rewards: Reward[]) => void) {
  const q = query(
    collection(db, "rewards"),
    orderBy("criado_em", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const rewards = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        criado_em: (data.criado_em as Timestamp)?.toDate() ?? new Date(),
      } as Reward;
    });
    callback(rewards);
  });
}

/** Busca recompensas ativas (para vitrine) */
export function subscribeActiveRewards(callback: (rewards: Reward[]) => void) {
  const q = query(
    collection(db, "rewards"),
    where("isActive", "==", true),
    orderBy("pointsCost", "asc"),
  );

  return onSnapshot(q, (snap) => {
    const rewards = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        criado_em: (data.criado_em as Timestamp)?.toDate() ?? new Date(),
      } as Reward;
    });
    callback(rewards);
  });
}

// ============================================================
// Recompensas — CRUD
// ============================================================

/** Criar nova recompensa */
export async function createReward(reward: Omit<Reward, "id" | "criado_em">): Promise<string> {
  const docRef = await addDoc(collection(db, "rewards"), {
    ...reward,
    criado_em: serverTimestamp(),
  });
  return docRef.id;
}

/** Atualizar recompensa */
export async function updateReward(id: string, data: Partial<Omit<Reward, "id" | "criado_em">>): Promise<void> {
  const rewardRef = doc(db, "rewards", id);
  await updateDoc(rewardRef, {
    ...data,
    atualizado_em: serverTimestamp(),
  });
}

/** Excluir recompensa */
export async function deleteReward(id: string): Promise<void> {
  const rewardRef = doc(db, "rewards", id);
  await deleteDoc(rewardRef);
}

// ============================================================
// Mutações (escrita)
// ============================================================

/** Valida ou rejeita uma nota semanal */
export async function validateWeeklyNote(
  noteId: string,
  status: "approved" | "rejected",
  adminUid: string,
): Promise<void> {
  const noteRef = doc(db, "weekly_notes", noteId);

  if (status === "approved") {
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) throw new Error("Nota não encontrada");
    const noteData = noteSnap.data() as WeeklyNote;

    // Atualizar pontos do corretor
    const userRef = doc(db, "users", noteData.brokerUid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const novosPontosTrim = userData.pontos_trimestre + noteData.pontos_ganhos;
      const novosPontosSem = userData.pontos_semestre + noteData.pontos_ganhos;
      const novoVgv = userData.vgv_acumulado_ano + noteData.vgv_semanal;

      // Calcular nova classificação
      let novaClassificacao: UserTier = "Sem Classificacao";
      if (novosPontosSem >= 5000) novaClassificacao = "Diamante";
      else if (novosPontosSem >= 3000) novaClassificacao = "Rubi";
      else if (novosPontosSem >= 1500) novaClassificacao = "Safira";
      else if (novosPontosSem >= 500) novaClassificacao = "Esmeralda";

      await updateDoc(userRef, {
        pontos_trimestre: novosPontosTrim,
        pontos_semestre: novosPontosSem,
        vgv_acumulado_ano: novoVgv,
        classificacao_atual: novaClassificacao,
        atualizado_em: serverTimestamp(),
      });
    }
  }

  await updateDoc(noteRef, {
    status,
    validado_por: adminUid,
    validado_em: serverTimestamp(),
  });
}
