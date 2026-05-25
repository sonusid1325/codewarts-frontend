"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, Cpu, Trophy, ArrowRight, LayoutGrid, Terminal as TerminalIcon } from "lucide-react";
import Terminal from "@/components/Terminal";
import TaskPanel from "@/components/TaskPanel";
import dynamic from "next/dynamic";

const TerminalDynamic = dynamic(() => import("@/components/Terminal"), {
  ssr: false,
});

interface Task {
  id: number;
  title: string;
  description: string;
  hint: string;
  validation_type: string;
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

function GameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryChapter = searchParams.get("chapter");

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(1);
  const [activeTaskId, setActiveTaskId] = useState<number>(1);

  // Victory states
  const [chapterCompletedModal, setChapterCompletedModal] = useState(false);
  const [gameCompletedModal, setGameCompletedModal] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (!storedToken || !storedUsername) {
      router.push("/login");
      return;
    }

    setToken(storedToken);

    const loadGameData = async () => {
      try {
        const chapRes = await fetch("/api/game/chapters");
        if (!chapRes.ok) throw new Error("Failed to load game configuration");
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
          throw new Error("Failed to load operator progress");
        }
        const progData = await progRes.json();
        setProgress(progData);

        let targetChapterId = progData.current_chapter;
        if (queryChapter) {
          const parsed = parseInt(queryChapter, 10);
          if (!isNaN(parsed) && parsed > 0 && parsed <= chapData.length) {
            if (parsed <= progData.current_chapter || progData.completed_chapters.includes(parsed)) {
              targetChapterId = parsed;
            }
          }
        }

        setSelectedChapterId(targetChapterId);

        if (targetChapterId === progData.current_chapter) {
          setActiveTaskId(progData.current_task);
        } else {
          setActiveTaskId(1);
        }
      } catch (err: any) {
        setError(err.message || "Failed to establish secure datalink.");
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [router, queryChapter]);

  const handleTaskCompleted = (
    nextChapter: number,
    nextTask: number,
    chapterCompleted: boolean,
    gameCompleted: boolean
  ) => {
    if (gameCompleted) {
      setGameCompletedModal(true);
      return;
    }

    if (chapterCompleted) {
      setChapterCompletedModal(true);
      return;
    }

    setActiveTaskId(nextTask);
  };

  const handleNextChapter = () => {
    setChapterCompletedModal(false);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-10 h-10 text-amber-500 animate-spin" />
          <span className="text-sm tracking-widest animate-pulse">ESTABLISHING SECURE OWL LINK...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2 uppercase">Datalink Connection Down</h3>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{error}</p>
          <Link
            href="/dashboard"
            className="w-full bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold py-2 rounded-lg transition-colors cursor-pointer text-zinc-300"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const activeChapter = chapters.find((c) => c.id === selectedChapterId);

  if (!activeChapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono">
        <span className="text-sm tracking-wider">ERROR: INVALID CHAPTER SPECIFIED.</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans relative overflow-hidden h-screen">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b04_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Header navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="font-bold tracking-tight text-sm">
            Code<span className="text-amber-500">warts</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-400">SESSION LINK STABLE</span>
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        </div>
      </header>

      {/* Game Pane split */}
      <main className="flex-1 grid lg:grid-cols-12 gap-6 p-6 overflow-hidden h-full">
        {/* Left pane: tasks and story */}
        <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
          <TaskPanel
            chapter={activeChapter}
            activeTaskId={activeTaskId}
            token={token}
            onTaskCompleted={handleTaskCompleted}
            onBackToDashboard={() => router.push("/dashboard")}
          />
        </div>

        {/* Right pane: terminal container */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <TerminalDynamic token={token} />
        </div>
      </main>

      {/* Chapter Completed Modal */}
      {chapterCompletedModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
            
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">CHAPTER COMPLETED!</h3>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Incredible hacking, student. You have successfully disabled the security grid for Stage {selectedChapterId < 10 ? '0' : ''}{selectedChapterId}. The next school database awaits.
            </p>
            <button
              onClick={handleNextChapter}
              className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 font-bold py-3 rounded-xl transition-all duration-200 shadow-[0_4px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 cursor-pointer"
            >
              Continue to Mainframe
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Game Completed / Final Victory Modal */}
      {gameCompletedModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-zinc-900 border border-amber-500/30 p-10 rounded-3xl text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden animate-fadeIn">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto animate-bounce" />
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight uppercase">Codewarts Champion</h3>
                <span className="text-xs font-mono font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded">
                  REACTOR CORE LOCKED 100%
                </span>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                You did it! You escaped the dungeon, entered the library restricted section, bypassed security sensors, mastered scripting rituals, managed environment variables, controlled system services, and bridged network portals. You are officially a Linux Command Line master!
              </p>

              <div className="pt-4 flex gap-4">
                <Link
                  href="/dashboard"
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 font-bold py-3 rounded-xl transition-all cursor-pointer text-zinc-300 text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setGameCompletedModal(false);
                    router.push("/game?chapter=1");
                  }}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 font-bold py-3 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Replay Exploit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Game() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Cpu className="w-10 h-10 text-amber-500 animate-spin" />
          <span className="text-sm tracking-widest animate-pulse">ESTABLISHING SECURE OWL LINK...</span>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  );
}
