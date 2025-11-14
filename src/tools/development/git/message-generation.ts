/**
 * @file Commit Message Generation
 *
 * Generate conventional commit messages based on uncommitted changes
 */

import { ToolResult } from "../../types";
import { ChangeAnalysis } from "./changes";
import { MessageHelpers } from "./message-helpers";

/**
 * Commit message generation operations
 */
export class MessageGeneration {
  /**
   * Generate conventional commit message suggestions based on uncommitted changes
   * @param args - Configuration options
   * @returns Promise resolving to ToolResult with commit message suggestions
   * @example
   * ```typescript
   * const result = await MessageGeneration.generateCommitMessage({
   *   includeStaged: true,
   *   includeUnstaged: false
   * });
   * if (result.success) {
   *   console.log(result.data.fullMessage);
   * }
   * ```
   */
  static async generateCommitMessage(args: {
    cwd?: string;
    includeStaged?: boolean;
    includeUnstaged?: boolean;
  }): Promise<ToolResult> {
    try {
      const { cwd = process.cwd(), includeStaged = true, includeUnstaged = false } = args;

      // First analyze the changes
      const analysisResult = await ChangeAnalysis.analyzeUncommittedChanges({
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

      const analysis = analysisResult.data as {
        summary: {
          suggestedType: string;
          affectedPackages?: string[];
          totalLinesDeleted: number;
          totalLinesAdded: number;
        };
        staged: {
          files: Array<{ path: string; status: string }>;
          categories: {
            code: string[];
            tests: string[];
            docs: string[];
            config: string[];
            other: string[];
          };
        };
      };
      const summary = analysis.summary;
      const staged = analysis.staged;
      const files = staged.files || [];

      // Determine commit type
      const type = MessageHelpers.determineCommitType(summary, staged, files);
      const categories = staged.categories || { code: [], tests: [], docs: [], config: [], other: [] };

      // Determine scope from affected packages
      const scope = MessageHelpers.determineScope(summary);

      // Generate description
      const description = MessageHelpers.generateDescription(categories, files);

      // Check for breaking changes
      const hasBreakingChanges = MessageHelpers.detectBreakingChanges(files, summary);

      // Generate full message
      const scopePart = scope ? `(${scope})` : "";
      const breakingPart = hasBreakingChanges ? "!" : "";
      const fullMessage = `${type}${scopePart}${breakingPart}: ${description}`;

      // Generate alternatives
      const alternatives = MessageHelpers.generateAlternatives(type, scopePart, description, files);

      // Calculate confidence based on analysis quality
      const confidence = MessageHelpers.calculateConfidence(files, summary);

      // Generate body suggestions
      const body = MessageHelpers.generateBody(files);

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
}
