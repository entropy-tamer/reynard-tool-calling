/*
 Minimal MCP JSON-RPC client that launches the existing Python MCP server
 defined in services/mcp-server/cursor-mcp-config.json and communicates
 over stdio. Designed for Node.js environments.
*/

import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { readFileSync } from "fs";
import { resolve } from "path";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

export type McpTool = {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
};

/**
 *
 */
export class McpClient {
  private child?: ChildProcessWithoutNullStreams;
  private nextId = 1;
  private pending = new Map<
    JsonRpcId,
    {
      resolve: (v: JsonRpcResponse) => void;
      reject: (e: Error) => void;
    }
  >();
  private buffer = "";

  /**
   *
   * @param projectRoot
   * @example
   */
  constructor(private readonly projectRoot: string) {}

  /**
   *
   * @example
   */
  start(): void {
    if (this.child) return;
    const cfgPath = resolve(this.projectRoot, "services/mcp-server/cursor-mcp-config.json");
    const cfgRaw = readFileSync(cfgPath, "utf8");
    const cfg = JSON.parse(cfgRaw) as {
      mcpServers: Record<string, { command: string; args?: string[]; env?: Record<string, string> }>;
    };
    const first = Object.values(cfg.mcpServers)[0];
    if (!first) throw new Error("No MCP server configured in cursor-mcp-config.json");

    // Debug logging
    console.log("[MCP] Starting MCP server with config:", {
      command: first.command,
      args: first.args,
      env: first.env,
    });

    const fullEnv = { ...process.env, ...(first.env ?? {}) };

    // Remove problematic node_modules/.bin from PATH to avoid foxy interference
    if (fullEnv.PATH) {
      fullEnv.PATH = fullEnv.PATH.split(":")
        .filter(path => !path.includes("node_modules/.bin"))
        .join(":");
    }

    // Also remove any pnpm-related paths that might contain foxy
    if (fullEnv.PATH) {
      fullEnv.PATH = fullEnv.PATH.split(":")
        .filter(path => !path.includes("pnpm") || path.includes("venv"))
        .join(":");
    }

    console.log("[MCP] Environment configured with PYTHONPATH and BACKEND_ENV_PATH");
    console.log("[MCP] Working directory:", this.projectRoot);
    console.log("[MCP] Command:", first.command);
    console.log("[MCP] Args:", first.args);

    // Use the actual MCP server command from config
    const child = spawn(first.command, first.args || [], {
      env: fullEnv,
      stdio: ["pipe", "pipe", "pipe"],
      cwd: this.projectRoot,
    });

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => this.onStdout(chunk));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", d => {
      const stderrData = String(d).trim();
      // Keep stderr visible during development but avoid throwing
       
      console.error("[MCP stderr]", stderrData);
    });
    child.on("exit", (code, signal) => {
      const err = new Error(`MCP process exited (code=${code}, signal=${signal ?? ""})`);
      for (const { reject } of this.pending.values()) reject(err);
      this.pending.clear();
      this.child = undefined;
    });

    this.child = child;
  }

  /**
   *
   * @example
   */
  stop(): void {
    if (!this.child) return;

    console.log("[MCP] Stopping client...");

    // Close stdin to signal the process to exit
    if (this.child.stdin && !this.child.stdin.destroyed) {
      this.child.stdin.end();
    }

    // Force kill the process
    this.child.kill("SIGTERM");

    // If it doesn't die quickly, force kill it
    setTimeout(() => {
      if (this.child && !this.child.killed) {
        console.log("[MCP] Force killing process...");
        this.child.kill("SIGKILL");
      }
    }, 500);

    this.child = undefined;
    this.pending.clear();
    this.buffer = "";

    console.log("[MCP] Client stopped");
  }

  /**
   *
   * @param chunk
   * @example
   */
  private onStdout(chunk: string): void {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      // Only try to parse lines that look like JSON (start with { and end with })
      if (line.startsWith("{") && line.endsWith("}")) {
        try {
          const msg = JSON.parse(line) as JsonRpcResponse;
          const pending = this.pending.get(msg.id);
          if (!pending) continue;
          this.pending.delete(msg.id);
          pending.resolve(msg);
        } catch (e) {
          // Silently skip malformed JSON lines
          continue;
        }
      }
      // Skip non-JSON lines (likely log messages from Python server)
    }
  }

  /**
   *
   * @param method
   * @param params
   * @example
   */
  private send(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
    if (!this.child) this.start();
    if (!this.child || !this.child.stdin.writable) throw new Error("MCP process not available");
    const id = this.nextId++;
    const req: JsonRpcRequest = { jsonrpc: "2.0", id, method, params };
    const p = new Promise<JsonRpcResponse>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`MCP request timeout: ${method}`));
        }
      }, 60_000);
    });
    this.child.stdin.write(JSON.stringify(req) + "\n");
    return p;
  }

  /**
   *
   * @example
   */
  async initialize(): Promise<void> {
    const res = await this.send("initialize", {});
    if (res.error) throw new Error(res.error.message);
  }

  /**
   *
   * @example
   */
  async toolsList(): Promise<McpTool[]> {
    const res = await this.send("tools/list");
    if (res.error) throw new Error(res.error.message);
    const tools = (res.result as any)?.tools ?? [];
    return tools as McpTool[];
  }

  /**
   *
   * @param name
   * @param args
   * @example
   */
  async toolsCall<T = unknown>(name: string, args: Record<string, unknown>): Promise<T> {
    const res = await this.send("tools/call", { name, arguments: args });
    if (res.error) throw new Error(res.error.message);
    return res.result as T;
  }
}
