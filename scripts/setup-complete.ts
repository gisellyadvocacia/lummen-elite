// ============================================================
// Lummen Elite — Setup Completo
// 1. Cria admin no Firebase Auth
// 2. Popula Firestore com dados demo
// ============================================================
// Executar: npx tsx scripts/setup-complete.ts

import { initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Firebase Admin Init
// ============================================================

function initFirebaseAdmin(): App {
  const keyPath = path.join(__dirname, "serviceAccountKey.json");

  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    return initializeApp({ credential: cert(serviceAccount) });
  }

  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    return initializeApp({ credential: cert(JSON.parse(envKey)) });
  }

  console.error("❌ Nenhum serviceAccountKey.json encontrado em scripts/");
  process.exit(1);
}

// ============================================================
// Seed Data
// ============================================================

interface SeedUser {
  uid?: string; // auto-generated if not provided
  nome: string;
  email: string;
  password: string;
  role: "corretor" | "admin";
  creci?: string;
  classificacao_atual:
    | "Sem Classificacao"
    | "Esmeralda"
    | "Safira"
    | "Rubi"
    | "Diamante";
  pontos_trimestre: number;
  pontos_semestre: number;
  vgv_acumulado_ano: number;
}

const SEED_USERS: SeedUser[] = [
  {
    nome: "Eduardo Silva",
    email: "admin@lummenimoveis.com.br",
    password: "Lummen@2026",
    role: "admin",
    classificacao_atual: "Sem Classificacao",
    pontos_trimestre: 0,
    pontos_semestre: 0,
    vgv_acumulado_ano: 0,
  },
  {
    nome: "Marina Rezende",
    email: "admin2@lummen.com.br",
    password: "Lummen@2026",
    role: "admin",
    classificacao_atual: "Sem Classificacao",
    pontos_trimestre: 0,
    pontos_semestre: 0,
    vgv_acumulado_ano: 0,
  },
  {
    nome: "Ricardo Almeida",
    email: "ricardo@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "12345-F",
    classificacao_atual: "Diamante",
    pontos_trimestre: 6200,
    pontos_semestre: 8400,
    vgv_acumulado_ano: 12500000,
  },
  {
    nome: "Fernanda Costa",
    email: "fernanda@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "23456-F",
    classificacao_atual: "Rubi",
    pontos_trimestre: 4100,
    pontos_semestre: 5200,
    vgv_acumulado_ano: 8700000,
  },
  {
    nome: "Lucas Oliveira",
    email: "lucas@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "34567-F",
    classificacao_atual: "Safira",
    pontos_trimestre: 2200,
    pontos_semestre: 3100,
    vgv_acumulado_ano: 5200000,
  },
  {
    nome: "Ana Beatriz Santos",
    email: "ana@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "45678-F",
    classificacao_atual: "Esmeralda",
    pontos_trimestre: 800,
    pontos_semestre: 1200,
    vgv_acumulado_ano: 3100000,
  },
  {
    nome: "Marcos Ribeiro",
    email: "marcos@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "56789-F",
    classificacao_atual: "Esmeralda",
    pontos_trimestre: 550,
    pontos_semestre: 720,
    vgv_acumulado_ano: 1800000,
  },
  {
    nome: "Juliana Mendes",
    email: "juliana@lummen.com.br",
    password: "Corretor@2026",
    role: "corretor",
    creci: "67890-F",
    classificacao_atual: "Sem Classificacao",
    pontos_trimestre: 120,
    pontos_semestre: 180,
    vgv_acumulado_ano: 450000,
  },
];

