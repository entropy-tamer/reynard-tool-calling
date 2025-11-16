/**
 * @file Commit Message Analysis
 *
 * Analyze commit message quality and provide suggestions
 */

import { ToolResult } from "../../types";

/**
 * Commit message analysis operations
 */
export class MessageAnalysis {
  /**
   * Analyze commit message quality and provide suggestions
   * @param args - Message to analyze
   * @returns Promise resolving to ToolResult with quality analysis
   * @example
   * ```typescript
   * const result = await MessageAnalysis.analyzeCommitMessageQuality({
   *   message: "feat(api): add new endpoint"
   * });
   * if (result.success) {
   *   console.log(`Score: ${result.data.score}/100`);
   * }
   * ```
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

      if (!firstLine) {
        return {
          success: true,
          data: {
            score: 0,
            issues: ["Message is empty"],
            suggestions: ["Provide a commit message"],
          },
        };
      }

      // Check length
      score = this.checkLength(firstLine, issues, suggestions, score);

      // Check for conventional commit format
      const match = this.checkConventionalFormat(firstLine, issues, suggestions, score);
      score = match.score;

      // Check for body
      this.checkBody(lines, firstLine, suggestions);

      // Check for footer
      this.checkFooter(lines, suggestions);

      // Check for common issues
      score = this.checkCommonIssues(firstLine, issues, suggestions, score);

      score = Math.max(0, Math.min(100, score));
      const compliant = match.match !== null && score >= 60;

      return {
        success: true,
        data: {
          score: Math.round(score),
          compliant,
          issues,
          suggestions,
        },
        logs: [
          `Message quality score: ${Math.round(score)}/100`,
          compliant ? "Message is compliant" : "Message needs improvement",
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze commit message quality",
      };
    }
  }

  private static checkLength(firstLine: string, issues: string[], suggestions: string[], score: number): number {
    if (firstLine.length < 10) {
      issues.push("Message is too short (less than 10 characters)");
      suggestions.push("Provide a more descriptive message");
      return score - 30;
    } else if (firstLine.length > 72) {
      issues.push("First line exceeds 72 characters (recommended limit)");
      suggestions.push("Keep the first line under 72 characters");
      return score - 10;
    } else if (firstLine.length > 50 && firstLine.length <= 72) {
      return score - 5; // Minor penalty for being close to limit
    }
    return score;
  }

  private static checkConventionalFormat(
    firstLine: string,
    issues: string[],
    suggestions: string[],
    initialScore: number
  ): { match: RegExpMatchArray | null; score: number } {
    const conventionalPattern = /^(\w+)(\([^)]+\))?(!)?:\s+(.+)$/;
    const match = firstLine.match(conventionalPattern);
    let score = initialScore;

    if (!match) {
      issues.push("Message does not follow conventional commit format");
      suggestions.push("Use format: type(scope): description");
      score -= 40;
    } else {
      const [, type, , , commitDescription] = match;

      // Validate type
      const validTypes = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore", "ci", "build"];
      if (type && !validTypes.includes(type)) {
        issues.push(`Unknown commit type: ${type}`);
        suggestions.push(`Use one of: ${validTypes.join(", ")}`);
        score -= 20;
      }

      // Check description
      if (!commitDescription || commitDescription.length < 3) {
        issues.push("Description is missing or too short");
        suggestions.push("Provide a clear description of the change");
        score -= 30;
      } else if (commitDescription.length > 50) {
        issues.push("Description is too long for first line");
        suggestions.push("Move detailed description to message body");
        score -= 10;
      }

      // Check for imperative mood
      if (commitDescription) {
        const imperativePattern = /^(add|fix|update|remove|refactor|implement|create|delete|change|improve)/i;
        if (!imperativePattern.test(commitDescription)) {
          suggestions.push("Use imperative mood (e.g., 'add feature' not 'added feature')");
          score -= 5;
        }
      }
    }

    return { match, score };
  }

  private static checkBody(lines: string[], firstLine: string, suggestions: string[]): void {
    if (lines.length === 1 && firstLine.length < 50) {
      suggestions.push("Consider adding a message body for complex changes");
    }
  }

  private static checkFooter(lines: string[], suggestions: string[]): void {
    const hasFooter =
      lines.length > 1 && lines.some((line, idx) => idx > 0 && (line.includes("#") || line.includes("BREAKING")));
    if (!hasFooter && lines.length > 1) {
      suggestions.push("Consider adding footer with issue references (e.g., 'Closes #123')");
    }
  }

  private static checkCommonIssues(firstLine: string, issues: string[], suggestions: string[], score: number): number {
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

    return score;
  }
}






