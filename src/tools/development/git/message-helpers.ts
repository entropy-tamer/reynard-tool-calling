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
    files: Array<{ path: string; status: string }>
  ): string {
    if (files.length === 0) {
      return "no changes";
    }

    // Count files by status
    const addedFiles = files.filter(f => f.status === "added");
    const deletedFiles = files.filter(f => f.status === "deleted");
    const renamedFiles = files.filter(f => f.status === "renamed");
    const modifiedFiles = files.filter(f => f.status === "modified");

    // Handle renames
    if (renamedFiles.length > 0 && files.length === renamedFiles.length) {
      if (renamedFiles.length === 1) {
        const file = renamedFiles[0];
        const fileName = file.path.split("/").pop() || file.path;
        return `rename ${fileName}`;
      }
      return `rename ${renamedFiles.length} files`;
    }

    // Handle pure deletions
    if (deletedFiles.length > 0 && addedFiles.length === 0 && modifiedFiles.length === 0) {
      if (deletedFiles.length === 1) {
        const file = deletedFiles[0];
        const fileName = file.path.split("/").pop() || file.path;
        return `remove ${fileName}`;
      }
      return `remove ${deletedFiles.length} files`;
    }

    // Handle pure additions
    if (addedFiles.length > 0 && modifiedFiles.length === 0 && deletedFiles.length === 0) {
      if (categories.code.length > 0) {
        const codeFiles = addedFiles.filter(f => categories.code.includes(f.path));
        if (codeFiles.length === 1) {
          const file = codeFiles[0];
          const fileName = file.path.split("/").pop()?.replace(/\.(ts|tsx|js|jsx|py|rs)$/, "") || file.path;
          return `add ${fileName}`;
        }
        return `add ${codeFiles.length} ${codeFiles.length === 1 ? "file" : "files"}`;
      }
      if (categories.tests.length > 0) {
        return `add ${categories.tests.length} ${categories.tests.length === 1 ? "test" : "tests"}`;
      }
      if (addedFiles.length === 1) {
        const file = addedFiles[0];
        const fileName = file.path.split("/").pop() || file.path;
        return `add ${fileName}`;
      }
      return `add ${addedFiles.length} ${addedFiles.length === 1 ? "file" : "files"}`;
    }

    // Handle code changes
    if (categories.code.length > 0) {
      const codeFiles = files.filter(f => categories.code.includes(f.path));
      if (codeFiles.length === 1) {
        const file = codeFiles[0];
        const fileName = file.path.split("/").pop()?.replace(/\.(ts|tsx|js|jsx|py|rs)$/, "") || file.path;
        return `update ${fileName}`;
      } else if (codeFiles.length < 5) {
        return `update ${codeFiles.length} ${codeFiles.length === 1 ? "file" : "files"}`;
      } else {
        return `update ${codeFiles.length} code files`;
      }
    }

    // Handle test changes
    if (categories.tests.length > 0) {
      if (addedFiles.some(f => categories.tests.includes(f.path))) {
        return `add ${categories.tests.length} ${categories.tests.length === 1 ? "test" : "tests"}`;
      }
      return `update ${categories.tests.length} ${categories.tests.length === 1 ? "test" : "tests"}`;
    }

    // Handle documentation changes
    if (categories.docs.length > 0) {
      return `update documentation`;
    }

    // Handle config changes
    if (categories.config.length > 0) {
      return `update configuration`;
    }

    // Fallback: describe by status
    if (files.length === 1) {
      const file = files[0];
      const fileName = file.path.split("/").pop() || file.path;
      const action = file.status === "added" ? "add" : file.status === "deleted" ? "remove" : "update";
      return `${action} ${fileName}`;
    }

    // Mixed changes
    const parts: string[] = [];
    if (addedFiles.length > 0) parts.push(`add ${addedFiles.length}`);
    if (modifiedFiles.length > 0) parts.push(`update ${modifiedFiles.length}`);
    if (deletedFiles.length > 0) parts.push(`remove ${deletedFiles.length}`);
    if (renamedFiles.length > 0) parts.push(`rename ${renamedFiles.length}`);

    if (parts.length > 0) {
      return parts.join(", ");
    }

    return `update ${files.length} ${files.length === 1 ? "file" : "files"}`;
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






