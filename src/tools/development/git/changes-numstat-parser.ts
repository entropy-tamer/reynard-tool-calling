/**
 * @file Git Numstat Parser
 *
 * Parses git diff --numstat output for line counts
 */

/**
 * Parse numstat output for line counts
 * Handles renamed files which have format: added deleted old/path new/path
 * @param numstatLines - Lines from git diff --numstat
 * @returns Map of file paths to line counts
 */
export function parseNumstat(
  numstatLines: string[]
): Map<string, { added: number; deleted: number; oldPath?: string }> {
  const lineCounts = new Map<string, { added: number; deleted: number; oldPath?: string }>();

  for (const line of numstatLines) {
    const parts = line.split(/\s+/);
    if (parts.length < 3) continue;

    const addedStr = parts[0];
    const deletedStr = parts[1];

    // Handle renamed files: added deleted old/path new/path
    if (parts.length >= 4) {
      const oldPath = parts.slice(2, -1).join(" ");
      const newPath = parts[parts.length - 1];
      if (newPath && addedStr && deletedStr) {
        const added = parseInt(addedStr, 10) || 0;
        const deleted = parseInt(deletedStr, 10) || 0;

        // Store counts for both old and new paths
        lineCounts.set(newPath, { added, deleted, oldPath });
        if (oldPath) {
          // Also store for old path with 0 counts (it was deleted)
          lineCounts.set(oldPath, { added: 0, deleted, oldPath });
        }
      }
    } else {
      // Standard format: added deleted path
      const filePath = parts.slice(2).join(" ");
      if (filePath && addedStr && deletedStr) {
        const added = parseInt(addedStr, 10) || 0;
        const deleted = parseInt(deletedStr, 10) || 0;
        lineCounts.set(filePath, { added, deleted });
      }
    }
  }

  return lineCounts;
}

