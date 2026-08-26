// ============================================================
// Lummen Elite — Gerenciador de Roles
// Utilitário CLI para promover/rebaixar usuários
// ============================================================
// Executar:
//   npx tsx scripts/manage-roles.ts list              → Lista todos os usuários
//   npx tsx scripts/manage-roles.ts promote <uid>     → Torna admin
//   npx tsx scripts/manage-roles.ts demote <uid>      → Torna corretor
//   npx tsx scripts/manage-roles.ts create-admin <email> <senha> <nome>

import { initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

function initFirebaseAdmin(): App {
  const keyPath = path.join(__dirname, "serviceAccountKey.json");
  if (fs.existsSync(keyPath)) {
    const sa = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    return initializeApp({ credential: cert(sa) });
  }
  const envKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    return initializeApp({ credential: cert(JSON.parse(envKey)) });
  }
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";
  console.log("⚠️  Usando Firestore Emulator");
  return initializeApp({ projectId: "lummen-elite-dev" });
}

async function listUsers(db: FirebaseFirestore.Firestore) {
  const snap = await db.collection("users").orderBy("role", "asc").get();
  console.log("\n📋 Todos os usuários:\n");
  console.log("  UID".padEnd(16) + "ROLE".padEnd(12) + "NOME".padEnd(25) + "EMAIL");
  console.log("  " + "─".repeat(70));

  for (const doc of snap.docs) {
    const d = doc.data();
    const role = d.role === "admin" ? "👑 admin" : "  corretor";
    console.log(
      `  ${doc.id.padEnd(14)}${role.padEnd(14)}${(d.nome ?? "?").padEnd(25)}${d.email ?? "?"}`
    );
  }
  console.log();
}

async function promoteUser(db: FirebaseFirestore.Firestore, uid: string) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`❌ Usuário ${uid} não encontrado.`);
    return;
  }
  const data = snap.data()!;
  if (data.role === "admin") {
    console.log(`ℹ️  ${data.nome} já é admin.`);
    return;
  }
  await ref.update({ role: "admin", atualizado_em: FieldValue.serverTimestamp() });
  console.log(`✅ ${data.nome} (${uid}) promovido a admin.`);
}

async function demoteUser(db: FirebaseFirestore.Firestore, uid: string) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`❌ Usuário ${uid} não encontrado.`);
    return;
  }
  const data = snap.data()!;
  if (data.role === "corretor") {
    console.log(`ℹ️  ${data.nome} já é corretor.`);
    return;
  }
  await ref.update({ role: "corretor", atualizado_em: FieldValue.serverTimestamp() });
  console.log(`✅ ${data.nome} (${uid}) rebaixado para corretor.`);
}

async function createAdmin(
  app: App,
  db: FirebaseFirestore.Firestore,
  email: string,
  password: string,
  nome: string,
) {
  const auth = getAuth();
  try {
    const userRecord = await auth.createUser({ email, password, displayName: nome, emailVerified: true });
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      nome,
      email,
      role: "admin",
      classificacao_atual: "Sem Classificacao",
      pontos_trimestre: 0,
      pontos_semestre: 0,
      vgv_acumulado_ano: 0,
      ativo: true,
      criado_em: FieldValue.serverTimestamp(),
      atualizado_em: FieldValue.serverTimestamp(),
    });
    console.log(`\n✅ Admin criado com sucesso!`);
    console.log(`   UID:   ${userRecord.uid}`);
    console.log(`   Nome:  ${nome}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role:  admin\n`);
  } catch (err: any) {
    console.error(`❌ Erro ao criar admin: ${err.message}`);
  }
}

// ── CLI ──
async function main() {
  const [,, command, ...args] = process.argv;

  if (!command) {
    console.log(`
Lummen Elite — Gerenciador de Roles

Uso:
  npx tsx scripts/manage-roles.ts list                    Lista todos os usuários
  npx tsx scripts/manage-roles.ts promote <uid>           Promove para admin
  npx tsx scripts/manage-roles.ts demote <uid>            Rebaixa para corretor
  npx tsx scripts/manage-roles.ts create-admin <email> <senha> <nome>   Cria admin direto
`);
    return;
  }

  const app = initFirebaseAdmin();
  const db = getFirestore(app);

  switch (command) {
    case "list":
      await listUsers(db);
      break;
    case "promote":
      if (!args[0]) { console.error("Uso: promote <uid>"); return; }
      await promoteUser(db, args[0]);
      break;
    case "demote":
      if (!args[0]) { console.error("Uso: demote <uid>"); return; }
      await demoteUser(db, args[0]);
      break;
    case "create-admin":
      if (args.length < 3) {
        console.error("Uso: create-admin <email> <senha> <nome>");
        return;
      }
      await createAdmin(app, db, args[0], args[1], args[2]);
      break;
    default:
      console.error(`Comando desconhecido: ${command}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
