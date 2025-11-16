/**
 * @file Commit Message Helpers Tests
 *
 * Tests for commit message helper functions
 */

import { describe, it, expect } from "vitest";
import { MessageHelpers } from "../message-helpers";

describe("MessageHelpers", () => {
  describe("determineCommitType", () => {
    it("should return test for pure test changes", () => {
      const type = MessageHelpers.determineCommitType(
        { suggestedType: "test" },
        {
          files: [],
          categories: { code: [], tests: ["test.spec.ts"], docs: [] },
        },
        []
      );
      expect(type).toBe("test");
    });

    it("should return docs for pure documentation changes", () => {
      const type = MessageHelpers.determineCommitType(
        { suggestedType: "docs" },
        {
          files: [],
          categories: { code: [], tests: [], docs: ["README.md"] },
        },
        []
      );
      expect(type).toBe("docs");
    });

    it("should return chore for package.json changes", () => {
      const type = MessageHelpers.determineCommitType(
        { suggestedType: "feat" },
        {
          files: [{ path: "package.json" }],
          categories: { code: [], tests: [], docs: [] },
        },
        [{ path: "package.json" }]
      );
      expect(type).toBe("chore");
    });

    it("should return ci for .github changes", () => {
      const type = MessageHelpers.determineCommitType(
        { suggestedType: "feat" },
        {
          files: [{ path: ".github/workflows/ci.yml" }],
          categories: { code: [], tests: [], docs: [] },
        },
        [{ path: ".github/workflows/ci.yml" }]
      );
      expect(type).toBe("ci");
    });

    it("should return build for vite.config changes", () => {
      const type = MessageHelpers.determineCommitType(
        { suggestedType: "feat" },
        {
          files: [{ path: "vite.config.ts" }],
          categories: { code: [], tests: [], docs: [] },
        },
        [{ path: "vite.config.ts" }]
      );
      expect(type).toBe("build");
    });
  });

  describe("determineScope", () => {
    it("should return scope for single package", () => {
      const scope = MessageHelpers.determineScope({
        affectedPackages: ["core"],
      });
      expect(scope).toBe("core");
    });

    it("should return undefined for multiple packages", () => {
      const scope = MessageHelpers.determineScope({
        affectedPackages: ["core", "utils"],
      });
      expect(scope).toBeUndefined();
    });

    it("should strip packages/ prefix", () => {
      const scope = MessageHelpers.determineScope({
        affectedPackages: ["packages/core"],
      });
      expect(scope).toBe("core");
    });

    it("should strip services/ prefix", () => {
      const scope = MessageHelpers.determineScope({
        affectedPackages: ["services/api"],
      });
      expect(scope).toBe("api");
    });
  });

  describe("generateDescription", () => {
    it("should return 'no changes' for empty files", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: [], docs: [], config: [] },
        []
      );
      expect(desc).toBe("no changes");
    });

    it("should handle single file rename", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: [], docs: [], config: [] },
        [{ path: "new.ts", status: "renamed" }]
      );
      expect(desc).toContain("rename");
    });

    it("should handle single file deletion", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: [], docs: [], config: [] },
        [{ path: "old.ts", status: "deleted" }]
      );
      expect(desc).toContain("remove");
    });

    it("should handle single file addition", () => {
      const desc = MessageHelpers.generateDescription(
        { code: ["new.ts"], tests: [], docs: [], config: [] },
        [{ path: "new.ts", status: "added" }]
      );
      expect(desc).toContain("add");
    });

    it("should handle multiple file additions", () => {
      const desc = MessageHelpers.generateDescription(
        { code: ["file1.ts", "file2.ts"], tests: [], docs: [], config: [] },
        [
          { path: "file1.ts", status: "added" },
          { path: "file2.ts", status: "added" },
        ]
      );
      expect(desc).toContain("add");
      expect(desc).toContain("2");
    });

    it("should handle test file additions", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: ["test.spec.ts"], docs: [], config: [] },
        [{ path: "test.spec.ts", status: "added" }]
      );
      expect(desc).toContain("test");
    });

    it("should handle documentation updates", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: [], docs: ["README.md"], config: [] },
        [{ path: "README.md", status: "modified" }]
      );
      expect(desc).toContain("documentation");
    });

    it("should handle configuration updates", () => {
      const desc = MessageHelpers.generateDescription(
        { code: [], tests: [], docs: [], config: ["package.json"] },
        [{ path: "package.json", status: "modified" }]
      );
      expect(desc).toContain("configuration");
    });

    it("should handle mixed changes", () => {
      const desc = MessageHelpers.generateDescription(
        { code: ["file1.ts", "file2.ts", "file3.ts"], tests: [], docs: [], config: [] },
        [
          { path: "file1.ts", status: "added" },
          { path: "file2.ts", status: "modified" },
          { path: "file3.ts", status: "deleted" },
        ]
      );
      // Should return a description (not empty)
      expect(desc).toBeTruthy();
      expect(desc.length).toBeGreaterThan(0);
      // Should handle multiple files
      expect(desc).toMatch(/\d+/); // Should contain a number
    });
  });

  describe("detectBreakingChanges", () => {
    it("should detect breaking changes in package.json", () => {
      const breaking = MessageHelpers.detectBreakingChanges(
        [{ path: "package.json" }],
        { totalLinesDeleted: 10, totalLinesAdded: 5 }
      );
      expect(breaking).toBe(true);
    });

    it("should detect breaking changes in API files", () => {
      const breaking = MessageHelpers.detectBreakingChanges(
        [{ path: "src/api/index.ts" }],
        { totalLinesDeleted: 10, totalLinesAdded: 5 }
      );
      expect(breaking).toBe(true);
    });

    it("should detect breaking changes when deletions exceed 50%", () => {
      const breaking = MessageHelpers.detectBreakingChanges(
        [{ path: "src/utils.ts" }],
        { totalLinesDeleted: 100, totalLinesAdded: 40 }
      );
      expect(breaking).toBe(true);
    });

    it("should not detect breaking changes for normal modifications", () => {
      const breaking = MessageHelpers.detectBreakingChanges(
        [{ path: "src/utils.ts" }],
        { totalLinesDeleted: 10, totalLinesAdded: 50 }
      );
      expect(breaking).toBe(false);
    });
  });

  describe("calculateConfidence", () => {
    it("should have high confidence for single file", () => {
      const confidence = MessageHelpers.calculateConfidence([{ path: "test.ts" }], {
        affectedPackages: ["core"],
      });
      expect(confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("should have lower confidence for many files", () => {
      const files = Array.from({ length: 25 }, (_, i) => ({ path: `file${i}.ts` }));
      const confidence = MessageHelpers.calculateConfidence(files, {
        affectedPackages: ["core"],
      });
      expect(confidence).toBeLessThanOrEqual(0.6);
    });

    it("should have higher confidence for single package", () => {
      const confidence = MessageHelpers.calculateConfidence([{ path: "test.ts" }], {
        affectedPackages: ["core"],
      });
      expect(confidence).toBeGreaterThan(0.7);
    });
  });

  describe("generateBody", () => {
    it("should return undefined for single file", () => {
      const body = MessageHelpers.generateBody([{ path: "test.ts" }]);
      expect(body).toBeUndefined();
    });

    it("should return body for multiple files", () => {
      const files = [
        { path: "file1.ts" },
        { path: "file2.ts" },
        { path: "file3.ts" },
      ];
      const body = MessageHelpers.generateBody(files);
      expect(body).toBeDefined();
      expect(body).toContain("file1.ts");
      expect(body).toContain("file2.ts");
    });

    it("should not generate body for too many files", () => {
      // generateBody only generates body for 1-9 files
      const files = Array.from({ length: 10 }, (_, i) => ({ path: `file${i}.ts` }));
      const body = MessageHelpers.generateBody(files);
      expect(body).toBeUndefined();
    });

    it("should truncate for moderate number of files", () => {
      const files = Array.from({ length: 7 }, (_, i) => ({ path: `file${i}.ts` }));
      const body = MessageHelpers.generateBody(files);
      expect(body).toBeDefined();
      expect(body).toContain("... and");
    });
  });
});

