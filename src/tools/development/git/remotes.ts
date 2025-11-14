/**
 * @file Git Remote Operations
 *
 * Re-exports for remote operations organized into modular files
 */

import { RemoteInfo } from "./remote-info";
import { RemoteManagement } from "./remote-management";

/**
 * Git remote operations
 * @deprecated Use RemoteInfo or RemoteManagement directly
 */
export class RemoteOperations {
  static checkRemoteExists = RemoteInfo.checkRemoteExists;
  static getRemoteUrl = RemoteInfo.getRemoteUrl;
  static listRemotes = RemoteInfo.listRemotes;
  static addRemote = RemoteManagement.addRemote;
  static push = RemoteManagement.push;
}
