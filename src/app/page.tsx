"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin" />
      </div>
    </div>
  );
}
