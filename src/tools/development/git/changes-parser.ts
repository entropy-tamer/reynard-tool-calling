/**
 * @file Git Change Parser
 *
 * Main parser for git diff output
 */

import { execSync } from "child_process";
import { FileChange } from "./types";
import { parseStatusLine } from "./changes-status-parser";
import { parseNumstat } from "./changes-numstat-parser";

/**
 * Parse file changes from git diff output
 * @param nameStatusOutput - Output from git diff --name-status
 * @param isStaged - Whether changes are staged
 * @param cwd - Working directory
 * @param detectPackage - Function to detect package from file path
 * @returns Array of file changes
 */
export function parseFileChanges(
  nameStatusOutput: string,
  isStaged: boolean,
  cwd: string,
  detectPackage: (path: string) => string | undefined
): FileChange[] {
  const changes: FileChange[] = [];
  const nameStatusLines = nameStatusOutput.trim().split("\n").filter(Boolean);

  if (nameStatusLines.length === 0) {
    return changes;
  }

  // Parse numstat for line counts
  const numstatCommand = isStaged
    ? "git diff --cached --numstat --find-renames=50"
    : "git diff --numstat --find-renames=50";
  let numstatOutput = "";
  try {
    numstatOutput = execSync(numstatCommand, { cwd, encoding: "utf-8", stdio: "pipe" });
  } catch (error) {
    // If numstat fails, continue without line counts
  }

  const numstatLines = numstatOutput.trim().split("\n").filter(Boolean);
  const lineCounts = parseNumstat(numstatLines);

  for (const line of nameStatusLines) {
    const parsed = parseStatusLine(line);
    if (!parsed) continue;

    const { status, newPath, oldPath } = parsed;

    // For renamed files, use the new path
    const filePath = newPath;

    // Get line counts - try new path first, then old path for renames
    let counts = lineCounts.get(filePath);
    if (!counts && oldPath) {
      counts = lineCounts.get(oldPath);
    }
    if (!counts) {
      counts = { added: 0, deleted: 0 };
    }

    // Extract file extension
    const fileExt = filePath.includes(".") ? filePath.split(".").pop()?.toLowerCase() || "unknown" : "unknown";

    // Detect package
    const packageName = detectPackage(filePath);

    const change: FileChange = {
      path: filePath,
      status,
      linesAdded: counts.added,
      linesDeleted: counts.deleted,
      fileType: fileExt,
    };

    if (packageName) {
      change.package = packageName;
    }

    changes.push(change);
  }

  return changes;
}
