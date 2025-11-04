/**
 * @file Development Linting Tools
 *
 * Native TypeScript implementation of linting tools.
 */

import { ToolResult } from "../types";

/**
 * Frontend linting tools
 */
export class LintingTools {
  static async lintFrontend(args: { fix?: boolean; files?: string[]; config?: string }): Promise<ToolResult> {
    try {
      const { fix = false, files = [], config } = args;
      const { spawn } = await import("child_process");
      // const path = await import('path');

      // const eslintPath = path.join(process.cwd(), 'node_modules/.bin/eslint');
      const args_array = [
        ...(fix ? ["--fix"] : []),
        ...(config ? ["--config", config] : []),
        ...(files.length > 0 ? files : ["."]),
      ];

      return new Promise(resolve => {
        const child = spawn("npx", ["eslint", ...args_array], {
          cwd: process.cwd(),
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          child.kill("SIGTERM");
          resolve({
            success: false,
            error: "ESLint timed out after 30 seconds",
          });
        }, 30000);

        child.stdout.on("data", data => {
          stdout += data.toString();
        });

        child.stderr.on("data", data => {
          stderr += data.toString();
        });

        child.on("close", code => {
          clearTimeout(timeout);
          const success = code === 0;
          resolve({
            success,
            data: {
              exitCode: code,
              stdout,
              stderr,
              fixed: fix,
            },
            logs: [`ESLint ${fix ? "fixed" : "checked"} code with exit code ${code}`],
          });
        });

        child.on("error", error => {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: `Failed to run ESLint: ${error.message}`,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run ESLint",
      };
    }
  }

  static async lintPython(args: { files?: string[]; usePylint?: boolean }): Promise<ToolResult> {
    try {
      const { files = [], usePylint = false } = args;
      const { spawn } = await import("child_process");

      const command = usePylint ? "pylint" : "flake8";
      const args_array = files.length > 0 ? files : ["."];

      return new Promise(resolve => {
        const child = spawn(command, args_array, {
          cwd: process.cwd(),
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", data => {
          stdout += data.toString();
        });

        child.stderr.on("data", data => {
          stderr += data.toString();
        });

        child.on("close", code => {
          const success = code === 0;
          resolve({
            success,
            data: {
              exitCode: code,
              stdout,
              stderr,
              linter: command,
            },
            logs: [`${command} completed with exit code ${code}`],
          });
        });

        child.on("error", error => {
          resolve({
            success: false,
            error: `Failed to run ${command}: ${error.message}`,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run Python linter",
      };
    }
  }

  static async lintMarkdown(args: { files?: string[]; config?: string }): Promise<ToolResult> {
    try {
      const { files = [], config } = args;
      const { spawn } = await import("child_process");

      const args_array = [...(config ? ["--config", config] : []), ...(files.length > 0 ? files : ["**/*.md"])];

      return new Promise(resolve => {
        const child = spawn("npx", ["markdownlint", ...args_array], {
          cwd: process.cwd(),
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", data => {
          stdout += data.toString();
        });

        child.stderr.on("data", data => {
          stderr += data.toString();
        });

        child.on("close", code => {
          const success = code === 0;
          resolve({
            success,
            data: {
              exitCode: code,
              stdout,
              stderr,
            },
            logs: [`Markdownlint completed with exit code ${code}`],
          });
        });

        child.on("error", error => {
          resolve({
            success: false,
            error: `Failed to run markdownlint: ${error.message}`,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run markdownlint",
      };
    }
  }
}
