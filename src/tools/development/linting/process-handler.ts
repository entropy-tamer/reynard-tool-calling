/**
 * @file Linting Process Handler
 *
 * Common utilities for handling linting processes
 */

import { ChildProcess } from "child_process";

export interface LintResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Handle a linting process and return its result
 */
export function handleLintProcess(child: ChildProcess, timeoutMs: number = 30000): Promise<LintResult> {
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





