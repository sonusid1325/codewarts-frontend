"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
  token: string;
}

export default function Terminal({ token }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize XTerm
    const term = new XTerm({
      cursorBlink: true,
      theme: {
        background: "#09090b", // zinc-950
        foreground: "#fbbf24", // amber-400 (parchment gold)
        cursor: "#fbbf24",
        selectionBackground: "rgba(245, 158, 11, 0.3)",
        black: "#000000",
        red: "#ef4444",
        green: "#fbbf24",
        yellow: "#f59e0b",
        blue: "#3b82f6",
        magenta: "#d946ef",
        cyan: "#06b6d4",
        white: "#f4f4f5",
      },
      fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      rows: 24,
    });
    xtermRef.current = term;

    // Load Fit Addon
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    // Helper to safely fit terminal dimensions
    const tryFit = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Suppress dimensions parsing errors during mount stages
      }
    };

    // Open terminal inside Ref
    term.open(terminalRef.current);
    setTimeout(tryFit, 50);

    // Setup WebSockets
    // We determine protocol and host based on current environment variables or location
    let wsUrl = "";
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    if (apiURL) {
      const wsProtocol = apiURL.startsWith("https") ? "wss:" : "ws:";
      const wsHost = apiURL.replace(/^https?:\/\//, "");
      wsUrl = `${wsProtocol}//${wsHost}/api/terminal/ws?token=${token}`;
    } else {
      const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      wsUrl = `${wsProtocol}//${window.location.host}/api/terminal/ws?token=${token}`;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";

    // Handle WebSocket connect
    ws.onopen = () => {
      term.write("\r\n\x1b[1;36m[System: Wand link to Codewarts Dungeons established.]\x1b[0m\r\n\r\n");
    };

    // Handle incoming WebSocket messages
    ws.onmessage = (event) => {
      const data = event.data;
      if (typeof data === "string") {
        term.write(data);
      } else if (data instanceof ArrayBuffer) {
        term.write(new Uint8Array(data));
      }
    };

    // Handle WebSocket close
    ws.onclose = (event) => {
      term.write("\r\n\x1b[1;31m[System: Sandbox connection terminated. Please reload or resume.]\x1b[0m\r\n");
    };

    // Handle WebSocket error
    ws.onerror = () => {
      term.write("\r\n\x1b[1;31m[System Error: Failed to maintain socket connection.]\x1b[0m\r\n");
    };

    // Handle user input key events
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle window resize events
    const handleResize = () => {
      tryFit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [token]);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl relative">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-xs font-mono text-zinc-400 ml-2 tracking-wider">player@codewarts-dungeons:~</span>
        </div>
        <div className="text-[10px] font-mono text-amber-500/70 border border-amber-500/20 px-2 py-0.5 rounded bg-amber-500/5 uppercase tracking-widest animate-pulse">
          Shell Active
        </div>
      </div>
      {/* Terminal Element */}
      <div className="flex-1 p-2 overflow-hidden" ref={terminalRef} />
    </div>
  );
}
