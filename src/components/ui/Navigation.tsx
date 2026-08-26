"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Gift,
  LogOut,
  ChevronDown,
  Gem,
  User,
  ShieldCheck,
  Users,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rewards", label: "Recompensas", icon: Gift },
];

const adminItems = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
  { href: "/admin/brokers", label: "Corretores", icon: Users },
  { href: "/admin/notes", label: "Notas", icon: ClipboardList },
  { href: "/admin/rewards", label: "Premios", icon: Gift },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const initials = profile?.nome
    ? profile.nome
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <nav
        className={`
          flex items-center gap-1 px-2 py-2 rounded-2xl
          transition-all duration-500 ease-out
          ${
            isScrolled
              ? "bg-[#111827]/90 backdrop-blur-xl border border-white/[0.06] shadow-lg shadow-black/20"
              : "bg-[#111827]/60 backdrop-blur-md border border-white/[0.04]"
          }
        `}
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 pl-3 pr-5 border-r border-white/10">
          <Gem className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white tracking-tight hidden sm:block">
            Lummen <span className="text-amber-400">Elite</span>
          </span>
        </Link>

        {/* Nav items */}
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-sm font-medium transition-all duration-300
                ${
                  active
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden sm:block">{item.label}</span>
            </Link>
          );
        })}

        {/* Admin items (só para admins) */}
        {profile?.role === "admin" &&
          adminItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-300
                  ${
                    active
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="hidden sm:block">{item.label}</span>
              </Link>
            );
          })}

        {/* User menu */}
        <div className="ml-auto pl-3 border-l border-white/10 relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/5 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0B0F19] text-[11px] font-bold">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight max-w-[90px] truncate">
                {profile?.nome ?? user?.displayName ?? "Corretor"}
              </p>
              <p className="text-[10px] text-slate-500">
                {profile?.pontos_trimestre ?? 0} pts
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-300 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-scale-in origin-top-right">
              {/* User info */}
              <div className="p-4 border-b border-white/5">
                <p className="text-sm font-semibold text-white truncate">
                  {profile?.nome ?? "Corretor"}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {user?.email}
                </p>
                {profile?.creci && (
                  <p className="text-[10px] text-amber-400/70 mt-1">
                    CRECI: {profile.creci}
                  </p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  <span>Meu perfil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  <span>Sair da conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
