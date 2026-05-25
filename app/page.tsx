"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Terminal, Users, Box, SquareTerminal, ClipboardCheck, Play, Wifi } from "lucide-react";

export default function Home() {
  const [typedText, setTypedText] = useState("");
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const codeSnippet = "ssh wand@codewarts_dungeons\nconnecting to dungeons...\naccess granted!\n\nwand@codewarts_dungeons:~$ whoami\nplayer\nwand@codewarts_dungeons:~$ cat .cyber_key\nGRID_PASS_99\nwand@codewarts_dungeons:~$ ./hack.sh --disable-prefect-wards\n[PREFECT SECURITY WARDS DEACTIVATED]\nwand@codewarts_dungeons:~$ _";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(codeSnippet.slice(0, index));
      index++;
      if (index > codeSnippet.length) {
        setTimeout(() => {
          index = 0;
        }, 3000); // Pause before repeating
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        let res = await fetch("/api/users/count").catch(() => null);
        if (!res || !res.ok) {
          res = await fetch("http://localhost:8080/api/users/count");
        }
        if (res.ok) {
          const data = await res.json();
          if (typeof data.count === "number") {
            setUserCount(data.count);
          }
        }
      } catch (err) {
        console.error("Failed to load user count:", err);
      }
    };
    fetchUserCount();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-50 font-sans relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b04_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b04_1px,transparent_1px)] bg-[size:5rem_5rem]" />
      
      {/* Radiant Glow Blobs */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-amber-500" />
          <span className="font-bold tracking-tight text-white text-lg">
            Code<span className="text-amber-500">warts</span>
          </span>
        </div>
        <div>
          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-850 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            {isLoggedIn ? "Go to Dashboard" : "Access Dungeon"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-16 md:py-24 z-10 max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-12 gap-12 items-center w-full">
          {/* Hero Description */}
          <div className="md:col-span-6 space-y-6 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-400 text-xs font-mono tracking-wider uppercase font-semibold">
                <Wifi className="w-3.5 h-3.5 text-amber-500" /> Live Shell Protocol
              </div>
              {userCount !== null && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono tracking-wider uppercase font-semibold shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> {userCount} Users Enrolled
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Master the Linux Command Line via <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-purple-400">Magical Quests</span>
            </h1>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              You are a student at Codewarts. Snape has locked you in the dungeons. Cast command-spells on private Ubuntu containers to navigate chambers, modify scroll permissions, and bypass the Basilisk log vaults.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <Link
                href={isLoggedIn ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-zinc-950 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_30px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_35px_rgba(245,158,11,0.45)] cursor-pointer text-base"
              >
                <Play className="w-4 h-4 fill-current" />
                {isLoggedIn ? "Resume Spellcast" : "Begin Spellcast"}
              </Link>
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="w-full sm:w-auto text-center border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 font-semibold px-8 py-3.5 rounded-xl transition-all text-sm text-zinc-300 cursor-pointer"
              >
                {isLoggedIn ? "Enter Dashboard" : "Enter Dungeons"}
              </Link>
            </div>
          </div>

          {/* Typing terminal mockup */}
          <div className="md:col-span-6 w-full max-w-md mx-auto relative group">
            {/* Border glow */}
            <div className="absolute inset-0 bg-amber-500/5 rounded-2xl blur-xl group-hover:bg-amber-500/10 transition-all duration-300" />
            
            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl shadow-2xl overflow-hidden relative">
              <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-850 flex items-center gap-2 select-none">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-[10px] font-mono text-zinc-500 ml-2">dungeons.codewarts.edu</span>
              </div>
              <div className="p-5 h-64 font-mono text-xs text-amber-500 overflow-y-auto leading-relaxed whitespace-pre-wrap select-none">
                {typedText}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-6 mt-20 w-full">
          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Isolated Magic Sandbox</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Every wizard gets a private sandboxed Ubuntu container. Practice command incantations safely without disrupting the school server.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <SquareTerminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Wand Datalink (TTY)</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Real shell terminal integration maps browser keystrokes straight to your dungeons container and pipes results back instantly.
            </p>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Incantation Checkers</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The verification engine checks the container's directory state, file scrolls, and permissions to verify spell alignment.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 text-zinc-650 py-8 text-center text-xs font-mono tracking-wide z-10 flex-shrink-0 mt-12">
        <div>CODEWARTS // WIZARDING SHELL PROTOCOL</div>
        <div className="text-zinc-700 mt-1">Docker // Next.js // Golang // PostgreSQL</div>
      </footer>
    </div>
  );
}
