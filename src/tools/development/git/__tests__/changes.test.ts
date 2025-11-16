/**
 * @file Git Change Analysis Tests
 *
 * Comprehensive tests for git change analysis functionality
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ChangeAnalysis } from "../changes";
import {
  createTempGitRepo,
  createFile,
  stageFile,
  commit,
  modifyFile,
  deleteFile,
  renameFile,
  type TempGitRepo,
} from "./test-utils";

describe("ChangeAnalysis", () => {
  let repo: TempGitRepo;

  beforeEach(async () => {
    repo = await createTempGitRepo();
  });

  afterEach(async () => {
    await repo.cleanup();
  });

  describe("analyzeUncommittedChanges", () => {
    it("should return error for non-git directory", async () => {
      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: "/tmp/not-a-git-repo",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not a git repository");
    });

    it("should return empty results for repository with no changes", async () => {
      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: true,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(0);
        expect(result.data.unstaged.files).toHaveLength(0);
        expect(result.data.summary.totalFiles).toBe(0);
      }
    });

    it("should detect single file added (staged)", async () => {
      await createFile(repo.path, "feature.ts", "export const feature = 1;");
      stageFile(repo.path, "feature.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(1);
        expect(result.data.staged.files[0]?.status).toBe("added");
        expect(result.data.staged.files[0]?.path).toBe("feature.ts");
        expect(result.data.summary.suggestedType).toBe("feat");
      }
    });

    it("should detect single file modified (staged)", async () => {
      await createFile(repo.path, "test.ts", "export const test = 1;");
      stageFile(repo.path, "test.ts");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "test.ts", "export const test = 2;");
      stageFile(repo.path, "test.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(1);
        expect(result.data.staged.files[0]?.status).toBe("modified");
        expect(result.data.staged.files[0]?.path).toBe("test.ts");
      }
    });

    it("should detect single file deleted (staged)", async () => {
      await createFile(repo.path, "old.ts", "export const old = 1;");
      stageFile(repo.path, "old.ts");
      commit(repo.path, "Initial commit");

      deleteFile(repo.path, "old.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(1);
        expect(result.data.staged.files[0]?.status).toBe("deleted");
        expect(result.data.staged.files[0]?.path).toBe("old.ts");
        expect(result.data.summary.suggestedType).toBe("refactor");
      }
    });

    it("should detect single file renamed (staged)", async () => {
      await createFile(repo.path, "old.ts", "export const test = 1;");
      stageFile(repo.path, "old.ts");
      commit(repo.path, "Initial commit");

      renameFile(repo.path, "old.ts", "new.ts");
      stageFile(repo.path, "new.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const renamedFiles = result.data.staged.files.filter(f => f.status === "renamed");
        expect(renamedFiles.length).toBeGreaterThan(0);
        expect(result.data.summary.suggestedType).toBe("refactor");
      }
    });

    it("should detect multiple files of different types", async () => {
      await createFile(repo.path, "file1.ts", "export const a = 1;");
      await createFile(repo.path, "file2.ts", "export const b = 2;");
      await createFile(repo.path, "file3.md", "# Documentation");
      stageFile(repo.path, "file1.ts");
      stageFile(repo.path, "file2.ts");
      stageFile(repo.path, "file3.md");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(3);
        expect(result.data.staged.categories.code).toHaveLength(2);
        expect(result.data.staged.categories.docs).toHaveLength(1);
      }
    });

    it("should detect unstaged changes", async () => {
      await createFile(repo.path, "test.ts", "export const test = 1;");
      stageFile(repo.path, "test.ts");
      commit(repo.path, "Initial commit");

      await modifyFile(repo.path, "test.ts", "export const test = 2;");
      // Don't stage it

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: false,
        includeUnstaged: true,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.unstaged.files).toHaveLength(1);
        expect(result.data.unstaged.files[0]?.status).toBe("modified");
      }
    });

    it("should detect both staged and unstaged changes", async () => {
      await createFile(repo.path, "staged.ts", "export const a = 1;");
      await createFile(repo.path, "unstaged.ts", "export const b = 2;");
      stageFile(repo.path, "staged.ts");
      stageFile(repo.path, "unstaged.ts");
      commit(repo.path, "Initial commit");

      // Modify both files
      await modifyFile(repo.path, "staged.ts", "export const a = 10;");
      await modifyFile(repo.path, "unstaged.ts", "export const b = 20;");

      // Stage only one
      stageFile(repo.path, "staged.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: true,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files.length).toBeGreaterThan(0);
        expect(result.data.unstaged.files.length).toBeGreaterThan(0);
      }
    });

    it("should handle files with spaces in names", async () => {
      await createFile(repo.path, "file with spaces.ts", "export const test = 1;");
      stageFile(repo.path, "file with spaces.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(1);
        expect(result.data.staged.files[0]?.path).toContain("spaces");
      }
    });

    it("should handle files in subdirectories", async () => {
      await createFile(repo.path, "src/utils/helper.ts", "export const helper = () => {};");
      stageFile(repo.path, "src/utils/helper.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(1);
        expect(result.data.staged.files[0]?.path).toBe("src/utils/helper.ts");
      }
    });

    it("should detect package in monorepo structure", async () => {
      await createFile(repo.path, "packages/core/src/index.ts", "export const core = {};");
      stageFile(repo.path, "packages/core/src/index.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files[0]?.package).toBe("core");
        expect(result.data.summary.affectedPackages).toContain("core");
      }
    });

    it("should detect service in monorepo structure", async () => {
      await createFile(repo.path, "services/api/src/server.ts", "export const server = {};");
      stageFile(repo.path, "services/api/src/server.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files[0]?.package).toBe("services/api");
        expect(result.data.summary.affectedPackages).toContain("services/api");
      }
    });

    it("should calculate line counts correctly", async () => {
      await createFile(repo.path, "test.ts", "line1\nline2\nline3\nline4\nline5");
      stageFile(repo.path, "test.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files[0]?.linesAdded).toBeGreaterThan(0);
        expect(result.data.staged.stats.totalLinesAdded).toBeGreaterThan(0);
      }
    });

    it("should categorize test files correctly", async () => {
      await createFile(repo.path, "src/utils.test.ts", "describe('test', () => {});");
      stageFile(repo.path, "src/utils.test.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.categories.tests).toContain("src/utils.test.ts");
        expect(result.data.summary.suggestedType).toBe("test");
      }
    });

    it("should categorize documentation files correctly", async () => {
      await createFile(repo.path, "README.md", "# Documentation");
      stageFile(repo.path, "README.md");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.categories.docs).toContain("README.md");
        expect(result.data.summary.suggestedType).toBe("docs");
      }
    });

    it("should categorize config files correctly", async () => {
      await createFile(repo.path, "package.json", '{"name": "test"}');
      stageFile(repo.path, "package.json");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.categories.config).toContain("package.json");
      }
    });

    it("should handle mixed change types", async () => {
      await createFile(repo.path, "file1.ts", "export const a = 1;");
      await createFile(repo.path, "file2.ts", "export const b = 2;");
      stageFile(repo.path, "file1.ts");
      stageFile(repo.path, "file2.ts");
      commit(repo.path, "Initial commit");

      await createFile(repo.path, "file3.ts", "export const c = 3;");
      await modifyFile(repo.path, "file1.ts", "export const a = 10;");
      deleteFile(repo.path, "file2.ts");

      stageFile(repo.path, "file3.ts");
      stageFile(repo.path, "file1.ts");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: true,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const allFiles = [...result.data.staged.files, ...result.data.unstaged.files];
        const added = allFiles.filter(f => f.status === "added");
        const modified = allFiles.filter(f => f.status === "modified");
        const deleted = allFiles.filter(f => f.status === "deleted");

        expect(added.length).toBeGreaterThan(0);
        expect(modified.length).toBeGreaterThan(0);
        expect(deleted.length).toBeGreaterThan(0);
      }
    });

    it("should exclude unstaged when includeUnstaged is false", async () => {
      await createFile(repo.path, "staged.ts", "export const a = 1;");
      await createFile(repo.path, "unstaged.ts", "export const b = 2;");
      stageFile(repo.path, "staged.ts");
      commit(repo.path, "Initial commit");

      stageFile(repo.path, "staged.ts");
      await modifyFile(repo.path, "unstaged.ts", "export const b = 3;");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: true,
        includeUnstaged: false,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.unstaged.files).toHaveLength(0);
      }
    });

    it("should exclude staged when includeStaged is false", async () => {
      await createFile(repo.path, "staged.ts", "export const a = 1;");
      await createFile(repo.path, "unstaged.ts", "export const b = 2;");
      stageFile(repo.path, "staged.ts");
      commit(repo.path, "Initial commit");

      stageFile(repo.path, "staged.ts");
      await modifyFile(repo.path, "unstaged.ts", "export const b = 3;");

      const result = await ChangeAnalysis.analyzeUncommittedChanges({
        cwd: repo.path,
        includeStaged: false,
        includeUnstaged: true,
      });

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.staged.files).toHaveLength(0);
      }
    });
  });
});

