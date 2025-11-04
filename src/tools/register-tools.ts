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
