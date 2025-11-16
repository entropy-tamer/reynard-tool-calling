/**
 * @file Git Change Analysis
 *
 * Analysis of git changes for commit message generation
 */

import { execSync } from "child_process";
import { ToolResult } from "../../types";
import { FileChange } from "./types";
import { validateGitRepository, detectPackage, categorizeFiles, calculateStats, determineSuggestedType } from "./changes-utils";
import { parseFileChanges } from "./changes-parser";

/**
 * Get staged changes from git
 * @param cwd - Working directory
 * @returns Array of staged file changes
 */
function getStagedChanges(cwd: string): FileChange[] {
  try {
    const stagedNameStatus = execSync("git diff --cached --name-status --find-renames=50", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    });
    return parseFileChanges(stagedNameStatus, true, cwd, detectPackage);
  } catch (error) {
    const err = error as { status?: number; stderr?: string };
    if (err.status !== 0 && !err.stderr?.includes("no staged changes")) {
      throw new Error(`Failed to get staged changes: ${err instanceof Error ? err.message : String(err)}`);
    }
    return [];
  }
}

/**
 * Get unstaged changes from git
 * @param cwd - Working directory
 * @returns Array of unstaged file changes
 */
function getUnstagedChanges(cwd: string): FileChange[] {
  try {
    const unstagedNameStatus = execSync("git diff --name-status --find-renames=50", {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    });
    return parseFileChanges(unstagedNameStatus, false, cwd, detectPackage);
  } catch (error) {
    const err = error as { status?: number; stderr?: string };
    if (err.status !== 0 && !err.stderr?.includes("no changes")) {
      throw new Error(`Failed to get unstaged changes: ${err instanceof Error ? err.message : String(err)}`);
    }
    return [];
  }
}

/**
 * Build analysis result from file changes
 * @param stagedFiles - Staged file changes
 * @param unstagedFiles - Unstaged file changes
 * @returns ToolResult with complete analysis
 */
function buildAnalysisResult(stagedFiles: FileChange[], unstagedFiles: FileChange[]): ToolResult {
  const stagedStats = calculateStats(stagedFiles);
  const unstagedStats = calculateStats(unstagedFiles);
  const stagedCategories = categorizeFiles(stagedFiles);
  const unstagedCategories = categorizeFiles(unstagedFiles);

  const allFiles = [...stagedFiles, ...unstagedFiles];
  const allCategories = categorizeFiles(allFiles);
  const allStats = calculateStats(allFiles);
  const suggestedType = determineSuggestedType(allFiles, allCategories, allStats);

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
}

/**
 * Git change analysis operations
 */
export class ChangeAnalysis {
  /**
   * Analyze uncommitted git changes (staged and unstaged)
   * @param args - Configuration options
   * @param args.cwd - Working directory (defaults to process.cwd())
   * @param args.includeStaged - Include staged changes (defaults to true)
   * @param args.includeUnstaged - Include unstaged changes (defaults to true)
   * @returns Promise resolving to ToolResult with change analysis
   * @example
   * ```typescript
   * const result = await ChangeAnalysis.analyzeUncommittedChanges({
   *   cwd: process.cwd(),
   *   includeStaged: true,
   *   includeUnstaged: true
   * });
   * ```
   */
  static async analyzeUncommittedChanges(args: {
    cwd?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
  }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), includeStaged = true, includeUnstaged = true } = args;

      if (!validateGitRepository(cwd)) {
        return {
          success: false,
          error: `Directory is not a git repository: ${cwd}`,
        };
      }

      const stagedFiles = includeStaged ? getStagedChanges(cwd) : [];
      const unstagedFiles = includeUnstaged ? getUnstagedChanges(cwd) : [];

      return buildAnalysisResult(stagedFiles, unstagedFiles);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze uncommitted changes",
      };
    }
  }
}
