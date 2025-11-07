/**
 * @file Development Git Tools
 *
 * Native TypeScript implementation of git operations for development workflows.
 * Provides git status, commit, push, remote management, and branch operations.
 */

import { execSync } from "child_process";
import { ToolResult } from "../types";

/**
 * Git operations tools for development workflows
 */
export class GitTools {
  /**
   * Get git repository status
   * @param args - Configuration options
   * @returns Tool result with git status information
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
   * @returns Tool result with current branch name
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
   * Check if a git remote exists
   * @param args - Remote name and working directory
   * @returns Tool result indicating if remote exists
   */
  static async checkRemoteExists(args: { remoteName: string; cwd?: string }): Promise<ToolResult> {
    try {
      const { remoteName, cwd = process.cwd() } = args;
      const remotes = execSync("git remote", { cwd, encoding: "utf-8" })
        .trim()
        .split("\n")
        .filter(Boolean);

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
   * @param args - Remote name and working directory
   * @returns Tool result with remote URL
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
   * Add or update a git remote
   * @param args - Remote configuration
   * @returns Tool result with operation status
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
      const existsResult = await this.checkRemoteExists({ remoteName, cwd });
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
   * @returns Tool result with push status
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

  /**
   * Get list of all git remotes
   * @param args - Configuration options
   * @returns Tool result with list of remotes
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
          if (!remotes[name]) {
            remotes[name] = {};
          }
          remotes[name][type as "fetch" | "push"] = url;
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

  /**
   * Verify git repository integrity
   * @param args - Configuration options
   * @returns Tool result with verification status
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

  /**
   * Get latest commit hash
   * @param args - Configuration options
   * @returns Tool result with commit hash
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

