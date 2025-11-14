/**
 * @file Git Tools Main Export
 *
 * Unified export for all git operations
 */

import { StatusOperations } from "./status";
import { RemoteInfo } from "./remote-info";
import { RemoteManagement } from "./remote-management";
import { RepositoryOperations } from "./repository";
import { ChangeAnalysis } from "./changes";
import { MessageGeneration } from "./message-generation";
import { MessageAnalysis } from "./message-analysis";

/**
 * Git operations tools for development workflows
 *
 * This class provides a unified interface to all git operations,
 * delegating to specialized modules for organization.
 */
export class GitTools {
  // Status operations
  static gitStatus = StatusOperations.gitStatus;
  static getCurrentBranch = StatusOperations.getCurrentBranch;
  static getLatestCommit = StatusOperations.getLatestCommit;

  // Remote operations
  static checkRemoteExists = RemoteInfo.checkRemoteExists;
  static getRemoteUrl = RemoteInfo.getRemoteUrl;
  static listRemotes = RemoteInfo.listRemotes;
  static addRemote = RemoteManagement.addRemote;
  static push = RemoteManagement.push;

  // Repository operations
  static verifyRepository = RepositoryOperations.verifyRepository;

  // Change analysis
  static analyzeUncommittedChanges = ChangeAnalysis.analyzeUncommittedChanges;

  // Commit operations
  static generateCommitMessage = MessageGeneration.generateCommitMessage;
  static analyzeCommitMessageQuality = MessageAnalysis.analyzeCommitMessageQuality;
}
