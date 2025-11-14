/**
 * @file Git Utility Functions
 *
 * Helper functions for git operations
 */

/**
 * Find common prefix in array of strings
 *
 * @param strings - Array of strings to find common prefix from
 * @returns The common prefix string (minimum 3 characters) or null if no common prefix exists
 * @example
 * findCommonPrefix(['abc/def', 'abc/ghi', 'abc/jkl']) // Returns 'abc/'
 * findCommonPrefix(['foo', 'bar']) // Returns null
 */
export function findCommonPrefix(strings: string[]): string | null {
  if (strings.length === 0) return null;
  if (strings.length === 1) return strings[0] ?? null;

  const first = strings[0];
  if (!first) return null;

  let prefix = "";

  for (let i = 0; i < first.length; i++) {
    const char = first[i];
    if (char && strings.every(str => str && str[i] === char)) {
      prefix += char;
    } else {
      break;
    }
  }

  // Return meaningful prefix (at least 3 characters)
  return prefix.length >= 3 ? prefix : null;
}
