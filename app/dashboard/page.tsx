"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck, Lock, Play, BookOpen, Wand2, Zap } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  tasks: Task[];
}

interface Progress {
  current_chapter: number;
  current_task: number;
  completed_chapters: number[];
}

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!storedToken || !storedUsername) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
    setUsername(storedUsername);

    const fetchData = async () => {
      try {
        const chapRes = await fetch("/api/game/chapters");
        if (!chapRes.ok) throw new Error("Failed to load school curriculum");
        const chapData = await chapRes.json();
        setChapters(chapData);

        const progRes = await fetch("/api/game/progress", {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        if (!progRes.ok) {
          if (progRes.status === 401) {
            localStorage.clear();
            router.push("/login");
            return;
          }
          throw new Error("Failed to sync wizard progress");
        }
        const progData = await progRes.json();
        setProgress(progData);
      } catch (err: any) {
        setError(err.message || "Failed to establish secure school link.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Wand2 className="w-10 h-10 text-amber-500 animate-spin" />
          <span className="text-sm tracking-widest animate-pulse">ESTABLISHING SECURE OWL LINK...</span>
        </div>
      </div>
    );
  }

  const activeChapterId = progress ? progress.current_chapter : 1;
  const completedChapters = progress ? progress.completed_chapters : [];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans relative overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b04_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="font-bold tracking-tight text-white">
            Code<span className="text-amber-500">warts</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>GRID LINK: </span>
            <span className="text-amber-400 uppercase tracking-widest animate-pulse">CONNECTED (512MB)</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-300">Wizard: <span className="font-mono text-amber-400">{username}</span></span>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-lg text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
              title="Terminate link"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 z-10">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md p-8 rounded-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400 font-mono">{username}</span>
            </h2>
            <p className="text-zinc-400 text-sm max-w-xl">
              You are a student at Codewarts. Cast command-incantations inside isolated containers to escape dungeons, search library archives, make scrolls executable, and bypass the Basilisk log chamber.
            </p>
          </div>
          <div>
            <Link
              href="/game"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-[0_4px_25px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              Resume Quest
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {/* Chapters Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold tracking-tight text-white uppercase">Curriculum Chapters</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {chapters.map((chapter) => {
              const isCompleted = completedChapters.includes(chapter.id);
              const isActive = chapter.id === activeChapterId;
              const isLocked = chapter.id > activeChapterId && !isCompleted;

              return (
                <div
                  key={chapter.id}
                  className={`bg-zinc-900/30 border rounded-2xl p-6 transition-all duration-300 relative group flex flex-col justify-between ${
                    isActive
                      ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.05)] bg-amber-500/2"
                      : isCompleted
                      ? "border-zinc-800"
                      : "border-zinc-900 opacity-60"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge / Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold tracking-widest text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded">
                        STAGE {chapter.id < 10 ? "0" : ""}{chapter.id}
                      </span>
                      {isCompleted ? (
                        <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : isActive ? (
                        <span className="text-xs font-mono text-purple-400 flex items-center gap-1 animate-pulse">
                          <Play className="w-3 h-3 fill-current" /> ACTIVE SPELL
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-zinc-650 flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" /> LOCKED
                        </span>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                        {chapter.title}
                      </h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">{chapter.description}</p>
                    </div>

                    {/* Objective count */}
                    <div className="text-xs text-zinc-500 font-mono">
                      Wards to Break: {chapter.tasks.length} incantations
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900/60 flex justify-end">
                    {isLocked ? (
                      <button
                        disabled
                        className="text-xs font-semibold font-mono text-zinc-600 flex items-center gap-1.5 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" /> Previous Wards Locked
                      </button>
                    ) : (
                      <Link
                        href={`/game?chapter=${chapter.id}`}
                        className={`text-xs font-bold font-mono px-4 py-2 rounded-lg border transition-all duration-200 ${
                          isActive
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-zinc-950"
                            : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        {isCompleted ? "Re-cast Spell" : "Begin Incantation"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
