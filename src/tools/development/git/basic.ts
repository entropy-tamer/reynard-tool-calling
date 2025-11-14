/**
 * @file Basic Git Operations
 *
 * Re-exports for basic git operations organized into modular files
 */

import { StatusOperations } from "./status";
import { RemoteInfo } from "./remote-info";
import { RemoteManagement } from "./remote-management";
import { RepositoryOperations } from "./repository";

/**
 * Basic git operations
 * @deprecated Use StatusOperations, RemoteInfo, RemoteManagement, or RepositoryOperations directly
 */
export class BasicGitOperations {
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
}
