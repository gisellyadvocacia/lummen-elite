"use client";

// ============================================================
// Lummen Elite — Botão de Exportação de Relatórios
// Exporta dados para CSV ou gera relatório visual para PDF
// ============================================================

import { useState, useRef, useEffect } from "react";
import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Printer,
} from "lucide-react";
import type { UserProfile, WeeklyNote } from "@/lib/types";

interface ExportButtonProps {
  users: UserProfile[];
  notes: WeeklyNote[];
  type: "ranking" | "notes" | "all";
}

function generateRankingCSV(users: UserProfile[]): string {
  const headers = [
    "Posição",
    "Nome",
    "Email",
    "CRECI",
    "Classificação",
    "Pontos Trimestre",
    "Pontos Semestre",
    "VGV Acumulado Ano",
    "Status",
  ];

  const sorted = [...users].sort(
    (a, b) => b.pontos_semestre - a.pontos_semestre
  );

  const rows = sorted.map((user, i) => [
    i + 1,
    user.nome,
    user.email,
    user.creci || "-",
    user.classificacao_atual,
    user.pontos_trimestre,
    user.pontos_semestre,
    user.vgv_acumulado_ano,
    user.ativo ? "Ativo" : "Inativo",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
}

function generateNotesCSV(notes: WeeklyNote[]): string {
  const headers = [
    "Broker UID",
    "Semana",
    "Vendas Fechadas",
    "VGV Semanal",
    "Pontos Ganhos",
    "Nota Semanal",
    "Status",
  ];

  const rows = notes.map((note) => [
    note.brokerUid,
    note.semana_inicio,
    note.vendas_fechadas,
    note.vgv_semanal,
    note.pontos_ganhos,
    note.nota_semanal,
    note.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function generatePrintReport(
  users: UserProfile[],
  notes: WeeklyNote[],
  type: "ranking" | "notes" | "all"
) {
  const sorted = [...users].sort(
    (a, b) => b.pontos_semestre - a.pontos_semestre
  );

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Lummen Elite - Relatório</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 8px; color: #D97706; }
        h2 { font-size: 18px; margin: 24px 0 12px; color: #374151; border-bottom: 2px solid #F59E0B; padding-bottom: 8px; }
        .subtitle { font-size: 12px; color: #6B7280; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
        th { background: #F9FAFB; padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #E5E7EB; }
        td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; }
        tr:nth-child(even) { background: #F9FAFB; }
        .rank { font-weight: 700; color: #D97706; }
        .tier { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
        .tier-diamante { background: #EDE9FE; color: #7C3AED; }
        .tier-rubi { background: #FCE7F3; color: #DB2777; }
        .tier-safira { background: #DBEAFE; color: #2563EB; }
        .tier-esmeralda { background: #D1FAE5; color: #059669; }
        .tier-none { background: #F3F4F6; color: #6B7280; }
        .footer { margin-top: 32px; font-size: 10px; color: #9CA3AF; text-align: center; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>🏆 Lummen Elite — Relatório</h1>
      <p class="subtitle">Gerado em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
  `;

  if (type === "ranking" || type === "all") {
    html += `
      <h2>Ranking de Corretores</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Nome</th>
            <th>CRECI</th>
            <th>Classificação</th>
            <th>Pontos Semestre</th>
            <th>VGV Ano</th>
          </tr>
        </thead>
        <tbody>
    `;

    sorted.forEach((user, i) => {
      const tierClass =
        user.classificacao_atual === "Diamante"
          ? "tier-diamante"
          : user.classificacao_atual === "Rubi"
            ? "tier-rubi"
            : user.classificacao_atual === "Safira"
              ? "tier-safira"
              : user.classificacao_atual === "Esmeralda"
                ? "tier-esmeralda"
                : "tier-none";

      html += `
          <tr>
            <td class="rank">${i + 1}º</td>
            <td>${user.nome}</td>
            <td>${user.creci || "-"}</td>
            <td><span class="tier ${tierClass}">${user.classificacao_atual}</span></td>
            <td>${user.pontos_semestre.toLocaleString("pt-BR")}</td>
            <td>R$ ${user.vgv_acumulado_ano.toLocaleString("pt-BR")}</td>
          </tr>
      `;
    });

    html += `</tbody></table>`;
  }

  if (type === "notes" || type === "all") {
    html += `
      <h2>Notas Semanais</h2>
      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Vendas</th>
            <th>VGV</th>
            <th>Nota</th>
            <th>Pontos</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
    `;

    notes.slice(0, 50).forEach((note) => {
      const statusColor =
        note.status === "approved"
          ? "#059669"
          : note.status === "pending"
            ? "#D97706"
            : "#DC2626";

      html += `
          <tr>
            <td>${note.semana_inicio}</td>
            <td>${note.vendas_fechadas}</td>
            <td>R$ ${note.vgv_semanal.toLocaleString("pt-BR")}</td>
            <td>${note.nota_semanal}</td>
            <td>+${note.pontos_ganhos}</td>
            <td style="color: ${statusColor}; font-weight: 600">${note.status === "approved" ? "Aprovado" : note.status === "pending" ? "Pendente" : "Rejeitado"}</td>
          </tr>
      `;
    });

    html += `</tbody></table>`;
  }

  html += `
      <div class="footer">
        Lummen Elite — Plataforma de Gamificação para Corretores | lummenimoveis.com.br
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

export function ExportButton({ users, notes, type }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (type === "ranking" || type === "all") {
      const csv = generateRankingCSV(users);
      downloadCSV(csv, `lummen-ranking-${timestamp}.csv`);
    }

    if (type === "notes" || type === "all") {
      const csv = generateNotesCSV(notes);
      downloadCSV(csv, `lummen-notas-${timestamp}.csv`);
    }

    setIsOpen(false);
  };

  const handleExportPDF = () => {
    generatePrintReport(users, notes, type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
      >
        <Download className="w-4 h-4" strokeWidth={1.5} />
        <span className="hidden sm:block">Exportar</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in origin-top-right z-50">
          <div className="p-2">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              <div className="text-left">
                <p className="font-medium">Exportar CSV</p>
                <p className="text-[10px] text-slate-600">Planilha para Excel</p>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-400" strokeWidth={1.5} />
              <div className="text-left">
                <p className="font-medium">Gerar Relatório</p>
                <p className="text-[10px] text-slate-600">PDF formatado para impressão</p>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Printer className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
              <div className="text-left">
                <p className="font-medium">Imprimir</p>
                <p className="text-[10px] text-slate-600">Abrir diálogo de impressão</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