const SEED_REWARDS = [
  {
    nome: "Vale-Parking Premium",
    description: "30 dias de estacionamento gratuito em estacionamento parceiro.",
    pointsCost: 320,
    category: "servicos",
    stock: 15,
    isActive: true,
  },
  {
    nome: "Jantar para Dois",
    description: "Experiência gastronômica em restaurante premiado com harmonização.",
    pointsCost: 450,
    category: "experiencias",
    stock: 8,
    isActive: true,
  },
  {
    nome: "Kit Design de Interiores",
    description: "Consultoria de 2h com designer + moodboard personalizado.",
    pointsCost: 780,
    category: "servicos",
    stock: 5,
    isActive: true,
  },
  {
    nome: "Cesta de Vinhos Premium",
    description: "6 vinhos selecionados de vinícolas brasileiras premiadas.",
    pointsCost: 520,
    category: "produtos",
    stock: 12,
    isActive: true,
  },
  {
    nome: "Spa Day Complete",
    description: "Dia completo: massagem, hidroterapia e almoço saudável.",
    pointsCost: 890,
    category: "experiencias",
    stock: 3,
    isActive: true,
  },
  {
    nome: "Voucher Viagem",
    description: "Crédito de R$ 500 para reservas em hotéis parceiros.",
    pointsCost: 1200,
    category: "experiencias",
    stock: 6,
    isActive: true,
  },
  {
    nome: "Smart Home Kit",
    description: "Interruptores inteligentes, tomadas Wi-Fi e assistente virtual.",
    pointsCost: 650,
    category: "produtos",
    stock: 10,
    isActive: true,
  },
  {
    nome: "Curso Fotografia Imobiliária",
    description: "Workshop presencial: tire fotos profissionais dos imóveis.",
    pointsCost: 380,
    category: "servicos",
    stock: 20,
    isActive: true,
  },
];

// ============================================================
// Helpers
// ============================================================

