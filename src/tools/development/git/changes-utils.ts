/**
 * @file Git Change Utilities
 *
 * Utility functions for git change analysis
 */

import { existsSync } from "fs";
import { join } from "path";
import { FileChange, ChangeStats, ChangeCategories } from "./types";

/**
 * Validate that the directory is a git repository
 * @param cwd - Directory to check
 * @returns True if directory is a git repository
 */
export function validateGitRepository(cwd: string): boolean {
  const gitDir = join(cwd, ".git");
  return existsSync(gitDir) || existsSync(join(cwd, ".git"));
}

/**
 * Detect package name from file path in monorepo structure
 * @param filePath - File path to analyze
 * @returns Package name or undefined
 */
export function detectPackage(filePath: string): string | undefined {
  // packages/package-name/...
  const packageMatch = filePath.match(/^packages\/([^/]+)\//);
  if (packageMatch) {
    return packageMatch[1];
  }

  // backend/...
  if (filePath.startsWith("backend/")) {
    return "backend";
  }

  // services/service-name/...
  const serviceMatch = filePath.match(/^services\/([^/]+)\//);
  if (serviceMatch) {
    return `services/${serviceMatch[1]}`;
  }

  // examples/example-name/...
  const exampleMatch = filePath.match(/^examples\/([^/]+)\//);
  if (exampleMatch) {
    return `examples/${exampleMatch[1]}`;
  }

  return undefined;
}

/**
 * Categorize files by type
 * @param files - Files to categorize
 * @returns Categorized files
 */
export function categorizeFiles(files: FileChange[]): ChangeCategories {
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
}

/**
 * Calculate statistics from file changes
 * @param files - Files to calculate stats for
 * @returns Change statistics
 */
export function calculateStats(files: FileChange[]): ChangeStats {
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
}

/**
 * Determine suggested commit type based on changes
 * @param _allFiles - All file changes (unused but kept for future use)
 * @param allCategories - Categorized file changes
 * @param stats - Change statistics
 * @returns Suggested commit type
 */
export function determineSuggestedType(
  _allFiles: FileChange[],
  allCategories: ChangeCategories,
  stats: ChangeStats
): string {
  const addedCount = stats.filesByStatus["added"] ?? 0;
  const modifiedCount = stats.filesByStatus["modified"] ?? 0;
  const deletedCount = stats.filesByStatus["deleted"] ?? 0;
  const renamedCount = stats.filesByStatus["renamed"] ?? 0;

  // Pure test changes
  if (allCategories.tests.length > 0 && allCategories.code.length === 0) {
    return "test";
  }

  // Pure documentation changes
  if (allCategories.docs.length > 0 && allCategories.code.length === 0 && allCategories.config.length === 0) {
    return "docs";
  }

  // Pure config changes
  if (allCategories.config.length > 0 && allCategories.code.length === 0) {
    return "chore";
  }

  // Mostly additions = feature
  if (addedCount > modifiedCount && addedCount > deletedCount) {
    return "feat";
  }

  // Mostly deletions or renames = refactor
  if ((deletedCount > 0 || renamedCount > 0) && addedCount === 0) {
    return "refactor";
  }

  // Default to fix for modifications
  return "fix";
}

