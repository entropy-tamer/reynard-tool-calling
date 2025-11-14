/**
 * @file Git Remote Management Operations
 *
 * Add, update, and push to git remotes
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";
import { RemoteInfo } from "./remote-info";

/**
 * Git remote management operations
 */
export class RemoteManagement {
  /**
   * Add or update a git remote
   * @param args - Remote configuration
   * @returns Promise resolving to ToolResult with remote action result
   * @example
   * ```typescript
   * const result = await RemoteManagement.addRemote({
   *   remoteName: "origin",
   *   url: "https://github.com/user/repo.git",
   *   force: true
   * });
   * ```
   */
  static async addRemote(args: {
    remoteName: string;
    url: string;
    cwd?: string;
    force?: boolean;
  }): Promise<ToolResult> {
    try {
      const { remoteName, url, cwd = process.cwd(), force = false } = args;

      // Check if remote exists
      const existsResult = await RemoteInfo.checkRemoteExists({ remoteName, cwd });
      if (existsResult.success && existsResult.data?.exists) {
        if (force) {
          execSync(`git remote set-url ${remoteName} ${url}`, { cwd });
        } else {
          return {
            success: false,
            error: `Remote '${remoteName}' already exists. Use force: true to update.`,
          };
        }
      } else {
        execSync(`git remote add ${remoteName} ${url}`, { cwd });
      }

      return {
        success: true,
        data: {
          remoteName,
          url,
          action: existsResult.data?.exists ? "updated" : "added",
        },
        logs: [`Remote '${remoteName}' ${existsResult.data?.exists ? "updated" : "added"} successfully`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add/update remote",
      };
    }
  }

  /**
   * Push to a git remote
   * @param args - Push configuration
   * @returns Promise resolving to ToolResult with push result
   * @example
   * ```typescript
   * const result = await RemoteManagement.push({
   *   remoteName: "origin",
   *   branch: "main",
   *   tags: true
   * });
   * ```
   */
  static async push(args: {
    remoteName: string;
    branch?: string;
    tags?: boolean;
    mirror?: boolean;
    cwd?: string;
  }): Promise<ToolResult> {
    try {
      const { remoteName, branch, tags = false, mirror = false, cwd = process.cwd() } = args;

      let command: string;
      if (mirror) {
        command = `git push --mirror ${remoteName}`;
      } else if (tags) {
        const currentBranch = branch || execSync("git branch --show-current", { cwd, encoding: "utf-8" }).trim();
        execSync(`git push ${remoteName} ${currentBranch}`, { cwd, stdio: "inherit" });
        command = `git push ${remoteName} --tags`;
      } else {
        const currentBranch = branch || execSync("git branch --show-current", { cwd, encoding: "utf-8" }).trim();
        command = `git push ${remoteName} ${currentBranch}`;
      }

      execSync(command, { cwd, stdio: "inherit" });

      return {
        success: true,
        data: {
          remoteName,
          branch: branch || "current",
          tags,
          mirror,
        },
        logs: [`Successfully pushed to remote '${remoteName}'`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to push to remote",
      };
    }
  }
}