function generateWeeklyNotes(brokerUids: string[]) {
  const weeks = ["2026-W30", "2026-W31", "2026-W32", "2026-W33", "2026-W34"];
  const notes: Array<{
    brokerUid: string;
    semana_inicio: string;
    semana_fim: string;
    vendas_fechadas: number;
    vgv_semanal: number;
    pontos_ganhos: number;
    nota_semanal: number;
    status: "approved" | "pending";
  }> = [];

  const brokerPerformance: Record<
    string,
    { base: number; vgvBase: number }
  > = {};

  // Map performance based on tier
  const perfMap: Record<string, { base: number; vgvBase: number }> = {
    Diamante: { base: 3, vgvBase: 600000 },
    Rubi: { base: 2, vgvBase: 400000 },
    Safira: { base: 2, vgvBase: 250000 },
    Esmeralda: { base: 1, vgvBase: 180000 },
    "Sem Classificacao": { base: 0, vgvBase: 50000 },
  };

  brokerUids.forEach((uid) => {
    const user = SEED_USERS.find((u) => u.email.includes(uid) || u.nome.includes(uid));
    // Default performance
    brokerPerformance[uid] = perfMap[user?.classificacao_atual || "Sem Classificacao"] || {
      base: 1,
      vgvBase: 150000,
    };
  });

  // Override with explicit mappings
  const explicitPerf: Record<string, { base: number; vgvBase: number }> = {};
  // We'll use a seeded random approach
  let seed = 42;
  function seededRandom() {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  for (const uid of brokerUids) {
    const perf = brokerPerformance[uid] || { base: 1, vgvBase: 150000 };
    for (const semana of weeks) {
      const vendas = perf.base + Math.floor(seededRandom() * 2);
      const vgv =
        perf.vgvBase + Math.floor(seededRandom() * perf.vgvBase * 0.4);
      const nota = Math.min(
        100,
        Math.floor(60 + vendas * 12 + seededRandom() * 10)
      );
      const pontos = Math.floor(nota * 2);
      const isPending = weeks.indexOf(semana) >= 3;

      notes.push({
        brokerUid: uid,
        semana_inicio: semana,
        semana_fim: semana,
        vendas_fechadas: vendas,
        vgv_semanal: vgv,
        pontos_ganhos: pontos,
        nota_semanal: nota,
        status: isPending ? "pending" : "approved",
      });
    }
  }

  return notes;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log("🚀 Lummen Elite — Setup Completo\n");
  console.log("═══════════════════════════════════════\n");

  const app = initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore(app);

  // ── Step 1: Create users in Firebase Auth ──
  console.log("📧 Etapa 1/4 — Criando usuários no Firebase Auth...\n");

  const createdUids: string[] = [];

  for (const user of SEED_USERS) {
    try {
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.nome,
        emailVerified: true,
      });

      console.log(
        `   ✅ ${user.nome} → ${user.email} [UID: ${userRecord.uid}]`
      );
      createdUids.push(userRecord.uid);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/email-already-exists") {
        // User already exists, get the UID
        const existing = await auth.getUserByEmail(user.email);
        console.log(
          `   ⏭️  ${user.nome} → já existe [UID: ${existing.uid}]`
        );
        createdUids.push(existing.uid);
      } else {
        console.error(
          `   ❌ Erro ao criar ${user.email}: ${err.message || err.code}`
        );
      }
    }
  }

  console.log(`\n   → ${createdUids.length} usuários processados\n`);

  // ── Step 2: Create Firestore profiles ──
  console.log("👤 Etapa 2/4 — Criando perfis no Firestore...\n");

  const profilePromises = SEED_USERS.map(async (user, index) => {
    const uid = createdUids[index];
    if (!uid) return;

    await db.collection("users").doc(uid).set({
      uid,
      nome: user.nome,
      email: user.email,
      role: user.role,
      creci: user.creci || null,
      classificacao_atual: user.classificacao_atual,
      pontos_trimestre: user.pontos_trimestre,
      pontos_semestre: user.pontos_semestre,
      vgv_acumulado_ano: user.vgv_acumulado_ano,
      ativo: true,
      criado_em: FieldValue.serverTimestamp(),
      atualizado_em: FieldValue.serverTimestamp(),
    });

    console.log(
      `   ✅ ${user.nome} (${user.role}) — ${user.classificacao_atual}`
    );
  });

  await Promise.all(profilePromises);
  console.log(`\n   → ${SEED_USERS.length} perfis criados\n`);

  // ── Step 3: Create weekly notes ──
  console.log("📋 Etapa 3/4 — Criando notas semanais...\n");

  const brokerUids = createdUids.filter(
    (_, i) => SEED_USERS[i].role === "corretor"
  );
  const weeklyNotes = generateWeeklyNotes(brokerUids);

  let notesCount = 0;
  const notePromises = weeklyNotes.map(async (note) => {
    await db.collection("weekly_notes").add({
      ...note,
      criado_em: FieldValue.serverTimestamp(),
    });
    notesCount++;
  });

  await Promise.all(notePromises);
  console.log(`   → ${notesCount} notas semanais criadas\n`);

  // ── Step 4: Create rewards ──
  console.log("🎁 Etapa 4/4 — Criando recompensas...\n");

  const rewardPromises = SEED_REWARDS.map(async (reward) => {
    await db.collection("rewards").add({
      ...reward,
      criado_em: FieldValue.serverTimestamp(),
    });
    console.log(`   ✅ ${reward.nome} (${reward.pointsCost} pts)`);
  });

  await Promise.all(rewardPromises);
  console.log(`\n   → ${SEED_REWARDS.length} recompensas criadas\n`);

  // ── Summary ──
  console.log("═══════════════════════════════════════\n");
  console.log("✨ Setup concluído com sucesso!\n");
  console.log("📊 Resumo:");
  console.log(`   • ${SEED_USERS.length} usuários (2 admins + 6 corretores)`);
  console.log(`   • ${notesCount} notas semanais`);
  console.log(`   • ${SEED_REWARDS.length} recompensas\n`);
  console.log("🔑 Credenciais de teste:\n");
  console.log("   ADMINS:");
  console.log("   • admin@lummenimoveis.com.br / Lummen@2026");
  console.log("   • admin2@lummen.com.br / Lummen@2026\n");
  console.log("   CORRETOR (Diamante):");
  console.log("   • ricardo@lummen.com.br / Corretor@2026\n");
  console.log("   CORRETOR (Rubi):");
  console.log("   • fernanda@lummen.com.br / Corretor@2026\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Erro no setup:", err);
  process.exit(1);
});
