/**
 * @file Process Handler Utilities
 *
 * Common utilities for handling child processes
 */

import { ChildProcess } from "child_process";

export interface ProcessResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Handle a spawned process and return its result
 */
export function handleProcess(child: ChildProcess, timeoutMs: number = 300000): Promise<ProcessResult> {
  return new Promise(resolve => {
    let stdout = "";
    let stderr = "";

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      resolve({
        exitCode: null,
        stdout,
        stderr: stderr || "Process timed out",
      });
    }, timeoutMs);

    child.stdout?.on("data", data => {
      stdout += data.toString();
    });

    child.stderr?.on("data", data => {
      stderr += data.toString();
    });

    child.on("close", code => {
      clearTimeout(timeout);
      resolve({
        exitCode: code,
        stdout,
        stderr,
      });
    });

    child.on("error", error => {
      clearTimeout(timeout);
      resolve({
        exitCode: null,
        stdout,
        stderr: error.message,
      });
    });
  });
}

/**
 * Extract SRT file path from yt-dlp output
 */
export function extractSrtFile(stdout: string): string | null {
  // Try to find the generated SRT file
  const match = stdout.match(/\[download\] Writing video subtitles to: (.+\.srt)/);
  if (match && match[1]) {
    return match[1];
  }

  // Try to extract filename from output
  const lines = stdout.split("\n");
  for (const line of lines) {
    if (line.includes(".srt") || line.includes("Writing")) {
      const fileMatch = line.match(/([^\s]+\.srt)/);
      if (fileMatch && fileMatch[1]) {
        return fileMatch[1];
      }
    }
  }

  return null;
}






