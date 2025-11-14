/**
 * @file Git Change Analysis
 *
 * Analysis of git changes for commit message generation
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";
import { FileChange, ChangeStats, ChangeCategories } from "./types";

/**
 * Git change analysis operations
 */
export class ChangeAnalysis {
  /**
   * Analyze uncommitted git changes (staged and unstaged)
   */
  static async analyzeUncommittedChanges(args: {
    cwd?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
  }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), includeStaged = true, includeUnstaged = true } = args;

      const parseFileChanges = (_diffOutput: string, nameStatusOutput: string, isStaged: boolean): FileChange[] => {
        const changes: FileChange[] = [];
        const nameStatusLines = nameStatusOutput.trim().split("\n").filter(Boolean);

        // Parse numstat for line counts (use appropriate flag for staged/unstaged)
        const numstatCommand = isStaged ? "git diff --cached --numstat" : "git diff --numstat";
        const numstatOutput = execSync(numstatCommand, { cwd, encoding: "utf-8" });
        const numstatLines = numstatOutput.trim().split("\n").filter(Boolean);
        const lineCounts = new Map<string, { added: number; deleted: number }>();

        for (const line of numstatLines) {
          const parts = line.split(/\s+/);
          if (parts.length >= 3) {
            const addedStr = parts[0];
            const deletedStr = parts[1];
            if (addedStr !== undefined && deletedStr !== undefined) {
              const added = parseInt(addedStr, 10) || 0;
              const deleted = parseInt(deletedStr, 10) || 0;
              const filePath = parts.slice(2).join(" ");
              lineCounts.set(filePath, { added, deleted });
            }
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

          const change: FileChange = {
            path: filePath,
            status,
            linesAdded: counts.added,
            linesDeleted: counts.deleted,
            fileType: fileExt,
          };
          if (packageName !== undefined) {
            change.package = packageName;
          }
          changes.push(change);
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

      const addedCount = stagedStats.filesByStatus["added"] ?? 0;
      const modifiedCount = stagedStats.filesByStatus["modified"] ?? 0;
      const deletedCount = stagedStats.filesByStatus["deleted"] ?? 0;

      if (allCategories.tests.length > 0 && allCategories.code.length === 0) {
        suggestedType = "test";
      } else if (allCategories.docs.length > 0 && allCategories.code.length === 0) {
        suggestedType = "docs";
      } else if (allCategories.config.length > 0 && allCategories.code.length === 0) {
        suggestedType = "chore";
      } else if (addedCount > modifiedCount) {
        suggestedType = "feat";
      } else if (deletedCount > 0 && addedCount === 0) {
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
}





