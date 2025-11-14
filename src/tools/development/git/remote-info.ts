/**
 * @file Git Remote Information Operations
 *
 * Query and list git remote information
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";

/**
 * Git remote information operations
 */
export class RemoteInfo {
  /**
   * Check if a git remote exists
   * @param args - Remote name and configuration
   * @returns Promise resolving to ToolResult with remote existence status
   * @example
   * ```typescript
   * const result = await RemoteInfo.checkRemoteExists({ remoteName: "origin" });
   * if (result.success && result.data.exists) {
   *   console.log("Remote exists");
   * }
   * ```
   */
  static async checkRemoteExists(args: { remoteName: string; cwd?: string }): Promise<ToolResult> {
    try {
      const { remoteName, cwd = process.cwd() } = args;
      const remotes = execSync("git remote", { cwd, encoding: "utf-8" }).trim().split("\n").filter(Boolean);

      const exists = remotes.includes(remoteName);

      return {
        success: true,
        data: {
          exists,
          remoteName,
          allRemotes: remotes,
        },
        logs: [`Remote '${remoteName}' ${exists ? "exists" : "does not exist"}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to check remote",
      };
    }
  }

  /**
   * Get remote URL for a specific remote
   * @param args - Remote name and configuration
   * @returns Promise resolving to ToolResult with remote URL
   * @example
   * ```typescript
   * const result = await RemoteInfo.getRemoteUrl({ remoteName: "origin" });
   * if (result.success) {
   *   console.log(result.data.url);
   * }
   * ```
   */
  static async getRemoteUrl(args: { remoteName: string; cwd?: string }): Promise<ToolResult> {
    try {
      const { remoteName, cwd = process.cwd() } = args;
      const url = execSync(`git remote get-url ${remoteName}`, { cwd, encoding: "utf-8" }).trim();

      return {
        success: true,
        data: {
          remoteName,
          url,
        },
        logs: [`Remote URL for '${remoteName}': ${url}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get remote URL",
      };
    }
  }

  /**
   * Get list of all git remotes
   * @param args - Configuration options
   * @returns Promise resolving to ToolResult with list of remotes
   * @example
   * ```typescript
   * const result = await RemoteInfo.listRemotes({});
   * if (result.success) {
   *   result.data.remotes.forEach(remote => {
   *     console.log(`${remote.name}: ${remote.fetch}`);
   *   });
   * }
   * ```
   */
  static async listRemotes(args: { cwd?: string }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd() } = args;
      const remotesOutput = execSync("git remote -v", { cwd, encoding: "utf-8" });
      const lines = remotesOutput.trim().split("\n").filter(Boolean);

      const remotes: Record<string, { fetch?: string; push?: string }> = {};
      for (const line of lines) {
        const match = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
        if (match) {
          const [, name, url, type] = match;
          if (name && url && type) {
            if (!remotes[name]) {
              remotes[name] = {};
            }
            remotes[name][type as "fetch" | "push"] = url;
          }
        }
      }

      return {
        success: true,
        data: {
          remotes: Object.entries(remotes).map(([name, urls]) => ({
            name,
            fetch: urls.fetch,
            push: urls.push,
          })),
        },
        logs: [`Found ${Object.keys(remotes).length} remote(s)`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list remotes",
      };
    }
  }
}





