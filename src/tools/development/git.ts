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

  /**
   * Analyze uncommitted git changes (staged and unstaged)
   * @param args - Configuration options
   * @returns Tool result with detailed change analysis
   */
  static async analyzeUncommittedChanges(args: {
    cwd?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
  }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), includeStaged = true, includeUnstaged = true } = args;

      interface FileChange {
        path: string;
        status: "added" | "modified" | "deleted" | "renamed";
        linesAdded: number;
        linesDeleted: number;
        fileType: string;
        package?: string;
      }

      interface ChangeStats {
        totalFiles: number;
        totalLinesAdded: number;
        totalLinesDeleted: number;
        filesByType: Record<string, number>;
        filesByStatus: Record<string, number>;
      }

      interface ChangeCategories {
        code: string[];
        tests: string[];
        docs: string[];
        config: string[];
        other: string[];
      }

      const parseFileChanges = (diffOutput: string, nameStatusOutput: string, isStaged: boolean): FileChange[] => {
        const changes: FileChange[] = [];
        const nameStatusLines = nameStatusOutput.trim().split("\n").filter(Boolean);
        const diffLines = diffOutput.trim().split("\n");

        // Parse numstat for line counts (use appropriate flag for staged/unstaged)
        const numstatCommand = isStaged ? "git diff --cached --numstat" : "git diff --numstat";
        const numstatOutput = execSync(numstatCommand, { cwd, encoding: "utf-8" });
        const numstatLines = numstatOutput.trim().split("\n").filter(Boolean);
        const lineCounts = new Map<string, { added: number; deleted: number }>();

        for (const line of numstatLines) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            const added = parseInt(parts[0], 10) || 0;
            const deleted = parseInt(parts[1], 10) || 0;
            const filePath = parts.slice(2).join(" ");
            lineCounts.set(filePath, { added, deleted });
          }
        }

        for (const line of nameStatusLines) {
          if (line.length < 3) continue;

          const statusCode = line.substring(0, 2);
          const filePath = line.substring(3);

          let status: "added" | "modified" | "deleted" | "renamed" = "modified";
          if (statusCode.includes("A") || statusCode.startsWith("A")) {
            status = "added";
          } else if (statusCode.includes("D") || statusCode.startsWith("D")) {
            status = "deleted";
          } else if (statusCode.includes("R")) {
            status = "renamed";
          }

          const fileExt = filePath.includes(".") ? filePath.split(".").pop()?.toLowerCase() || "unknown" : "unknown";
          const counts = lineCounts.get(filePath) || { added: 0, deleted: 0 };

          // Detect package in monorepo structure
          let packageName: string | undefined;
          const packageMatch = filePath.match(/^packages\/([^/]+)\//);
          if (packageMatch) {
            packageName = packageMatch[1];
          } else if (filePath.startsWith("backend/")) {
            packageName = "backend";
          } else if (filePath.startsWith("services/")) {
            const serviceMatch = filePath.match(/^services\/([^/]+)\//);
            if (serviceMatch) {
              packageName = `services/${serviceMatch[1]}`;
            }
          }

          changes.push({
            path: filePath,
            status,
            linesAdded: counts.added,
            linesDeleted: counts.deleted,
            fileType: fileExt,
            package: packageName,
          });
        }

        return changes;
      };

      const categorizeFiles = (files: FileChange[]): ChangeCategories => {
        const categories: ChangeCategories = {
          code: [],
          tests: [],
          docs: [],
          config: [],
          other: [],
        };

        for (const file of files) {
          const path = file.path.toLowerCase();
          if (path.includes("test") || path.includes("spec") || path.includes("__tests__")) {
            categories.tests.push(file.path);
          } else if (
            path.endsWith(".md") ||
            path.endsWith(".txt") ||
            path.includes("docs/") ||
            path.includes("documentation")
          ) {
            categories.docs.push(file.path);
          } else if (
            path.endsWith(".json") ||
            path.endsWith(".yaml") ||
            path.endsWith(".yml") ||
            path.endsWith(".toml") ||
            path.includes("config") ||
            path.includes(".config.")
          ) {
            categories.config.push(file.path);
          } else if (
            path.endsWith(".ts") ||
            path.endsWith(".tsx") ||
            path.endsWith(".js") ||
            path.endsWith(".jsx") ||
            path.endsWith(".py") ||
            path.endsWith(".rs")
          ) {
            categories.code.push(file.path);
          } else {
            categories.other.push(file.path);
          }
        }

        return categories;
      };

      const calculateStats = (files: FileChange[]): ChangeStats => {
        const stats: ChangeStats = {
          totalFiles: files.length,
          totalLinesAdded: 0,
          totalLinesDeleted: 0,
          filesByType: {},
          filesByStatus: {},
        };

        for (const file of files) {
          stats.totalLinesAdded += file.linesAdded;
          stats.totalLinesDeleted += file.linesDeleted;
          stats.filesByType[file.fileType] = (stats.filesByType[file.fileType] || 0) + 1;
          stats.filesByStatus[file.status] = (stats.filesByStatus[file.status] || 0) + 1;
        }

        return stats;
      };

      const stagedFiles: FileChange[] = [];
      const unstagedFiles: FileChange[] = [];

      if (includeStaged) {
        try {
          const stagedNameStatus = execSync("git diff --cached --name-status", { cwd, encoding: "utf-8" });
          const stagedDiff = execSync("git diff --cached", { cwd, encoding: "utf-8" });
          stagedFiles.push(...parseFileChanges(stagedDiff, stagedNameStatus, true));
        } catch (error) {
          // No staged changes
        }
      }

      if (includeUnstaged) {
        try {
          const unstagedNameStatus = execSync("git diff --name-status", { cwd, encoding: "utf-8" });
          const unstagedDiff = execSync("git diff", { cwd, encoding: "utf-8" });
          unstagedFiles.push(...parseFileChanges(unstagedDiff, unstagedNameStatus, false));
        } catch (error) {
          // No unstaged changes
        }
      }

      const stagedStats = calculateStats(stagedFiles);
      const unstagedStats = calculateStats(unstagedFiles);
      const stagedCategories = categorizeFiles(stagedFiles);
      const unstagedCategories = categorizeFiles(unstagedFiles);

      // Determine suggested commit type
      const allFiles = [...stagedFiles, ...unstagedFiles];
      const allCategories = categorizeFiles(allFiles);
      let suggestedType = "chore";

      if (allCategories.tests.length > 0 && allCategories.code.length === 0) {
        suggestedType = "test";
      } else if (allCategories.docs.length > 0 && allCategories.code.length === 0) {
        suggestedType = "docs";
      } else if (allCategories.config.length > 0 && allCategories.code.length === 0) {
        suggestedType = "chore";
      } else if (stagedStats.filesByStatus["added"] > stagedStats.filesByStatus["modified"]) {
        suggestedType = "feat";
      } else if (stagedStats.filesByStatus["deleted"] > 0 && stagedStats.filesByStatus["added"] === 0) {
        suggestedType = "refactor";
      } else {
        suggestedType = "fix";
      }

      // Extract affected packages
      const affectedPackages = new Set<string>();
      for (const file of allFiles) {
        if (file.package) {
          affectedPackages.add(file.package);
        }
      }

      return {
        success: true,
        data: {
          staged: {
            files: stagedFiles,
            stats: stagedStats,
            categories: stagedCategories,
          },
          unstaged: {
            files: unstagedFiles,
            stats: unstagedStats,
            categories: unstagedCategories,
          },
          summary: {
            totalFiles: stagedStats.totalFiles + unstagedStats.totalFiles,
            totalLinesAdded: stagedStats.totalLinesAdded + unstagedStats.totalLinesAdded,
            totalLinesDeleted: stagedStats.totalLinesDeleted + unstagedStats.totalLinesDeleted,
            affectedPackages: Array.from(affectedPackages),
            suggestedType,
          },
        },
        logs: [
          `Analyzed ${stagedFiles.length} staged and ${unstagedFiles.length} unstaged changes`,
          `Suggested commit type: ${suggestedType}`,
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze uncommitted changes",
      };
    }
  }

  /**
   * Generate conventional commit message suggestions based on uncommitted changes
   * @param args - Configuration options
   * @returns Tool result with commit message suggestions
   */
  static async generateCommitMessage(args: {
    cwd?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
  }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), includeStaged = true, includeUnstaged = false } = args;

      // First analyze the changes
      const analysisResult = await this.analyzeUncommittedChanges({
        cwd,
        includeStaged,
        includeUnstaged,
      });

      if (!analysisResult.success || !analysisResult.data) {
        return {
          success: false,
          error: "Failed to analyze changes for commit message generation",
        };
      }

      const analysis = analysisResult.data as any;
      const summary = analysis.summary;
      const staged = analysis.staged;
      const files = staged.files || [];

      // Determine commit type
      let type = summary.suggestedType || "chore";
      const categories = staged.categories || { code: [], tests: [], docs: [], config: [], other: [] };

      // Refine type based on file patterns
      if (categories.tests.length > 0 && categories.code.length === 0) {
        type = "test";
      } else if (categories.docs.length > 0 && categories.code.length === 0) {
        type = "docs";
      } else if (files.some((f: any) => f.path.includes("package.json") || f.path.includes("pnpm-lock.yaml"))) {
        type = "chore";
      } else if (files.some((f: any) => f.path.includes(".github") || f.path.includes("ci/"))) {
        type = "ci";
      } else if (files.some((f: any) => f.path.includes("vite.config") || f.path.includes("tsconfig"))) {
        type = "build";
      }

      // Determine scope from affected packages
      let scope: string | undefined;
      if (summary.affectedPackages && summary.affectedPackages.length === 1) {
        scope = summary.affectedPackages[0].replace("packages/", "").replace("services/", "");
      } else if (summary.affectedPackages && summary.affectedPackages.length > 1) {
        // Multiple packages - use common prefix or omit scope
        const packages = summary.affectedPackages;
        const commonPrefix = this.findCommonPrefix(packages);
        if (commonPrefix && commonPrefix.length > 3) {
          scope = commonPrefix;
        }
      }

      // Generate description
      let description = "";
      const fileNames = files.map((f: any) => f.path.split("/").pop() || f.path);
      const uniqueFileNames = [...new Set(fileNames)];

      if (categories.code.length > 0) {
        const codeFiles = files.filter((f: any) => categories.code.includes(f.path));
        if (codeFiles.length === 1) {
          const fileName = codeFiles[0].path.split("/").pop()?.replace(/\.(ts|tsx|js|jsx|py)$/, "") || "";
          description = `update ${fileName}`;
        } else if (codeFiles.length < 5) {
          description = `update ${codeFiles.length} files`;
        } else {
          description = `update ${codeFiles.length} code files`;
        }
      } else if (categories.tests.length > 0) {
        description = `add tests for ${categories.tests.length > 1 ? "multiple components" : "component"}`;
      } else if (categories.docs.length > 0) {
        description = `update documentation`;
      } else if (categories.config.length > 0) {
        description = `update configuration`;
      } else {
        description = `update ${files.length} file${files.length > 1 ? "s" : ""}`;
      }

      // Check for breaking changes
      const hasBreakingChanges =
        files.some((f: any) => f.path.includes("package.json")) ||
        files.some((f: any) => f.path.includes("api") || f.path.includes("interface")) ||
        summary.totalLinesDeleted > summary.totalLinesAdded * 0.5;

      // Generate full message
      const scopePart = scope ? `(${scope})` : "";
      const breakingPart = hasBreakingChanges ? "!" : "";
      const fullMessage = `${type}${scopePart}${breakingPart}: ${description}`;

      // Generate alternatives
      const alternatives: string[] = [];
      if (scope) {
        alternatives.push(`${type}: ${description}`);
      }
      if (files.length === 1) {
        const singleFile = files[0];
        const fileName = singleFile.path.split("/").pop()?.replace(/\.(ts|tsx|js|jsx|py)$/, "") || "";
        alternatives.push(`${type}${scopePart}: ${singleFile.status} ${fileName}`);
      }

      // Calculate confidence based on analysis quality
      let confidence = 0.7;
      if (files.length === 1) confidence = 0.9;
      if (files.length > 20) confidence = 0.5;
      if (summary.affectedPackages && summary.affectedPackages.length === 1) confidence += 0.1;

      // Generate body suggestions
      let body: string | undefined;
      if (files.length > 1 && files.length < 10) {
        const fileList = files
          .slice(0, 5)
          .map((f: any) => `- ${f.path}`)
          .join("\n");
        body = `Updated files:\n${fileList}${files.length > 5 ? `\n- ... and ${files.length - 5} more` : ""}`;
      }

      return {
        success: true,
        data: {
          type,
          scope,
          description,
          body,
          footer: hasBreakingChanges ? "BREAKING CHANGE: See updated files for details" : undefined,
          fullMessage,
          confidence: Math.min(1.0, confidence),
          alternatives,
        },
        logs: [`Generated commit message: ${fullMessage}`, `Confidence: ${(confidence * 100).toFixed(0)}%`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate commit message",
      };
    }
  }

  /**
   * Analyze commit message quality and provide suggestions
   * @param args - Message to analyze
   * @returns Tool result with quality analysis
   */
  static async analyzeCommitMessageQuality(args: { message: string }): Promise<ToolResult> {
    try {
      const { message } = args;
      const issues: string[] = [];
      const suggestions: string[] = [];
      let score = 100;

      // Check if message is empty
      if (!message || message.trim().length === 0) {
        return {
          success: true,
          data: {
            score: 0,
            compliant: false,
            issues: ["Message is empty"],
            suggestions: ["Provide a commit message"],
          },
        };
      }

      const trimmed = message.trim();
      const lines = trimmed.split("\n");
      const firstLine = lines[0];

      // Check length
      if (firstLine.length < 10) {
        issues.push("Message is too short (less than 10 characters)");
        suggestions.push("Provide a more descriptive message");
        score -= 30;
      } else if (firstLine.length > 72) {
        issues.push("First line exceeds 72 characters (recommended limit)");
        suggestions.push("Keep the first line under 72 characters");
        score -= 10;
      } else if (firstLine.length > 50 && firstLine.length <= 72) {
        score -= 5; // Minor penalty for being close to limit
      }

      // Check for conventional commit format
      const conventionalPattern = /^(\w+)(\([^)]+\))?(!)?:\s+(.+)$/;
      const match = firstLine.match(conventionalPattern);

      if (!match) {
        issues.push("Message does not follow conventional commit format");
        suggestions.push("Use format: type(scope): description");
        score -= 40;
      } else {
        const [, type, scope, breaking, description] = match;

        // Validate type
        const validTypes = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci", "build"];
        if (!validTypes.includes(type)) {
          issues.push(`Unknown commit type: ${type}`);
          suggestions.push(`Use one of: ${validTypes.join(", ")}`);
          score -= 20;
        }

        // Check description
        if (!description || description.length < 3) {
          issues.push("Description is missing or too short");
          suggestions.push("Provide a clear description of the change");
          score -= 30;
        } else if (description.length > 50) {
          issues.push("Description is too long for first line");
          suggestions.push("Move detailed description to message body");
          score -= 10;
        }

        // Check for imperative mood
        const imperativePattern = /^(add|fix|update|remove|refactor|implement|create|delete|change|improve)/i;
        if (!imperativePattern.test(description)) {
          suggestions.push("Use imperative mood (e.g., 'add feature' not 'added feature')");
          score -= 5;
        }
      }

      // Check for body
      if (lines.length === 1 && firstLine.length < 50) {
        suggestions.push("Consider adding a message body for complex changes");
      }

      // Check for footer (issue references, breaking changes)
      const hasFooter = lines.length > 1 && lines.some((line, idx) => idx > 0 && (line.includes("#") || line.includes("BREAKING")));
      if (!hasFooter && lines.length > 1) {
        suggestions.push("Consider adding footer with issue references (e.g., 'Closes #123')");
      }

      // Check for common issues
      if (firstLine.toLowerCase().startsWith("wip") || firstLine.toLowerCase().startsWith("work in progress")) {
        issues.push("Message indicates work in progress");
        suggestions.push("Complete the work or use a proper commit message");
        score -= 20;
      }

      if (firstLine.includes("??") || firstLine.includes("fix typo") || firstLine.toLowerCase().includes("oops")) {
        issues.push("Message appears unprofessional");
        suggestions.push("Use a clear, professional commit message");
        score -= 15;
      }

      score = Math.max(0, Math.min(100, score));
      const compliant = match !== null && score >= 60;

      return {
        success: true,
        data: {
          score: Math.round(score),
          compliant,
          issues,
          suggestions,
        },
        logs: [`Message quality score: ${Math.round(score)}/100`, compliant ? "Message is compliant" : "Message needs improvement"],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze commit message quality",
      };
    }
  }

  /**
   * Helper method to find common prefix in array of strings
   */
  private static findCommonPrefix(strings: string[]): string | null {
    if (strings.length === 0) return null;
    if (strings.length === 1) return strings[0];

    const first = strings[0];
    let prefix = "";

    for (let i = 0; i < first.length; i++) {
      const char = first[i];
      if (strings.every((str) => str[i] === char)) {
        prefix += char;
      } else {
        break;
      }
    }

    // Return meaningful prefix (at least 3 characters)
    return prefix.length >= 3 ? prefix : null;
  }
}
