/**
 * @file Git Repository Operations
 *
 * Git repository verification and integrity operations
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";

/**
 * Git repository operations
 */
export class RepositoryOperations {
  /**
   * Verify git repository integrity
   * @param args - Configuration options
   * @returns Promise resolving to ToolResult with repository health status
   * @example
   * ```typescript
   * const result = await RepositoryOperations.verifyRepository({});
   * if (result.success && result.data.healthy) {
   *   console.log("Repository is healthy");
   * }
   * ```
   */
  static async verifyRepository(args: { cwd?: string }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd() } = args;
      const output = execSync("git fsck --full", { cwd, encoding: "utf-8" });

      const isHealthy = output.trim().length === 0 || output.includes("dangling");

      return {
        success: true,
        data: {
          healthy: isHealthy,
          output: output.trim(),
        },
        logs: [`Repository ${isHealthy ? "is healthy" : "has issues"}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify repository",
      };
    }
  }
}






