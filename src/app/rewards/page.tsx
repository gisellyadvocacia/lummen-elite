"use client";

import { Gift } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navigation } from "@/components/ui/Navigation";

export default function RewardsPage() {
  return (
    <ProtectedRoute>
      <RewardsContent />
    </ProtectedRoute>
  );
}

function RewardsContent() {
  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navigation />

      <main className="pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest mb-2">
            Recompensas
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Vitrine de{" "}
            <span className="text-amber-400">Recompensas</span>
          </h1>
        </div>

        <div className="card-premium p-12 text-center animate-fade-up delay-150">
          <Gift className="w-12 h-12 text-slate-600 mx-auto mb-4" strokeWidth={1} />
          <p className="text-slate-400 font-medium mb-2">
            Em breve
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            O catálogo de recompensas está sendo preparado. Em breve você poderá
            resgatar prêmios exclusivos com seus pontos.
          </p>
        </div>
      </main>
    </div>
  );
}
