"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, Shield, User } from "lucide-react";
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
      router.push("/predict");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F1F0EF] px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-[#E4E2DC] shadow-xl relative space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-bold tracking-tight text-[#0D0B0B]">
              RealEstateIQ
            </span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-[#0D0B0B]">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-[#797C90]">
            Access ML property valuations & your saved prediction history.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-[#0D0B0B] placeholder-[#9DA0A9] focus:outline-hidden focus:border-[#3C5484] focus:bg-white text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#0D0B0B] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-[#0D0B0B] placeholder-[#9DA0A9] focus:outline-hidden focus:border-[#3C5484] focus:bg-white text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-60 cursor-pointer mt-2"
          >
            <span>{submitting ? "Signing in..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Demo Sandbox Switcher */}
        <div className="pt-4 border-t border-[#E4E2DC] space-y-3">
          <p className="text-center text-xs text-[#797C90]">
            Or explore immediately using instant demo sandbox:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemo("user")}
              className="py-2.5 px-3 rounded-full bg-[#F1F0EF] hover:bg-[#E8E6E1] text-[#0D0B0B] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <User className="h-3.5 w-3.5 text-[#3C5484]" />
              <span>Demo User</span>
            </button>
            <button
              onClick={() => handleQuickDemo("admin")}
              className="py-2.5 px-3 rounded-full bg-[#F1F0EF] hover:bg-[#E8E6E1] text-[#0D0B0B] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-[#3C5484]" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-[#797C90]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#3C5484] font-semibold hover:underline">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
