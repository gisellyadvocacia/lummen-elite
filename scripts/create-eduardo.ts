// ============================================================
// Criar conta do Eduardo com email correto
// ============================================================

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

function initFirebaseAdmin() {
  const keyPath = path.join(__dirname, "serviceAccountKey.json");
  const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
  return initializeApp({ credential: cert(serviceAccount) });
}

async function main() {
  console.log("🔧 Criando conta do Eduardo...\n");

  const app = initFirebaseAdmin();
  const auth = getAuth();
  const db = getFirestore(app);

  try {
    // Criar no Firebase Auth
    const userRecord = await auth.createUser({
      email: "eduardo@lummenimoveis.com.br",
      password: "Lummen@2026",
      displayName: "Eduardo",
      emailVerified: true,
    });

    console.log(`✅ Usuário criado no Auth [UID: ${userRecord.uid}]`);

    // Criar perfil no Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      nome: "Eduardo",
      email: "eduardo@lummenimoveis.com.br",
      role: "admin",
      creci: null,
      classificacao_atual: "Sem Classificacao",
      pontos_trimestre: 0,
      pontos_semestre: 0,
      vgv_acumulado_ano: 0,
      ativo: true,
      criado_em: FieldValue.serverTimestamp(),
      atualizado_em: FieldValue.serverTimestamp(),
    });

    console.log("✅ Perfil criado no Firestore (role: admin)\n");

    console.log("🔑 Credenciais:");
    console.log("   Email: eduardo@lummenimoveis.com.br");
    console.log("   Senha: Lummen@2026");
    console.log("   Role: admin\n");

  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "auth/email-already-exists") {
      console.log("⚠️  Email já existe no Auth. Verificando UID...");
      const existing = await auth.getUserByEmail("eduardo@lummenimoveis.com.br");
      console.log(`   UID existente: ${existing.uid}`);

      // Atualizar perfil no Firestore
      await db.collection("users").doc(existing.uid).set({
        uid: existing.uid,
        nome: "Eduardo",
        email: "eduardo@lummenimoveis.com.br",
        role: "admin",
        creci: null,
        classificacao_atual: "Sem Classificacao",
        pontos_trimestre: 0,
        pontos_semestre: 0,
        vgv_acumulado_ano: 0,
        ativo: true,
        criado_em: FieldValue.serverTimestamp(),
        atualizado_em: FieldValue.serverTimestamp(),
      });

      console.log("✅ Perfil atualizado no Firestore (role: admin)\n");

      console.log("🔑 Credenciais:");
      console.log("   Email: eduardo@lummenimoveis.com.br");
      console.log("   Senha: Lummen@2026");
      console.log("   Role: admin\n");
    } else {
      console.error("❌ Erro:", err.message || err.code);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
