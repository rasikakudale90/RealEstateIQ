"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Sparkles, Shield, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Authentication failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemo = (role: "user" | "admin") => {
    loginDemo(role);
    router.push(role === "admin" ? "/admin" : "/predict");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
              RealEstateIQ
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Your Account</h2>
          <p className="text-sm text-slate-400 mt-1">Access ML price estimation models & prediction history</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            {submitting ? "Signing In..." : "Sign In with Credentials"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="relative my-8 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative px-3 bg-slate-900 text-xs text-slate-500 uppercase tracking-wider">
            Quick Sandbox Access
          </span>
        </div>

        {/* Quick Demo Access Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickDemo("user")}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-slate-300 text-xs font-medium transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Demo User</span>
          </button>
          <button
            onClick={() => handleQuickDemo("admin")}
            type="button"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-850 text-slate-300 text-xs font-medium transition-all"
          >
            <Shield className="h-3.5 w-3.5 text-pink-400" />
            <span>Demo Admin</span>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Need an account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Register for access
          </Link>
        </div>
      </div>
    </div>
  );
}
