/**
 * @file Git Status Operations
 *
 * Git status, branch, and commit information operations
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";

/**
 * Git status operations
 */
export class StatusOperations {
  /**
   * Get git repository status
   * @param args - Configuration options
   * @param args.cwd - Working directory path
   * @param args.short - Use short format output
   * @returns Promise resolving to ToolResult with git status
   * @example
   * ```typescript
   * const result = await StatusOperations.gitStatus({ short: true });
   * if (result.success) {
   *   console.log(result.data.status);
   * }
   * ```
   */
  static async gitStatus(args: { cwd?: string; short?: boolean }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), short = false } = args;
      const command = short ? "git status --short" : "git status";
      const output = execSync(command, { cwd, encoding: "utf-8" });

      return {
        success: true,
        data: {
          status: output.trim(),
          isClean: output.trim().includes("nothing to commit"),
        },
        logs: ["Git status retrieved successfully"],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get git status",
      };
    }
  }

  /**
   * Get current git branch
   * @param args - Configuration options
   * @param args.cwd - Working directory path
   * @returns Promise resolving to ToolResult with current branch name
   * @example
   * ```typescript
   * const result = await StatusOperations.getCurrentBranch({});
   * if (result.success) {
   *   console.log(result.data.branch);
   * }
   * ```
   */
  static async getCurrentBranch(args: { cwd?: string }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd() } = args;
      const branch = execSync("git branch --show-current", { cwd, encoding: "utf-8" }).trim();

      return {
        success: true,
        data: {
          branch,
        },
        logs: [`Current branch: ${branch}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get current branch",
      };
    }
  }

  /**
   * Get latest commit hash
   * @param args - Configuration options
   * @param args.cwd - Working directory path
   * @param args.short - Use short hash format
   * @returns Promise resolving to ToolResult with commit hash
   * @example
   * ```typescript
   * const result = await StatusOperations.getLatestCommit({ short: true });
   * if (result.success) {
   *   console.log(result.data.hash);
   * }
   * ```
   */
  static async getLatestCommit(args: { cwd?: string; short?: boolean }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), short = false } = args;
      const format = short ? "--short" : "";
      const hash = execSync(`git rev-parse ${format} HEAD`, { cwd, encoding: "utf-8" }).trim();

      return {
        success: true,
        data: {
          hash,
          short: short,
        },
        logs: [`Latest commit: ${hash}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get latest commit",
      };
    }
  }
}
