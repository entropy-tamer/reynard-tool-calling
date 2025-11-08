/**
 * @file Tool Registration
 *
 * Registers all native tools with the registry.
 */

import { registerTool } from "./registry";
import { TimeTools } from "./agent/time";
import { LocationTools } from "./agent/location";
import { NamingTools } from "./agent/naming";
import { NotificationTools } from "./agent/notifications";
import { LintingTools } from "./development/linting";
import { FormattingTools } from "./development/formatting";
import { GitTools } from "./development/git";
import { ServiceTools } from "./systemd/ServiceTools";

// Register agent tools
registerTool(
  {
    name: "get_current_time",
    category: "agent",
    description: "Get current date and time information",
    enabled: true,
  },
  TimeTools.getCurrentTime
);

registerTool(
  {
    name: "get_timezone_info",
    category: "agent",
    description: "Get detailed timezone information",
    enabled: true,
  },
  TimeTools.getTimezoneInfo
);

registerTool(
  {
    name: "get_current_location",
    category: "agent",
    description: "Get current location based on IP address",
    enabled: true,
  },
  LocationTools.getCurrentLocation
);

registerTool(
  {
    name: "get_weather_info",
    category: "agent",
    description: "Get weather information for current location",
    enabled: true,
  },
  LocationTools.getWeatherInfo
);

registerTool(
  {
    name: "generate_agent_name",
    category: "agent",
    description: "Generate agent name with specialist and style parameters",
    enabled: true,
  },
  async (args: Record<string, any>) => NamingTools.generateAgentName(args as { specialist: string; style: string })
);

registerTool(
  {
    name: "assign_agent_name",
    category: "agent",
    description: "Assign generated name to agent with persistence",
    enabled: true,
  },
  async (args: Record<string, any>) => NamingTools.assignAgentName(args as { agentId: string; name: string })
);

registerTool(
  {
    name: "get_agent_name",
    category: "agent",
    description: "Retrieve current agent name",
    enabled: true,
  },
  async (args: Record<string, any>) => NamingTools.getAgentName(args as { agentId: string })
);

registerTool(
  {
    name: "list_agent_names",
    category: "agent",
    description: "List all assigned agent names",
    enabled: true,
  },
  NamingTools.listAgentNames
);

