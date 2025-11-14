/**
 * @file Development Tools Registration
 *
 * Registers all development-related tools with the registry.
 */

import { LintingTools } from "../development/linting";
import { FormattingTools } from "../development/formatting";
import { GitTools } from "../development/git";
import { YouTubeTools } from "../development/youtube";
import { registerToolCategory, createHandler } from "./utils";

/**
 * Register all development tools
 */
export function registerDevelopmentTools(): void {
  registerToolCategory("development", [
    {
      config: {
        name: "lint_frontend",
        description: "Run ESLint on frontend code with optional auto-fix",
        enabled: true,
      },
      handler: createHandler((args: { fix?: boolean; files?: string[]; config?: string }) =>
        LintingTools.lintFrontend(args)
      ),
    },
    {
      config: {
        name: "lint_python",
        description: "Run Python linting with flake8 and pylint",
        enabled: true,
      },
      handler: createHandler((args: { files?: string[]; usePylint?: boolean }) => LintingTools.lintPython(args)),
    },
    {
      config: {
        name: "lint_markdown",
        description: "Run markdownlint on markdown files",
        enabled: true,
      },
      handler: createHandler((args: { files?: string[]; config?: string }) => LintingTools.lintMarkdown(args)),
    },
    {
      config: {
        name: "format_frontend",
        description: "Format frontend code with Prettier",
        enabled: true,
      },
      handler: createHandler((args: { checkOnly?: boolean; files?: string[]; config?: string }) =>
        FormattingTools.formatFrontend(args)
      ),
    },
    {
      config: {
        name: "format_python",
        description: "Format Python code with Black and isort",
        enabled: true,
      },
      handler: createHandler((args: { checkOnly?: boolean; files?: string[] }) => FormattingTools.formatPython(args)),
    },
    {
      config: {
        name: "git_status",
        description: "Get git repository status",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string; short?: boolean }) => GitTools.gitStatus(args)),
    },
    {
      config: {
        name: "git_get_current_branch",
        description: "Get current git branch name",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string }) => GitTools.getCurrentBranch(args)),
    },
    {
      config: {
        name: "git_check_remote_exists",
        description: "Check if a git remote exists",
        enabled: true,
      },
      handler: createHandler((args: { remoteName: string; cwd?: string }) => GitTools.checkRemoteExists(args)),
    },
    {
      config: {
        name: "git_get_remote_url",
        description: "Get URL for a git remote",
        enabled: true,
      },
      handler: createHandler((args: { remoteName: string; cwd?: string }) => GitTools.getRemoteUrl(args)),
    },
    {
      config: {
        name: "git_add_remote",
        description: "Add or update a git remote",
        enabled: true,
      },
      handler: createHandler((args: { remoteName: string; url: string; cwd?: string; force?: boolean }) =>
        GitTools.addRemote(args)
      ),
    },
    {
      config: {
        name: "git_push",
        description: "Push to a git remote",
        enabled: true,
      },
      handler: createHandler(
        (args: { remoteName: string; branch?: string; tags?: boolean; mirror?: boolean; cwd?: string }) =>
          GitTools.push(args)
      ),
    },
    {
      config: {
        name: "git_list_remotes",
        description: "List all git remotes",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string }) => GitTools.listRemotes(args)),
    },
    {
      config: {
        name: "git_verify_repository",
        description: "Verify git repository integrity",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string }) => GitTools.verifyRepository(args)),
    },
    {
      config: {
        name: "git_get_latest_commit",
        description: "Get latest commit hash",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string; short?: boolean }) => GitTools.getLatestCommit(args)),
    },
    {
      config: {
        name: "git_analyze_uncommitted_changes",
        description: "Analyze uncommitted git changes (staged and unstaged) with detailed categorization",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string; includeStaged?: boolean; includeUnstaged?: boolean }) =>
        GitTools.analyzeUncommittedChanges(args)
      ),
    },
    {
      config: {
        name: "git_generate_commit_message",
        description: "Generate conventional commit message suggestions based on uncommitted changes",
        enabled: true,
      },
      handler: createHandler((args: { cwd?: string; includeStaged?: boolean; includeUnstaged?: boolean }) =>
        GitTools.generateCommitMessage(args)
      ),
    },
    {
      config: {
        name: "git_analyze_commit_message_quality",
        description: "Analyze commit message quality and provide improvement suggestions",
        enabled: true,
      },
      handler: createHandler((args: { message: string }) => GitTools.analyzeCommitMessageQuality(args)),
    },
    {
      config: {
        name: "extract_youtube_closed_captions",
        description: "Extract closed captions from YouTube video using yt-dlp",
        enabled: true,
      },
      handler: createHandler((args: { url: string; outputDir?: string; proxy?: string }) =>
        YouTubeTools.extractClosedCaptions(args)
      ),
    },
  ]);
}
