/**
 * @file Git Status Line Parser
 *
 * Parses individual git status lines
 */

export interface ParsedStatus {
  status: "added" | "modified" | "deleted" | "renamed";
  oldPath?: string;
  newPath: string;
  similarity?: number;
}

/**
 * Parse git status code and extract file information
 * Handles all git status codes: A, M, D, R, C, U, etc.
 * @param line - Git status line to parse
 * @returns Parsed status information or null if invalid
 */
export function parseStatusLine(line: string): ParsedStatus | null {
  if (line.length < 3) return null;

  // Handle renamed files: R100 old/path new/path or R  old/path new/path
  const renameMatch = line.match(/^R(\d+)?\s+(.+?)\s+(.+)$/);
  if (renameMatch && renameMatch[2] && renameMatch[3]) {
    const result: ParsedStatus = {
      status: "renamed",
      oldPath: renameMatch[2],
      newPath: renameMatch[3],
    };
    if (renameMatch[1]) {
      result.similarity = parseInt(renameMatch[1], 10);
    }
    return result;
  }

  // Handle copied files: C100 old/path new/path or C  old/path new/path
  const copyMatch = line.match(/^C(\d+)?\s+(.+?)\s+(.+)$/);
  if (copyMatch && copyMatch[2] && copyMatch[3]) {
    // Treat copies as additions (new file)
    const result: ParsedStatus = {
      status: "added",
      oldPath: copyMatch[2],
      newPath: copyMatch[3],
    };
    if (copyMatch[1]) {
      result.similarity = parseInt(copyMatch[1], 10);
    }
    return result;
  }

  // Handle standard two-character status codes
  // Format: XY path where X is staged, Y is unstaged
  const statusCode = line.substring(0, 2);
  const filePath = line.substring(2).trim();

  if (!filePath) return null;

  // Determine status from first character (staged status)
  // A = Added, M = Modified, D = Deleted, R = Renamed, C = Copied, U = Unmerged
  const stagedStatus = statusCode[0];
  let status: "added" | "modified" | "deleted" | "renamed" = "modified";

  if (stagedStatus === "A" || stagedStatus === "?") {
    status = "added";
  } else if (stagedStatus === "D") {
    status = "deleted";
  } else if (stagedStatus === "R") {
    status = "renamed";
  } else if (stagedStatus === "M" || stagedStatus === " ") {
    // Modified or unchanged in staging area
    // Check unstaged status (second character)
    const unstagedStatus = statusCode[1];
    if (unstagedStatus === "M" || unstagedStatus === "D") {
      status = unstagedStatus === "D" ? "deleted" : "modified";
    } else {
      status = "modified";
    }
  }

  return {
    status,
    newPath: filePath,
  };
}

