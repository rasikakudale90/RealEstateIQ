"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  User,
  Shield,
  LogOut,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loginDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/predict", label: "Estimate Price" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/#insights", label: "Insights" },
    { href: "/history", label: "History" },
  ];

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Portal" });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#3C5484]/95 backdrop-blur-md border-b border-[#2C3E63] transition-all text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white group-hover:text-white/90 transition-colors">
            RealEstateIQ
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/80"></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[0.9375rem] font-medium text-white/80">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 hover:text-white ${
                  isActive
                    ? "text-white font-semibold underline decoration-white decoration-2 underline-offset-8"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Cluster */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            aria-label="Search"
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 text-xs font-medium text-white transition-colors shadow-xs"
              >
                {user.role === "admin" ? (
                  <Shield className="h-3.5 w-3.5 text-amber-300" />
                ) : (
                  <User className="h-3.5 w-3.5 text-white/80" />
                )}
                <span className="max-w-[110px] truncate">{user.display_name}</span>
                {user.role === "admin" && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white text-[#3C5484] font-semibold">
                    ADMIN
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-full border border-white/20 hover:border-red-300 hover:bg-red-500/20 text-white/80 hover:text-white transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-white/10 border border-white/30 text-white text-sm font-medium hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/predict"
                className="px-5 py-2 rounded-full bg-white text-[#3C5484] hover:bg-[#F1F0EF] text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Estimate Value</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#3C5484]" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2C3E63] text-white border-b border-[#22314E] px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-white/90 hover:text-white py-1 border-b border-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-white/10 space-y-2">
            {user ? (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-white">
                  Signed in as {user.display_name}
                </span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-300 hover:text-red-100 font-medium underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full border border-white/30 text-white text-sm font-medium hover:bg-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/predict"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-full bg-white text-[#3C5484] text-sm font-semibold flex items-center justify-center gap-1"
                >
                  <span>Estimate</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Quick Demo Mode for Testing */}
            <div className="pt-3 text-[11px] text-white/60 flex items-center justify-between">
              <span>Quick Test:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    loginDemo("user");
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white"
                >
                  Demo User
                </button>
                <button
                  onClick={() => {
                    loginDemo("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

