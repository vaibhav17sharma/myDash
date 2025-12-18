import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useEffect, useRef, useState } from "react";

function Terminal() {
  const [terminals, setTerminals] = useState([
    { id: "1", name: "Terminal 1", connected: false },
  ]);
  const [activeTerminal, setActiveTerminal] = useState("1");
  const terminalRefs = useRef({});
  const wsRefs = useRef({});
  const xtermRefs = useRef({});
  const fitAddonRefs = useRef({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(wsRefs.current).forEach((ws) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
      Object.values(xtermRefs.current).forEach((xterm) => {
        if (xterm) {
          xterm.dispose();
        }
      });
    };
  }, []);

  // Initialize terminal when it becomes active
  useEffect(() => {
    const activeTermData = terminals.find((t) => t.id === activeTerminal);

    if (activeTermData && !activeTermData.connected) {
      // Wait for DOM to be ready
      const initTimer = setTimeout(() => {
        if (
          terminalRefs.current[activeTerminal] &&
          !xtermRefs.current[activeTerminal]
        ) {
          initializeTerminal(activeTerminal);
          // Mark as connected
          setTerminals((prev) =>
            prev.map((t) =>
              t.id === activeTerminal ? { ...t, connected: true } : t
            )
          );
        }
      }, 100);

      return () => clearTimeout(initTimer);
    }
  }, [activeTerminal, terminals]);

  // Handle window resize and terminal switching
  useEffect(() => {
    const handleResize = () => {
      const fitAddon = fitAddonRefs.current[activeTerminal];
      if (fitAddon) {
        try {
          fitAddon.fit();
        } catch (e) {
          // Ignore resize errors
        }
      }
    };

    // Fit terminal when switching
    const timer = setTimeout(handleResize, 50);

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeTerminal]);

  const initializeTerminal = (terminalId) => {
    const container = terminalRefs.current[terminalId];
    if (!container) return;

    // Create xterm instance
    const xterm = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily:
        "'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace",
      theme: {
        background: "#1a1a1a",
        foreground: "#f9fafb",
        cursor: "#13bef0",
        cursorAccent: "#1a1a1a",
        black: "#242424",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#13bef0",
        magenta: "#06b6d4",
        cyan: "#22d3ee",
        white: "#f9fafb",
        brightBlack: "#4a4a4a",
        brightRed: "#f87171",
        brightGreen: "#34d399",
        brightYellow: "#fbbf24",
        brightBlue: "#22d3ee",
        brightMagenta: "#0ea5e9",
        brightCyan: "#67e8f9",
        brightWhite: "#ffffff",
      },
      allowProposedApi: true,
    });

    // Create fit addon
    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    // Open terminal in container
    xterm.open(container);

    // Fit terminal to container
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Ignore initial fit errors
      }
    }, 100);

    xtermRefs.current[terminalId] = xterm;
    fitAddonRefs.current[terminalId] = fitAddon;

    // Connect WebSocket
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/terminal`);

    ws.onopen = () => {
      console.log(`Terminal ${terminalId} connected`);

      // Get terminal dimensions
      const cols = xterm.cols;
      const rows = xterm.rows;

      ws.send(
        JSON.stringify({
          type: "create",
          id: terminalId,
          cols: cols,
          rows: rows,
          cwd: "/mnt/hdd",
        })
      );

      // Handle terminal input
      xterm.onData((data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "input",
              data: data,
            })
          );
        }
      });

      // Handle terminal resize
      xterm.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "resize",
              cols: cols,
              rows: rows,
            })
          );
        }
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "created":
            console.log(`Terminal ${message.id} created`);
            break;
          case "output":
            xterm.write(message.data);
            break;
          case "exit":
            xterm.write(
              `\r\n\x1b[1;31m[Process exited with code ${message.exitCode}]\x1b[0m\r\n`
            );
            break;
        }
      } catch (error) {
        console.error("Terminal message error:", error);
      }
    };

    ws.onerror = (error) => {
      console.error(`Terminal ${terminalId} error:`, error);
      xterm.write("\r\n\x1b[1;31m[Connection error]\x1b[0m\r\n");
    };

    ws.onclose = () => {
      console.log(`Terminal ${terminalId} disconnected`);
      xterm.write("\r\n\x1b[1;33m[Connection closed]\x1b[0m\r\n");
    };

    wsRefs.current[terminalId] = ws;
  };

  const addTerminal = () => {
    const newId = (terminals.length + 1).toString();
    const newTerminal = {
      id: newId,
      name: `Terminal ${newId}`,
      connected: false,
    };
    setTerminals([...terminals, newTerminal]);
    setActiveTerminal(newId);
  };

  const closeTerminal = (terminalId) => {
    if (terminals.length === 1) return;

    const ws = wsRefs.current[terminalId];
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "close" }));
      ws.close();
    }

    const xterm = xtermRefs.current[terminalId];
    if (xterm) {
      xterm.dispose();
    }

    delete terminalRefs.current[terminalId];
    delete wsRefs.current[terminalId];
    delete xtermRefs.current[terminalId];
    delete fitAddonRefs.current[terminalId];

    const newTerminals = terminals.filter((t) => t.id !== terminalId);
    setTerminals(newTerminals);

    if (activeTerminal === terminalId) {
      setActiveTerminal(newTerminals[0]?.id || "1");
    }
  };

  const clearTerminal = (terminalId) => {
    const xterm = xtermRefs.current[terminalId];
    if (xterm) {
      xterm.clear();
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-primary font-mono">
      <div className="h-10 bg-bg-secondary border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {terminals.map((term) => (
            <div
              key={term.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border transition-all cursor-pointer whitespace-nowrap text-sm ${
                activeTerminal === term.id
                  ? "bg-bg-primary border-gray-700 border-b-transparent text-white"
                  : "bg-bg-tertiary border-transparent text-gray-400 hover:bg-bg-hover hover:text-white"
              }`}
              onClick={() => setActiveTerminal(term.id)}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                style={{ background: term.connected ? "#10b981" : "#6b7280" }}
                title={term.connected ? "Connected" : "Not connected"}
              />
              <span className="font-medium">{term.name}</span>
              {terminals.length > 1 && (
                <button
                  className="w-4 h-4 bg-transparent text-gray-500 rounded-sm flex items-center justify-center text-xs transition-all hover:bg-red-500 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTerminal(term.id);
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            className="w-7 h-7 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-lg font-light flex-shrink-0 transition-all hover:bg-primary hover:text-white hover:scale-105"
            onClick={addTerminal}
            title="New Terminal"
          >
            +
          </button>
        </div>
        <div className="flex gap-2">
          <button
            className="w-7 h-7 bg-bg-tertiary text-gray-400 rounded-lg flex items-center justify-center text-sm transition-all hover:bg-bg-hover hover:text-white hover:scale-105"
            onClick={() => clearTerminal(activeTerminal)}
            title="Clear Terminal"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        {terminals.map((term) => (
          <div
            key={term.id}
            className={`absolute inset-0 bg-bg-primary p-4 ${
              activeTerminal === term.id ? "block" : "hidden"
            }`}
          >
            {!term.connected && activeTerminal === term.id && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-400 pointer-events-none z-10">
                <div className="text-5xl mb-6 animate-pulse">⚡</div>
                <p className="text-base mb-2">
                  Terminal will connect when you click here...
                </p>
                <p className="text-sm text-gray-500">
                  Click anywhere to start the terminal session
                </p>
              </div>
            )}
            <div
              ref={(el) => (terminalRefs.current[term.id] = el)}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Terminal;
