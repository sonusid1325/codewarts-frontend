"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Wand2 } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 403 && errText.toLowerCase().includes("verify")) {
          setError("Email not verified. Redirecting to verification page...");
          setTimeout(() => {
            router.push(`/verify?email=${encodeURIComponent(formData.username_or_email)}`);
          }, 1500);
          return;
        }
        throw new Error(errText || "Invalid wand coordinates or password");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Datalink refused. Snape is blocking access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50 font-sans p-6 relative overflow-hidden">
      {/* Background cyber grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b04_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b04_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-pulse">
            <Wand2 className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Code<span className="text-amber-500">warts</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Chamber of Shells Console</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="username_or_email">
              Wand Username / Email
            </label>
            <input
              id="username_or_email"
              name="username_or_email"
              type="text"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none transition-all duration-200"
              placeholder="harry_potter"
              value={formData.username_or_email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5" htmlFor="password">
              Incantation Passkey
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none transition-all duration-200"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Aligning Wand..." : "Enter Dungeons"}
            {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-zinc-500 border-t border-zinc-800/60 pt-6">
          New Wizard?{" "}
          <Link href="/signup" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
            Register Wand ID
          </Link>
        </div>
      </div>
    </div>
  );
}
