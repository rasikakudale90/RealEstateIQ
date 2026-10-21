"use client";

import { useState } from "react";
import { User, Shield, CheckCircle2, Save, KeyRound } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, loginDemo } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-indigo-400 text-xs font-medium mb-2">
            <User className="h-3.5 w-3.5" />
            <span>Account Management</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account credentials and system authorization settings.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-8">
          {/* Identity Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="h-16 w-16 rounded-2xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user?.display_name || "Active User"}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                    user?.role === "admin"
                      ? "bg-pink-950/80 text-pink-300 border-pink-700/50"
                      : "bg-indigo-950/80 text-indigo-300 border-indigo-700/50"
                  }`}
                >
                  {user?.role?.toUpperCase() || "USER"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{user?.email || "user@example.com"}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            {saved && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Profile display name updated successfully.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                User ID (Immutable)
              </label>
              <input
                type="text"
                disabled
                value={user?.id || "N/A"}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-400 font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your preferred name"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Role & Privileges
              </label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Authorization Tier:</span>
                <span className="font-semibold text-white capitalize">{user?.role || "Standard User"}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Roles are managed through server-side Supabase policies and cannot be self-elevated.
              </p>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
