/**
 * @file Test Utilities for Git Analysis Tests
 *
 * Utility functions for creating temporary git repositories for testing
 */

import { execSync } from "child_process";
import { mkdtemp, rm, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export interface TempGitRepo {
  path: string;
  cleanup: () => Promise<void>;
}

/**
 * Create a temporary git repository for testing
 */
export async function createTempGitRepo(): Promise<TempGitRepo> {
  const tempDir = await mkdtemp(join(tmpdir(), "git-test-"));
  const cleanup = async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  };

  // Initialize git repository
  execSync("git init", { cwd: tempDir, stdio: "pipe" });
  execSync("git config user.name 'Test User'", { cwd: tempDir, stdio: "pipe" });
  execSync("git config user.email 'test@example.com'", { cwd: tempDir, stdio: "pipe" });

  return { path: tempDir, cleanup };
}

/**
 * Create a file in the repository
 */
export async function createFile(repoPath: string, filePath: string, content: string): Promise<void> {
  const fullPath = join(repoPath, filePath);
  const dir = join(fullPath, "..");
  await mkdir(dir, { recursive: true });
  await writeFile(fullPath, content, "utf-8");
}

/**
 * Stage a file
 */
export function stageFile(repoPath: string, filePath: string): void {
  execSync(`git add "${filePath}"`, { cwd: repoPath, stdio: "pipe" });
}

/**
 * Commit staged changes
 */
export function commit(repoPath: string, message: string = "Initial commit"): void {
  execSync(`git commit -m "${message}"`, { cwd: repoPath, stdio: "pipe" });
}

/**
 * Modify a file
 */
export async function modifyFile(repoPath: string, filePath: string, newContent: string): Promise<void> {
  const fullPath = join(repoPath, filePath);
  await writeFile(fullPath, newContent, "utf-8");
}

/**
 * Delete a file
 */
export function deleteFile(repoPath: string, filePath: string): void {
  execSync(`git rm "${filePath}"`, { cwd: repoPath, stdio: "pipe" });
}

/**
 * Rename a file
 */
export function renameFile(repoPath: string, oldPath: string, newPath: string): void {
  execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: repoPath, stdio: "pipe" });
}

/**
 * Get git status output
 */
export function getGitStatus(repoPath: string): string {
  try {
    return execSync("git status --porcelain", { cwd: repoPath, encoding: "utf-8", stdio: "pipe" });
  } catch {
    return "";
  }
}