registerTool(
  {
    name: "send_desktop_notification",
    category: "agent",
    description: "Send desktop notification using system notification service",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    NotificationTools.sendDesktopNotification(
      args as { title: string; message: string; icon?: string; sound?: boolean; timeout?: number }
    )
);

registerTool(
  {
    name: "send_system_alert",
    category: "agent",
    description: "Send system alert with sound and visual notification",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    NotificationTools.sendSystemAlert(
      args as { title: string; message: string; urgency?: "low" | "normal" | "critical" }
    )
);

// Register development tools
registerTool(
  {
    name: "lint_frontend",
    category: "development",
    description: "Run ESLint on frontend code with optional auto-fix",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    LintingTools.lintFrontend(args as { fix?: boolean; files?: string[]; config?: string })
);

registerTool(
  {
    name: "lint_python",
    category: "development",
    description: "Run Python linting with flake8 and pylint",
    enabled: true,
  },
  async (args: Record<string, any>) => LintingTools.lintPython(args as { files?: string[]; usePylint?: boolean })
);

registerTool(
  {
    name: "lint_markdown",
    category: "development",
    description: "Run markdownlint on markdown files",
    enabled: true,
  },
  async (args: Record<string, any>) => LintingTools.lintMarkdown(args as { files?: string[]; config?: string })
);

registerTool(
  {
    name: "format_frontend",
    category: "development",
    description: "Format frontend code with Prettier",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    FormattingTools.formatFrontend(args as { checkOnly?: boolean; files?: string[]; config?: string })
);

registerTool(
  {
    name: "format_python",
    category: "development",
    description: "Format Python code with Black and isort",
    enabled: true,
  },
  async (args: Record<string, any>) => FormattingTools.formatPython(args as { checkOnly?: boolean; files?: string[] })
);

// Register git tools
registerTool(
  {
    name: "git_status",
    category: "development",
    description: "Get git repository status",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.gitStatus(args as { cwd?: string; short?: boolean })
);

registerTool(
  {
    name: "git_get_current_branch",
    category: "development",
    description: "Get current git branch name",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.getCurrentBranch(args as { cwd?: string })
);

registerTool(
  {
    name: "git_check_remote_exists",
    category: "development",
    description: "Check if a git remote exists",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.checkRemoteExists(args as { remoteName: string; cwd?: string })
);

registerTool(
  {
    name: "git_get_remote_url",
    category: "development",
    description: "Get URL for a git remote",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.getRemoteUrl(args as { remoteName: string; cwd?: string })
);

registerTool(
  {
    name: "git_add_remote",
    category: "development",
    description: "Add or update a git remote",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    GitTools.addRemote(args as { remoteName: string; url: string; cwd?: string; force?: boolean })
);

registerTool(
  {
    name: "git_push",
    category: "development",
    description: "Push to a git remote",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    GitTools.push(args as { remoteName: string; branch?: string; tags?: boolean; mirror?: boolean; cwd?: string })
);

registerTool(
  {
    name: "git_list_remotes",
    category: "development",
    description: "List all git remotes",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.listRemotes(args as { cwd?: string })
);

registerTool(
  {
    name: "git_verify_repository",
    category: "development",
    description: "Verify git repository integrity",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.verifyRepository(args as { cwd?: string })
);

registerTool(
  {
    name: "git_get_latest_commit",
    category: "development",
    description: "Get latest commit hash",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.getLatestCommit(args as { cwd?: string; short?: boolean })
);

registerTool(
  {
    name: "git_analyze_uncommitted_changes",
    category: "development",
    description: "Analyze uncommitted git changes (staged and unstaged) with detailed categorization",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    GitTools.analyzeUncommittedChanges(args as { cwd?: string; includeStaged?: boolean; includeUnstaged?: boolean })
);

registerTool(
  {
    name: "git_generate_commit_message",
    category: "development",
    description: "Generate conventional commit message suggestions based on uncommitted changes",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    GitTools.generateCommitMessage(args as { cwd?: string; includeStaged?: boolean; includeUnstaged?: boolean })
);

registerTool(
  {
    name: "git_analyze_commit_message_quality",
    category: "development",
    description: "Analyze commit message quality and provide improvement suggestions",
    enabled: true,
  },
  async (args: Record<string, any>) => GitTools.analyzeCommitMessageQuality(args as { message: string })
);

// Register systemd service management tools
registerTool(
  {
    name: "start_service",
    category: "system",
    description: "Start a systemd service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.startService(args as { name: string })
);

registerTool(
  {
    name: "stop_service",
    category: "system",
    description: "Stop a systemd service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.stopService(args as { name: string })
);

registerTool(
  {
    name: "restart_service",
    category: "system",
    description: "Restart a systemd service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.restartService(args as { name: string })
);

registerTool(
  {
    name: "get_service_status",
    category: "system",
    description: "Get status and health information for a service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.getServiceStatus(args as { name: string })
);

registerTool(
  {
    name: "get_service_metrics",
    category: "system",
    description: "Get performance metrics for a service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.getServiceMetrics(args as { name: string })
);

registerTool(
  {
    name: "list_services",
    category: "system",
    description: "List all managed services",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.listServices(args as {})
);

registerTool(
  {
    name: "update_service",
    category: "system",
    description: "Perform rolling update of a service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.updateService(args as { name: string; definition: any })
);

registerTool(
  {
    name: "rollback_service",
    category: "system",
    description: "Rollback a service to previous version",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    ServiceTools.rollbackService(args as { name: string; oldVersion: string; newVersion: string })
);

registerTool(
  {
    name: "get_service_logs",
    category: "system",
    description: "Get logs for a service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.getServiceLogs(args as { name: string; lines?: number })
);

registerTool(
  {
    name: "export_metrics",
    category: "system",
    description: "Export Prometheus metrics for all services",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.exportMetrics(args as {})
);

registerTool(
  {
    name: "set_service_secret",
    category: "system",
    description: "Set a secret for a service",
    enabled: true,
  },
  async (args: Record<string, any>) =>
    ServiceTools.setSecret(args as { serviceName: string; secretName: string; value: string; encrypt?: boolean })
);

registerTool(
  {
    name: "get_service_secret",
    category: "system",
    description: "Get a secret for a service",
    enabled: true,
  },
  async (args: Record<string, any>) => ServiceTools.getSecret(args as { serviceName: string; secretName: string })
);
