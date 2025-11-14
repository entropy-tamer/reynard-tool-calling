/**
 * @file Agent Tools Registration
 *
 * Registers all agent-related tools with the registry.
 */

import { TimeTools } from "../agent/time";
import { LocationTools } from "../agent/location";
import { NamingTools } from "../agent/naming";
import { NotificationTools } from "../agent/notifications";
import { registerToolCategory, createHandler } from "./utils";

/**
 * Register time-related agent tools
 *
 * @example
 * ```typescript
 * registerTimeTools();
 * // Registers get_current_time and get_timezone_info tools
 * ```
 */
function registerTimeTools(): void {
  registerToolCategory("agent", [
    {
      config: {
        name: "get_current_time",
        description: "Get current date and time information",
        enabled: true,
      },
      handler: createHandler(() => TimeTools.getCurrentTime()),
    },
    {
      config: {
        name: "get_timezone_info",
        description: "Get detailed timezone information",
        enabled: true,
      },
      handler: createHandler(() => TimeTools.getTimezoneInfo()),
    },
  ]);
}

/**
 * Register location-related agent tools
 *
 * @example
 * ```typescript
 * registerLocationTools();
 * // Registers get_current_location and get_weather_info tools
 * ```
 */
function registerLocationTools(): void {
  registerToolCategory("agent", [
    {
      config: {
        name: "get_current_location",
        description: "Get current location based on IP address",
        enabled: true,
      },
      handler: createHandler(() => LocationTools.getCurrentLocation()),
    },
    {
      config: {
        name: "get_weather_info",
        description: "Get weather information for current location",
        enabled: true,
      },
      handler: createHandler(() => LocationTools.getWeatherInfo()),
    },
  ]);
}

/**
 * Register naming-related agent tools
 *
 * @example
 * ```typescript
 * registerNamingTools();
 * // Registers generate_agent_name, assign_agent_name, get_agent_name, and list_agent_names tools
 * ```
 */
function registerNamingTools(): void {
  registerToolCategory("agent", [
    {
      config: {
        name: "generate_agent_name",
        description: "Generate agent name with specialist and style parameters",
        enabled: true,
      },
      handler: createHandler((args: { specialist: string; style: string }) => NamingTools.generateAgentName(args)),
    },
    {
      config: {
        name: "assign_agent_name",
        description: "Assign generated name to agent with persistence",
        enabled: true,
      },
      handler: createHandler((args: { agentId: string; name: string }) => NamingTools.assignAgentName(args)),
    },
    {
      config: {
        name: "get_agent_name",
        description: "Retrieve current agent name",
        enabled: true,
      },
      handler: createHandler((args: { agentId: string }) => NamingTools.getAgentName(args)),
    },
    {
      config: {
        name: "list_agent_names",
        description: "List all assigned agent names",
        enabled: true,
      },
      handler: createHandler(() => NamingTools.listAgentNames()),
    },
  ]);
}

/**
 * Register notification-related agent tools
 *
 * @example
 * ```typescript
 * registerNotificationTools();
 * // Registers send_desktop_notification and send_system_alert tools
 * ```
 */
function registerNotificationTools(): void {
  registerToolCategory("agent", [
    {
      config: {
        name: "send_desktop_notification",
        description: "Send desktop notification using system notification service",
        enabled: true,
      },
      handler: createHandler(
        (args: { title: string; message: string; icon?: string; sound?: boolean; timeout?: number }) =>
          NotificationTools.sendDesktopNotification(args)
      ),
    },
    {
      config: {
        name: "send_system_alert",
        description: "Send system alert with sound and visual notification",
        enabled: true,
      },
      handler: createHandler((args: { title: string; message: string; urgency?: "low" | "normal" | "critical" }) =>
        NotificationTools.sendSystemAlert(args)
      ),
    },
  ]);
}

/**
 * Register all agent tools
 *
 * @example
 * ```typescript
 * registerAgentTools();
 * // Registers all agent-related tools (time, location, naming, notifications)
 * ```
 */
export function registerAgentTools(): void {
  registerTimeTools();
  registerLocationTools();
  registerNamingTools();
  registerNotificationTools();
}
