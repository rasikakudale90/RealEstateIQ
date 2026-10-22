"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedDisclaimer) {
      setError("Please acknowledge that RealEstateIQ provides price estimations, not certified appraisals.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/predict");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration could not be completed.");
      }
    } finally {
      setSubmitting(false);
    }
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
            Create an Account
          </h1>
          <p className="text-xs text-[#797C90]">
            Start running empirical ML property valuations in seconds.
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
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rasika Babe"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-[#0D0B0B] placeholder-[#9DA0A9] focus:outline-hidden focus:border-[#3C5484] focus:bg-white text-sm transition-all"
            />
          </div>

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
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F1F0EF] border border-[#E4E2DC] text-[#0D0B0B] placeholder-[#9DA0A9] focus:outline-hidden focus:border-[#3C5484] focus:bg-white text-sm transition-all"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#797C90] leading-snug">
              <input
                type="checkbox"
                checked={acceptedDisclaimer}
                onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                className="mt-0.5 rounded border-[#E4E2DC] text-[#3C5484] focus:ring-[#3C5484]"
              />
              <span>
                I acknowledge that RealEstateIQ provides price estimations, not guaranteed sales prices or certified appraisals.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-[#3C5484] hover:bg-[#2C3E63] text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all disabled:opacity-60 cursor-pointer mt-2"
          >
            <span>{submitting ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-[#797C90]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#3C5484] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
