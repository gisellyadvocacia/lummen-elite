// ============================================================
// Lummen Elite — Backup do Firestore
// Exporta todas as coleções para arquivos JSON
// ============================================================
// Executar: npx tsx scripts/backup-firestore.ts
// Requer: scripts/serviceAccountKey.json

import { initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Configuração
// ============================================================

function initFirebaseAdmin(): App {
  const keyPath = path.join(__dirname, "serviceAccountKey.json");

  if (fs.existsSync(keyPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    return initializeApp({ credential: cert(serviceAccount) });
  }

  console.error("❌ serviceAccountKey.json não encontrado em scripts/");
  process.exit(1);
}

// ============================================================
// Backup de uma coleção
// ============================================================

async function backupCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string
): Promise<{ count: number; data: Record<string, unknown>[] }> {
  const snapshot = await db.collection(collectionName).get();
  const data: Record<string, unknown>[] = [];

  snapshot.forEach((doc) => {
    const docData = doc.data();
    // Convert Timestamps to ISO strings for JSON serialization
    const serialized: Record<string, unknown> = { id: doc.id };
    for (const [key, value] of Object.entries(docData)) {
      if (value && typeof value === "object" && "toDate" in value) {
        // Firestore Timestamp
        serialized[key] = (value as FirebaseFirestore.Timestamp).toDate().toISOString();
      } else if (value && typeof value === "object" && "_methodName" in value) {
        // ServerTimestamp sentinel - serialize as null
        serialized[key] = null;
      } else {
        serialized[key] = value;
      }
    }
    data.push(serialized);
  });

  return { count: data.length, data };
}

// ============================================================
// Backup completo
// ============================================================

async function backup() {
  console.log("🔄 Lummen Elite — Backup do Firestore\n");
  console.log("═══════════════════════════════════════\n");

  const app = initFirebaseAdmin();
  const db = getFirestore(app);

  // Criar diretório de backup com timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const backupDir = path.join(__dirname, "backups", timestamp);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log(`📁 Diretório: scripts/backups/${timestamp}\n`);

  // ── Coleções para backup ──
  const collections = [
    "users",
    "weekly_notes",
    "rewards",
    "redemptions",
  ];

  let totalDocs = 0;

  for (const collectionName of collections) {
    try {
      const { count, data } = await backupCollection(db, collectionName);

      if (count > 0) {
        const filePath = path.join(backupDir, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`   ✅ ${collectionName}: ${count} documentos`);
        totalDocs += count;
      } else {
        console.log(`   ⏭️  ${collectionName}: vazia`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.log(`   ❌ ${collectionName}: erro - ${err.message}`);
    }
  }

  // ── Criar manifest ──
  const manifest = {
    timestamp: new Date().toISOString(),
    project: "lummen-imoveis",
    collections,
    totalDocuments: totalDocs,
    backupDir: `scripts/backups/${timestamp}`,
  };

  fs.writeFileSync(
    path.join(backupDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\n═══════════════════════════════════════\n`);
  console.log(`✨ Backup concluído!`);
  console.log(`\n📊 Resumo:`);
  console.log(`   • ${totalDocs} documentos exportados`);
  console.log(`   • ${collections.length} coleções verificadas`);
  console.log(`   • Diretório: scripts/backups/${timestamp}/\n`);

  // ── Listar arquivos ──
  const files = fs.readdirSync(backupDir);
  console.log(`📄 Arquivos:`);
  files.forEach((file) => {
    const stats = fs.statSync(path.join(backupDir, file));
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   • ${file} (${sizeKB} KB)`);
  });

  process.exit(0);
}

backup().catch((err) => {
  console.error("\n❌ Erro no backup:", err);
  process.exit(1);
});
