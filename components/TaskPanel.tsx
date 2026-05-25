"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, HelpCircle, AlertCircle, Sparkles, LayoutGrid } from "lucide-react";

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

interface TaskPanelProps {
  chapter: Chapter;
  activeTaskId: number;
  token: string;
  onTaskCompleted: (nextChapter: number, nextTask: number, chapterCompleted: boolean, gameCompleted: boolean) => void;
  onBackToDashboard: () => void;
}

export default function TaskPanel({
  chapter,
  activeTaskId,
  token,
  onTaskCompleted,
  onBackToDashboard,
}: TaskPanelProps) {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | ""; message: string }>({
    type: "",
    message: "",
  });
  const [showHint, setShowHint] = useState(false);

  const activeTask = chapter.tasks.find((t) => t.id === activeTaskId) || chapter.tasks[0];
  const isInputTask = activeTask.validation_type === "input_match";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      const response = await fetch("/api/game/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_input: userInput }),
      });

      if (!response.ok) {
        throw new Error("Verification request failed. Sandbox server offline.");
      }

      const data = await response.json();

      if (data.success) {
        setFeedback({
          type: "success",
          message: data.message || "Objective bypassed successfully!",
        });
        setUserInput("");
        setShowHint(false);

        setTimeout(() => {
          setFeedback({ type: "", message: "" });
          onTaskCompleted(data.current_chapter, data.current_task, data.chapter_completed, data.game_completed);
        }, 1500);
      } else {
        setFeedback({
          type: "error",
          message: data.message || "Verification failed. Inspect your execution and retry.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "Network link failure.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 border border-zinc-800 rounded-lg p-6 overflow-y-auto max-h-[85vh] relative z-10">
      {/* Chapter header */}
      <div className="border-b border-zinc-800/80 pb-4 mb-6">
        <div className="flex justify-between items-start gap-4 mb-2">
          <span className="text-[10px] font-mono tracking-widest text-amber-500 font-bold bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
            Quest Chapter {chapter.id < 10 ? '0' : ''}{chapter.id}
          </span>
          <button
            onClick={onBackToDashboard}
            className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1 bg-zinc-950 border border-zinc-800/60 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-3 h-3" /> Dashboard
          </button>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight text-white mb-2 leading-tight">
          {chapter.title}
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">{chapter.description}</p>
      </div>

      {/* Task Checklist */}
      <div className="mb-8">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 mb-3">Objectives Checklist</h3>
        <div className="space-y-2">
          {chapter.tasks.map((task) => {
            const isCompleted = task.id < activeTaskId;
            const isActive = task.id === activeTaskId;

            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/5 border-amber-500/30 text-white"
                    : isCompleted
                    ? "bg-zinc-950/20 border-zinc-800/40 text-zinc-500"
                    : "bg-transparent border-transparent text-zinc-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-mono ${
                      isActive ? "border-amber-500 text-amber-400 animate-pulse" : "border-zinc-800 text-zinc-700"
                    }`}
                  >
                    {task.id}
                  </div>
                )}
                <span className="truncate">{task.title}</span>
                {isActive && (
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded ml-auto tracking-widest uppercase animate-pulse">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Task Details */}
      <div className="flex-1 bg-zinc-950/40 border border-zinc-850 p-5 rounded-xl mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ChevronRight className="w-4 h-4 text-amber-500" />
          <h4 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
            Objective {activeTask.id}: {activeTask.title}
          </h4>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-6">{activeTask.description}</p>

        {/* Input Forms */}
        <form onSubmit={handleVerify} className="space-y-4">
          {isInputTask && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2" htmlFor="user_input">
                Enter Found Key / Output
              </label>
              <input
                id="user_input"
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 rounded-lg px-4 py-2.5 text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all font-mono text-sm"
                placeholder="Enter access sequence..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isInputTask
                ? "bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 shadow-[0_4px_15px_rgba(245,158,11,0.2)]"
                : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white"
            }`}
          >
            {loading ? (
              <span className="font-mono text-xs animate-pulse">RUNNING VERIFICATION EXPLOIT...</span>
            ) : isInputTask ? (
              <>
                <Sparkles className="w-4 h-4" />
                Submit Verification Key
              </>
            ) : (
              "Verify Sandbox Grid State"
            )}
          </button>
        </form>

        {/* Verification feedback */}
        {feedback.type === "success" && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-mono flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {feedback.type === "error" && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Hint Accordion */}
      <div>
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer select-none"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          {showHint ? "Hide Objective Hint" : "Decryption Hint?"}
        </button>

        {showHint && (
          <div className="mt-2 p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg text-zinc-400 text-xs leading-relaxed font-mono animate-fadeIn">
            {activeTask.hint}
          </div>
        )}
      </div>
    </div>
  );
}
