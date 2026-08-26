import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Lummen Elite — Gamificação para Corretores",
  description:
    "Portal oficial do programa de bonificação e gamificação Lummen Elite para corretores imobiliários.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-slate-100">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[30%] -right-[15%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.03] blur-[120px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-amber-600/[0.02] blur-[100px]" />
        </div>

        <AuthProvider>
          <div className="relative z-10 flex flex-col flex-1">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
