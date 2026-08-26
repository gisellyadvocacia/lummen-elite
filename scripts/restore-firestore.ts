// ============================================================
// Lummen Elite — Restaurar Firestore
// Importa dados de arquivos JSON de backup
// ============================================================
// Executar: npx tsx scripts/restore-firestore.ts <backup-dir>
// Exemplo: npx tsx scripts/restore-firestore.ts scripts/backups/2026-08-26T19-30-00
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
// Restaurar uma coleção
// ============================================================

async function restoreCollection(
  db: FirebaseFirestore.Firestore,
  collectionName: string,
  data: Record<string, unknown>[]
): Promise<number> {
  let count = 0;

  for (const doc of data) {
    const { id, ...docData } = doc;

    // Restore Timestamps from ISO strings
    const restoredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(docData)) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        // ISO date string - convert back to Firestore Timestamp
        restoredData[key] = new Date(value);
      } else {
        restoredData[key] = value;
      }
    }

    await db.collection(collectionName).doc(id as string).set(restoredData);
    count++;
  }

  return count;
}

// ============================================================
// Restaurar backup
// ============================================================

async function restore() {
  const backupDir = process.argv[2];

  if (!backupDir) {
    console.error("❌ Uso: npx tsx scripts/restore-firestore.ts <backup-dir>");
    console.error("   Exemplo: npx tsx scripts/restore-firestore.ts scripts/backups/2026-08-26T19-30-00");
    process.exit(1);
  }

  const fullBackupDir = path.resolve(backupDir);

  if (!fs.existsSync(fullBackupDir)) {
    console.error(`❌ Diretório não encontrado: ${fullBackupDir}`);
    process.exit(1);
  }

  console.log("🔄 Lummen Elite — Restaurar Firestore\n");
  console.log("═══════════════════════════════════════\n");

  const app = initFirebaseAdmin();
  const db = getFirestore(app);

  // ── Ler manifest ──
  const manifestPath = path.join(fullBackupDir, "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    console.log(`📦 Backup de: ${manifest.timestamp}`);
    console.log(`📊 Total: ${manifest.totalDocuments} documentos\n`);
  }

  // ── Restaurar coleções ──
  const files = fs.readdirSync(fullBackupDir).filter((f) => f.endsWith(".json") && f !== "manifest.json");

  let totalDocs = 0;

  for (const file of files) {
    const collectionName = file.replace(".json", "");
    const filePath = path.join(fullBackupDir, file);

    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      if (Array.isArray(data) && data.length > 0) {
        console.log(`📥 Restaurando ${collectionName}...`);
        const count = await restoreCollection(db, collectionName, data);
        console.log(`   ✅ ${count} documentos restaurados`);
        totalDocs += count;
      } else {
        console.log(`   ⏭️  ${collectionName}: vazia`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.log(`   ❌ ${collectionName}: erro - ${err.message}`);
    }
  }

  console.log(`\n═══════════════════════════════════════\n`);
  console.log(`✨ Restauração concluída!`);
  console.log(`\n📊 Resumo:`);
  console.log(`   • ${totalDocs} documentos restaurados`);
  console.log(`   • ${files.length} coleções processadas\n`);

  process.exit(0);
}

restore().catch((err) => {
  console.error("\n❌ Erro na restauração:", err);
  process.exit(1);
});
