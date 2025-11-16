/**
 * @file Development Linting Tools
 *
 * Native TypeScript implementation of linting tools.
 */

import { ToolResult } from "../../types";
import { spawn } from "child_process";
import { handleLintProcess } from "./process-handler";

/**
 * Frontend linting tools
 */
export class LintingTools {
  static async lintFrontend(args: { fix?: boolean; files?: string[]; config?: string }): Promise<ToolResult> {
    try {
      const { fix = false, files = [], config } = args;
      const args_array = [
        ...(fix ? ["--fix"] : []),
        ...(config ? ["--config", config] : []),
        ...(files.length > 0 ? files : ["."]),
      ];

      const child = spawn("npx", ["eslint", ...args_array], {
        cwd: process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
      });

      const result = await handleLintProcess(child, 30000);
      const success = result.exitCode === 0;

      return {
        success,
        data: {
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          fixed: fix,
        },
        logs: [`ESLint ${fix ? "fixed" : "checked"} code with exit code ${result.exitCode}`],
        ...(success ? {} : { error: result.stderr || `ESLint exited with code ${result.exitCode}` }),
      };
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
      const command = usePylint ? "pylint" : "flake8";
      const args_array = files.length > 0 ? files : ["."];

      const child = spawn(command, args_array, {
        cwd: process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
      });

      const result = await handleLintProcess(child, 60000);
      const success = result.exitCode === 0;

      return {
        success,
        data: {
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          linter: command,
        },
        logs: [`${command} completed with exit code ${result.exitCode}`],
        ...(success ? {} : { error: result.stderr || `${command} exited with code ${result.exitCode}` }),
      };
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
      const args_array = [...(config ? ["--config", config] : []), ...(files.length > 0 ? files : ["**/*.md"])];

      const child = spawn("npx", ["markdownlint", ...args_array], {
        cwd: process.cwd(),
        stdio: ["pipe", "pipe", "pipe"],
      });

      const result = await handleLintProcess(child, 30000);
      const success = result.exitCode === 0;

      return {
        success,
        data: {
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
        },
        logs: [`Markdownlint completed with exit code ${result.exitCode}`],
        ...(success ? {} : { error: result.stderr || `Markdownlint exited with code ${result.exitCode}` }),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run markdownlint",
      };
    }
  }
}






