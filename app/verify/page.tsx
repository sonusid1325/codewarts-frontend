"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, MailCheck, ArrowRight } from "lucide-react";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    const storedExpiry = localStorage.getItem("verify_cooldown_expiry");
    if (storedExpiry) {
      const remaining = Math.ceil((parseInt(storedExpiry) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem("verify_cooldown_expiry");
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) {
      localStorage.removeItem("verify_cooldown_expiry");
      return;
    }
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (trimmedCode.length !== 6) {
      setError("Verification rune must be exactly 6 digits.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedCode }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Invalid verification code");
      }

      const data = await response.json();
      setSuccess(data.message || "Wand successfully verified!");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to align coordinates. Verify your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to resend verification code");
      }

      const data = await response.json();
      setSuccess(data.message || "Verification code resent.");
      
      // Set cooldown and save expiry to localStorage
      const cooldownSecs = 60;
      setCooldown(cooldownSecs);
      localStorage.setItem("verify_cooldown_expiry", (Date.now() + cooldownSecs * 1000).toString());
    } catch (err: any) {
      setError(err.message || "Failed to dispatch new verification rune.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
          <MailCheck className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Code<span className="text-amber-500">warts</span>
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Verify Wand Authenticity</p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-amber-400 animate-pulse" />
          <span>{success}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="email">
            Owl Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none transition-all duration-200"
            placeholder="harry@hogwarts.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="code">
            6-Digit Verification Rune
          </label>
          <input
            id="code"
            name="code"
            type="text"
            required
            maxLength={6}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none text-center font-mono text-xl tracking-[8px] transition-all duration-200"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          />
          <span className="text-[10px] text-zinc-500 font-mono mt-1.5 block text-center">Enter the numeric code sent via your owl post.</span>
        </div>

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Aligning Spell..." : "Verify Wand ID"}
          {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
        </button>
      </form>

      {/* Cooldown/Resend Actions */}
      <div className="mt-8 text-center text-sm text-zinc-500 border-t border-zinc-800/60 pt-6 flex flex-col items-center gap-3">
        <div>
          Did not receive owl post?{" "}
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className={`font-semibold transition-colors ${
              cooldown > 0 || resending
                ? "text-zinc-650 cursor-not-allowed"
                : "text-amber-500 hover:text-amber-400 cursor-pointer"
            }`}
          >
            {cooldown > 0 ? `Resend Rune (${cooldown}s)` : "Dispatch New Rune"}
          </button>
        </div>

        <Link href="/login" className="text-zinc-400 hover:text-white text-xs font-mono uppercase tracking-widest mt-2 hover:underline transition-all">
          Back to Console
        </Link>
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 font-sans p-6 relative overflow-hidden">
      {/* Background cyber grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b04_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b04_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
          <span className="text-sm font-mono text-zinc-400 animate-pulse uppercase tracking-widest">Configuring Portal...</span>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
