/**
 * @file Systemd Tools Registration
 *
 * Registers all systemd service management tools with the registry.
 */

import { ServiceTools } from "../systemd/ServiceTools";
import { registerToolCategory, createHandler } from "./utils";

/**
 * Register all systemd service management tools
 */
export function registerSystemdTools(): void {
  registerToolCategory("system", [
    {
      config: {
        name: "start_service",
        description: "Start a systemd service",
        enabled: true,
      },
      handler: createHandler((args: { name: string }) => ServiceTools.startService(args)),
    },
    {
      config: {
        name: "stop_service",
        description: "Stop a systemd service",
        enabled: true,
      },
      handler: createHandler((args: { name: string }) => ServiceTools.stopService(args)),
    },
    {
      config: {
        name: "restart_service",
        description: "Restart a systemd service",
        enabled: true,
      },
      handler: createHandler((args: { name: string }) => ServiceTools.restartService(args)),
    },
    {
      config: {
        name: "get_service_status",
        description: "Get status and health information for a service",
        enabled: true,
      },
      handler: createHandler((args: { name: string }) => ServiceTools.getServiceStatus(args)),
    },
    {
      config: {
        name: "get_service_metrics",
        description: "Get performance metrics for a service",
        enabled: true,
      },
      handler: createHandler((args: { name: string }) => ServiceTools.getServiceMetrics(args)),
    },
    {
      config: {
        name: "list_services",
        description: "List all managed services",
        enabled: true,
      },
      handler: createHandler(() => ServiceTools.listServices({})),
    },
    {
      config: {
        name: "update_service",
        description: "Perform rolling update of a service",
        enabled: true,
      },
      handler: createHandler((args: { name: string; definition: any }) => ServiceTools.updateService(args)),
    },
    {
      config: {
        name: "rollback_service",
        description: "Rollback a service to previous version",
        enabled: true,
      },
      handler: createHandler((args: { name: string; oldVersion: string; newVersion: string }) =>
        ServiceTools.rollbackService(args)
      ),
    },
    {
      config: {
        name: "get_service_logs",
        description: "Get logs for a service",
        enabled: true,
      },
      handler: createHandler((args: { name: string; lines?: number }) => ServiceTools.getServiceLogs(args)),
    },
    {
      config: {
        name: "export_metrics",
        description: "Export Prometheus metrics for all services",
        enabled: true,
      },
      handler: createHandler(() => ServiceTools.exportMetrics({})),
    },
    {
      config: {
        name: "set_service_secret",
        description: "Set a secret for a service",
        enabled: true,
      },
      handler: createHandler((args: { serviceName: string; secretName: string; value: string; encrypt?: boolean }) =>
        ServiceTools.setSecret(args)
      ),
    },
    {
      config: {
        name: "get_service_secret",
        description: "Get a secret for a service",
        enabled: true,
      },
      handler: createHandler((args: { serviceName: string; secretName: string }) => ServiceTools.getSecret(args)),
    },
  ]);
}






