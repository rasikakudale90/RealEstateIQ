"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LogOut, Shield, User, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: "/predict", label: "Predict Price" },
    { href: "/history", label: "History" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Portal" });
  }

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            RealEstateIQ
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors px-3 py-1.5 rounded-lg ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300"
              >
                {user.role === "admin" ? (
                  <Shield className="h-3.5 w-3.5 text-pink-400" />
                ) : (
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                )}
                <span className="max-w-[120px] truncate">{user.display_name}</span>
                {user.role === "admin" && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-950/80 text-pink-300 border border-pink-800/40 font-mono">
                    ADMIN
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/40 hover:border-rose-800/50 hover:text-rose-400 text-slate-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
