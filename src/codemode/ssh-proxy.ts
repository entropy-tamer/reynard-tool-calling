/**
 * @file SSH Proxy Utilities
 *
 * Utilities for setting up SSH SOCKS5 proxy tunnels for codemode execution.
 */

import { spawn, ChildProcess } from "child_process";

export type SSHProxyConfig = {
  host: string;
  port?: number;
  user?: string;
  localPort?: number;
};

let activeProxyProcess: ChildProcess | null = null;
let activeProxyPort: number | null = null;

/**
 * Sets up an SSH SOCKS5 proxy tunnel
 * @param config SSH proxy configuration
 * @returns Promise resolving to the local proxy URL (socks5://127.0.0.1:PORT)
 */
export async function setupSSHProxy(config: SSHProxyConfig): Promise<string> {
  // Clean up any existing proxy
  await cleanupSSHProxy();

  const localPort = config.localPort || 1080;
  const sshPort = config.port || 22;
  const user = config.user ? `${config.user}@` : "";
  const host = config.host;

  return new Promise((resolve, reject) => {
    // Set up SSH dynamic port forwarding (SOCKS5)
    const sshArgs = [
      "-N", // No remote command execution
      "-D", // Dynamic port forwarding (SOCKS5)
      `${localPort}`, // Local port
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      "-o",
      "ServerAliveInterval=60",
      "-o",
      "ServerAliveCountMax=3",
      `${user}${host}`,
      "-p",
      `${sshPort}`,
    ];

    const sshProcess = spawn("ssh", sshArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let errorOutput = "";

    sshProcess.stderr.on("data", data => {
      const output = data.toString();
      errorOutput += output;
      // Check for connection success indicators
      if (output.includes("Entering interactive session") || output.includes("Connection established")) {
        // Connection successful
      }
    });

    sshProcess.on("error", error => {
      reject(new Error(`Failed to start SSH proxy: ${error.message}`));
    });

    // Give SSH a moment to establish connection
    setTimeout(() => {
      // Check if process is still running (connection likely established)
      if (sshProcess.killed || sshProcess.exitCode !== null) {
        reject(new Error(`SSH proxy failed to start: ${errorOutput || "Unknown error"}`));
      } else {
        activeProxyProcess = sshProcess;
        activeProxyPort = localPort;
        const proxyUrl = `socks5://127.0.0.1:${localPort}`;
        console.log(`✅ SSH SOCKS5 proxy established: ${proxyUrl}`);
        resolve(proxyUrl);
      }
    }, 2000);
  });
}

/**
 * Cleans up the active SSH proxy tunnel
 */
export async function cleanupSSHProxy(): Promise<void> {
  if (activeProxyProcess) {
    activeProxyProcess.kill("SIGTERM");
    activeProxyProcess = null;
    activeProxyPort = null;
  }
}

/**
 * Gets the active proxy URL if one is running
 */
export function getActiveProxyUrl(): string | null {
  if (activeProxyPort) {
    return `socks5://127.0.0.1:${activeProxyPort}`;
  }
  return null;
}






