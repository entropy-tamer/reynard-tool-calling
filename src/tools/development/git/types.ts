/**
 * @file Git Types
 *
 * Type definitions for git operations
 */

export interface FileChange {
  path: string;
  status: "added" | "modified" | "deleted" | "renamed";
  linesAdded: number;
  linesDeleted: number;
  fileType: string;
  package?: string;
}

export interface ChangeStats {
  totalFiles: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  filesByType: Record<string, number>;
  filesByStatus: Record<string, number>;
}

export interface ChangeCategories {
  code: string[];
  tests: string[];
  docs: string[];
  config: string[];
  other: string[];
}
