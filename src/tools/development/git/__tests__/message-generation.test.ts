/**
 * @file Commit Message Generation Tests
 *
 * Tests for commit message generation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MessageGeneration } from "../message-generation";
import {
  createTempGitRepo,
  createFile,
  stageFile,
  commit,
  modifyFile,
  deleteFile,
  type TempGitRepo,
} from "./test-utils";

describe("MessageGeneration", () => {
  let repo: TempGitRepo;

  beforeEach(async () => {
    repo = await createTempGitRepo();
  });

  afterEach(async () => {
    await repo.cleanup();
  });

  describe("generateCommitMessage", () => {
    it("should generate message for single file addition", async () => {
      await createFile(repo.path, "feature.ts", "export const feature = () => {};");
      stageFile(repo.path, "feature.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("feat");
        expect(result.data.fullMessage).toContain("feat");
        expect(result.data.description).toContain("add");
        expect(result.data.confidence).toBeGreaterThan(0);
      }
    });

    it("should generate message for single file modification", async () => {
      await createFile(repo.path, "bug.ts", "export const bug = 1;");
      stageFile(repo.path, "bug.ts");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "bug.ts", "export const bug = 2;");
      stageFile(repo.path, "bug.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("fix");
        expect(result.data.fullMessage).toContain("fix");
        expect(result.data.description).toContain("update");
      }
    });

    it("should generate message for single file deletion", async () => {
      await createFile(repo.path, "old.ts", "export const old = 1;");
      stageFile(repo.path, "old.ts");
      commit(repo.path, "Initial commit");

      deleteFile(repo.path, "old.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("refactor");
        expect(result.data.description).toContain("remove");
      }
    });

    it("should generate message with scope for package changes", async () => {
      await createFile(repo.path, "packages/core/src/index.ts", "export const core = {};");
      stageFile(repo.path, "packages/core/src/index.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.scope).toBe("core");
        expect(result.data.fullMessage).toContain("(core)");
      }
    });

    it("should generate message for test files", async () => {
      await createFile(repo.path, "test.spec.ts", "describe('test', () => {});");
      stageFile(repo.path, "test.spec.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("test");
        expect(result.data.description).toContain("test");
      }
    });

    it("should generate message for documentation files", async () => {
      await createFile(repo.path, "README.md", "# Documentation");
      stageFile(repo.path, "README.md");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "README.md", "# Updated Documentation");
      stageFile(repo.path, "README.md");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("docs");
        expect(result.data.description).toContain("documentation");
      }
    });

    it("should generate message for configuration files", async () => {
      await createFile(repo.path, "package.json", '{"name": "test"}');
      stageFile(repo.path, "package.json");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "package.json", '{"name": "test", "version": "1.0.0"}');
      stageFile(repo.path, "package.json");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.type).toBe("chore");
        expect(result.data.description).toContain("configuration");
      }
    });

    it("should detect breaking changes", async () => {
      await createFile(repo.path, "package.json", '{"name": "test", "version": "1.0.0"}');
      stageFile(repo.path, "package.json");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "package.json", '{"name": "test", "version": "2.0.0"}');
      stageFile(repo.path, "package.json");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.fullMessage).toContain("!");
        expect(result.data.footer).toContain("BREAKING CHANGE");
      }
    });

    it("should generate alternatives", async () => {
      await createFile(repo.path, "feature.ts", "export const feature = () => {};");
      stageFile(repo.path, "feature.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.alternatives).toBeDefined();
        expect(Array.isArray(result.data.alternatives)).toBe(true);
      }
    });

    it("should return error for non-git directory", async () => {
      const result = await MessageGeneration.generateCommitMessage({
        cwd: "/tmp/not-a-git-repo",
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle empty changes gracefully", async () => {
      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      // Should succeed but with minimal message
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.description).toBe("no changes");
      }
    });

    it("should generate body for multiple files", async () => {
      await createFile(repo.path, "file1.ts", "export const a = 1;");
      await createFile(repo.path, "file2.ts", "export const b = 2;");
      await createFile(repo.path, "file3.ts", "export const c = 3;");
      stageFile(repo.path, "file1.ts");
      stageFile(repo.path, "file2.ts");
      stageFile(repo.path, "file3.ts");

      const result = await MessageGeneration.generateCommitMessage({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.body).toBeDefined();
        expect(result.data.body).toContain("file1.ts");
      }
    });
  });
});

