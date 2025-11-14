/**
 * @file Git Commit Operations
 *
 * Re-exports for commit operations organized into modular files
 */

import { MessageGeneration } from "./message-generation";
import { MessageAnalysis } from "./message-analysis";

/**
 * Git commit operations
 * @deprecated Use MessageGeneration or MessageAnalysis directly
 */
export class CommitOperations {
  static generateCommitMessage = MessageGeneration.generateCommitMessage;
  static analyzeCommitMessageQuality = MessageAnalysis.analyzeCommitMessageQuality;
}
