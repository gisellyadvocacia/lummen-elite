// ============================================================
// Lummen Elite — Seed Firestore
// Popula o banco com dados demo realistas para desenvolvimento
// ============================================================
// Executar: npx tsx scripts/seed-firestore.ts
// Requer: FIREBASE_SERVICE_ACCOUNT_KEY no .env.local
//         (ou configure o serviceAccountKey.json)

import { initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore,FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Configuração do Firebase Admin
// ============================================================

function initFirebaseAdmin(): App {
  // Tenta carregar service account de arquivo
  const keyPath = path.join(__dirname, "serviceAccountKey.json");

  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Tenta variável de ambiente
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    const serviceAccount = JSON.parse(envKey);
    return initializeApp({ credential: cert(serviceAccount) });
  }

  // Fallback: emulator local
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  console.log("⚠️  Usando Firestore Emulator (localhost:8080)");
  return initializeApp({ projectId: "lummen-elite-dev" });
}

// ============================================================
// Dados Demo
// ============================================================

interface SeedUser {
  uid: string;
  nome: string;
  email: string;
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
  // ── Admin ──
  {
    uid: "admin-001",
    nome: "Marina Rezende",
    email: "admin@lummen.com.br",
    role: "admin",
    classificacao_atual: "Sem Classificacao",
    pontos_trimestre: 0,
    pontos_semestre: 0,
    vgv_acumulado_ano: 0,
  },

  // ── Corretores com diferentes tiers ──
  {
    uid: "broker-001",
    nome: "Ricardo Almeida",
    email: "ricardo@lummen.com.br",
    role: "corretor",
    creci: "12345-F",
    classificacao_atual: "Diamante",
    pontos_trimestre: 6200,
    pontos_semestre: 8400,
    vgv_acumulado_ano: 12500000,
  },
  {
    uid: "broker-002",
    nome: "Fernanda Costa",
    email: "fernanda@lummen.com.br",
    role: "corretor",
    creci: "23456-F",
    classificacao_atual: "Rubi",
    pontos_trimestre: 4100,
    pontos_semestre: 5200,
    vgv_acumulado_ano: 8700000,
  },
  {
    uid: "broker-003",
    nome: "Lucas Oliveira",
    email: "lucas@lummen.com.br",
    role: "corretor",
    creci: "34567-F",
    classificacao_atual: "Safira",
    pontos_trimestre: 2200,
    pontos_semestre: 3100,
    vgv_acumulado_ano: 5200000,
  },
  {
    uid: "broker-004",
    nome: "Ana Beatriz Santos",
    email: "ana@lummen.com.br",
    role: "corretor",
    creci: "45678-F",
    classificacao_atual: "Esmeralda",
    pontos_trimestre: 800,
    pontos_semestre: 1200,
    vgv_acumulado_ano: 3100000,
  },
  {
    uid: "broker-005",
    nome: "Marcos Ribeiro",
    email: "marcos@lummen.com.br",
    role: "corretor",
    creci: "56789-F",
    classificacao_atual: "Esmeralda",
    pontos_trimestre: 550,
    pontos_semestre: 720,
    vgv_acumulado_ano: 1800000,
  },
  {
    uid: "broker-006",
    nome: "Juliana Mendes",
    email: "juliana@lummen.com.br",
    role: "corretor",
    creci: "67890-F",
    classificacao_atual: "Sem Classificacao",
    pontos_trimestre: 120,
    pontos_semestre: 180,
    vgv_acumulado_ano: 450000,
  },
];

// ============================================================
// Gerar Notas Semanais
// ============================================================

function generateWeeklyNotes(): Array<{
  brokerUid: string;
  semana: string;
  vendas: number;
  vgv: number;
  pontos: number;
  nota: number;
  status: "approved" | "pending";
}> {
  const weeks = ["2026-W30", "2026-W31", "2026-W32", "2026-W33", "2026-W34"];
  const notes: Array<{
    brokerUid: string;
    semana: string;
    vendas: number;
    vgv: number;
    pontos: number;
    nota: number;
    status: "approved" | "pending";
  }> = [];

  const brokerPerformance: Record<string, { base: number; vgvBase: number }> = {
    "broker-001": { base: 3, vgvBase: 600000 },
    "broker-002": { base: 2, vgvBase: 400000 },
    "broker-003": { base: 2, vgvBase: 250000 },
    "broker-004": { base: 1, vgvBase: 180000 },
    "broker-005": { base: 1, vgvBase: 120000 },
    "broker-006": { base: 0, vgvBase: 50000 },
  };

  for (const uid of Object.keys(brokerPerformance)) {
    const perf = brokerPerformance[uid];
    for (const semana of weeks) {
      const vendas = perf.base + Math.floor(Math.random() * 2);
      const vgv = perf.vgvBase + Math.floor(Math.random() * perf.vgvBase * 0.4);
      const nota = Math.min(100, Math.floor(60 + vendas * 12 + Math.random() * 10));
      const pontos = Math.floor(nota * 2);

      // Apenas as 3 primeiras semanas aprovadas, últimas pendentes
      const isPending = weeks.indexOf(semana) >= 3;

      notes.push({
        brokerUid: uid,
        semana,
        vendas,
        vgv,
        pontos,
        nota,
        status: isPending ? "pending" : "approved",
      });
    }
  }

  return notes;
}

// ============================================================
// Gerar Recompensas
// ============================================================

interface SeedReward {
  nome: string;
  description: string;
  pointsCost: number;
  category: string;
  stock: number;
  isActive: boolean;
}

const SEED_REWARDS: SeedReward[] = [
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
// Execução do Seed
// ============================================================

async function seed() {
  console.log("🌱 Iniciando seed do Firestore...\n");

  const app = initFirebaseAdmin();
  const db = getFirestore(app);

  // ── 1. Usuários ──
  console.log("👤 Criando usuários...");
  const userPromises = SEED_USERS.map(async (u) => {
    await db.collection("users").doc(u.uid).set({
      ...u,
      ativo: true,
      criado_em: FieldValue.serverTimestamp(),
      atualizado_em: FieldValue.serverTimestamp(),
    });
    console.log(`   ✅ ${u.nome} (${u.role})`);
  });
  await Promise.all(userPromises);
  console.log(`   → ${SEED_USERS.length} usuários criados\n`);

  // ── 2. Notas Semanais ──
  console.log("📋 Criando notas semanais...");
  const weeklyNotes = generateWeeklyNotes();
  let notesCount = 0;
  const notePromises = weeklyNotes.map(async (n) => {
    const semanaInicio = n.semana;
    await db.collection("weekly_notes").add({
      brokerUid: n.brokerUid,
      semana_inicio: semanaInicio,
      semana_fim: semanaInicio,
      vendas_fechadas: n.vendas,
      vgv_semanal: n.vgv,
      pontos_ganhos: n.pontos,
      nota_semanal: n.nota,
      status: n.status,
      criado_em: FieldValue.serverTimestamp(),
    });
    notesCount++;
  });
  await Promise.all(notePromises);
  console.log(`   → ${notesCount} notas semanais criadas\n`);

  // ── 3. Recompensas ──
  console.log("🎁 Criando recompensas...");
  const rewardPromises = SEED_REWARDS.map(async (r) => {
    await db.collection("rewards").add({
      ...r,
      criado_em: FieldValue.serverTimestamp(),
    });
    console.log(`   ✅ ${r.nome}`);
  });
  await Promise.all(rewardPromises);
  console.log(`   → ${SEED_REWARDS.length} recompensas criadas\n`);

  console.log("✨ Seed concluído com sucesso!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Erro no seed:", err);
  process.exit(1);
});
