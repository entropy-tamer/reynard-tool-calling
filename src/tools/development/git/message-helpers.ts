/**
 * @file Commit Message Generation Helpers
 *
 * Helper functions for commit message generation
 */

import { findCommonPrefix } from "./utils";

/**
 * Helper functions for commit message generation
 */
export class MessageHelpers {
  static determineCommitType(
    summary: { suggestedType: string },
    staged: { files: Array<{ path: string }>; categories: { code: string[]; tests: string[]; docs: string[] } },
    files: Array<{ path: string }>
  ): string {
    let type = summary.suggestedType || "chore";
    const categories = staged.categories || { code: [], tests: [], docs: [] };

    // Refine type based on file patterns
    if (categories.tests.length > 0 && categories.code.length === 0) {
      type = "test";
    } else if (categories.docs.length > 0 && categories.code.length === 0) {
      type = "docs";
    } else if (files.some(f => f.path.includes("package.json") || f.path.includes("pnpm-lock.yaml"))) {
      type = "chore";
    } else if (files.some(f => f.path.includes(".github") || f.path.includes("ci/"))) {
      type = "ci";
    } else if (files.some(f => f.path.includes("vite.config") || f.path.includes("tsconfig"))) {
      type = "build";
    }

    return type;
  }

  static determineScope(summary: { affectedPackages?: string[] }): string | undefined {
    let scope: string | undefined;
    if (summary.affectedPackages && summary.affectedPackages.length === 1) {
      const packageName = summary.affectedPackages[0];
      if (packageName) {
        scope = packageName.replace("packages/", "").replace("services/", "");
      }
    } else if (summary.affectedPackages && summary.affectedPackages.length > 1) {
      // Multiple packages - use common prefix or omit scope
      const packages = summary.affectedPackages;
      if (packages) {
        const commonPrefix = findCommonPrefix(packages);
        if (commonPrefix && commonPrefix.length > 3) {
          scope = commonPrefix;
        }
      }
    }
    return scope;
  }

  static generateDescription(
    categories: { code: string[]; tests: string[]; docs: string[]; config: string[] },
    files: Array<{ path: string }>
  ): string {
    let description = "";

    if (categories.code.length > 0) {
      const codeFiles = files.filter(f => categories.code.includes(f.path));
      if (codeFiles.length === 1) {
        const firstFile = codeFiles[0];
        if (firstFile) {
          const fileName =
            firstFile.path
              .split("/")
              .pop()
              ?.replace(/\.(ts|tsx|js|jsx|py)$/, "") || "";
          description = `update ${fileName}`;
        }
      } else if (codeFiles.length < 5) {
        description = `update ${codeFiles.length} files`;
      } else {
        description = `update ${codeFiles.length} code files`;
      }
    } else if (categories.tests.length > 0) {
      description = `add tests for ${categories.tests.length > 1 ? "multiple components" : "component"}`;
    } else if (categories.docs.length > 0) {
      description = `update documentation`;
    } else if (categories.config.length > 0) {
      description = `update configuration`;
    } else {
      description = `update ${files.length} file${files.length > 1 ? "s" : ""}`;
    }

    return description;
  }

  static detectBreakingChanges(
    files: Array<{ path: string }>,
    summary: { totalLinesDeleted: number; totalLinesAdded: number }
  ): boolean {
    return (
      files.some(f => f.path.includes("package.json")) ||
      files.some(f => f.path.includes("api") || f.path.includes("interface")) ||
      summary.totalLinesDeleted > summary.totalLinesAdded * 0.5
    );
  }

  static generateAlternatives(
    type: string,
    scopePart: string,
    description: string,
    files: Array<{ path: string; status: string }>
  ): string[] {
    const alternatives: string[] = [];
    if (scopePart) {
      alternatives.push(`${type}: ${description}`);
    }
    if (files.length === 1) {
      const singleFile = files[0];
      if (singleFile) {
        const fileName =
          singleFile.path
            .split("/")
            .pop()
            ?.replace(/\.(ts|tsx|js|jsx|py)$/, "") || "";
        alternatives.push(`${type}${scopePart}: ${singleFile.status} ${fileName}`);
      }
    }
    return alternatives;
  }

  static calculateConfidence(files: Array<unknown>, summary: { affectedPackages?: string[] }): number {
    let confidence = 0.7;
    if (files.length === 1) confidence = 0.9;
    if (files.length > 20) confidence = 0.5;
    if (summary.affectedPackages && summary.affectedPackages.length === 1) confidence += 0.1;
    return confidence;
  }

  static generateBody(files: Array<{ path: string }>): string | undefined {
    let body: string | undefined;
    if (files.length > 1 && files.length < 10) {
      const fileList = files
        .slice(0, 5)
        .map(f => `- ${f.path}`)
        .join("\n");
      body = `Updated files:\n${fileList}${files.length > 5 ? `\n- ... and ${files.length - 5} more` : ""}`;
    }
    return body;
  }
}





