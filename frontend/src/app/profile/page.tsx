"use client";

import { useState } from "react";
import { User, Shield, CheckCircle2, Save, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, loginDemo } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "Rasika Babe");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = { ...user, display_name: displayName };
    localStorage.setItem("realestateiq_session", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F1F0EF] text-[#0D0B0B] flex flex-col selection:bg-[#3C5484] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div>
          <span className="text-xs font-semibold tracking-widest text-[#5F7091] uppercase">
            Account Management
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0D0B0B] tracking-tight">
            Your Profile
          </h1>
          <p className="text-sm text-[#797C90] mt-1">
            Manage your display identity and view your role authorization details.
          </p>
        </div>

        <div className="editorial-card p-6 sm:p-8 bg-white shadow-sm space-y-8">
          {/* Identity Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-[#E4E2DC]">
            <div className="h-16 w-16 rounded-full bg-[#F1F0EF] border border-[#E4E2DC] flex items-center justify-center text-[#3C5484]">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[#0D0B0B]">
                  {user?.display_name || "Rasika Babe"}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    user?.role === "admin"
                      ? "bg-[#3C5484] text-white"
                      : "bg-[#F1F0EF] text-[#484651]"
                  }`}
                >
                  {user?.role?.toUpperCase() || "USER"}
                </span>
              </div>
              <p className="text-xs text-[#797C90] mt-0.5 font-mono">
                {user?.email || "user@realestateiq.ai"}
              </p>
            </div>
          </div>

          {/* Profile Edit Form */}
          <form onSubmit={handleSave} className="space-y-6 max-w-md">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-sm text-[#0D0B0B] focus:outline-hidden focus:border-[#3C5484] focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="btn-primary text-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </button>

              {saved && (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Profile updated</span>
                </span>
              )}
            </div>
          </form>

          {/* Role Switching demo */}
          <div className="pt-6 border-t border-[#E4E2DC] space-y-3">
            <h3 className="text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
              Role Testing Switcher
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loginDemo("user")}
                className="px-4 py-2 rounded-full bg-[#F1F0EF] hover:bg-[#E8E6E1] text-[#0D0B0B] text-xs font-medium transition-colors"
              >
                Switch to Standard User
              </button>
              <button
                onClick={() => loginDemo("admin")}
                className="px-4 py-2 rounded-full bg-[#F1F0EF] hover:bg-[#E8E6E1] text-[#0D0B0B] text-xs font-medium transition-colors"
              >
                Switch to Administrator
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
