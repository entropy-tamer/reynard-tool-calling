/**
 * @file Systemd Service Management Tools
 *
 * Native TypeScript implementation of systemd service management tools.
 * These tools allow agents to interact with services via systemd.
 */

import { ToolResult } from "../types.js";

// Lazy import to avoid circular dependencies
let SystemdServiceManager: any;
let SystemdClient: any;
let RollingUpdateManager: any;
let MetricsCollector: any;
let SecretsManager: any;

async function getServiceManager() {
  if (!SystemdServiceManager) {
    const module = await import("@entropy-tamer/reynard-service-manager/systemd");
    SystemdServiceManager = module.SystemdServiceManager;
    SystemdClient = module.SystemdClient;
    RollingUpdateManager = module.RollingUpdateManager;
    MetricsCollector = module.MetricsCollector;
    SecretsManager = module.SecretsManager;
  }
  return { SystemdServiceManager, SystemdClient, RollingUpdateManager, MetricsCollector, SecretsManager };
}

/**
 * Systemd service management tools
 */
export class ServiceTools {
  /**
   * Start a service
   */
  static async startService(args: { name: string }): Promise<ToolResult> {
    try {
      const { name } = args;
      const { SystemdServiceManager } = await getServiceManager();

      // Create manager instance (singleton pattern would be better in production)
      const manager = new SystemdServiceManager();
      await manager.startService(name);

      return {
        success: true,
        data: { name, status: "started" },
        logs: [`Service '${name}' started successfully`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to start service",
      };
    }
  }

  /**
   * Stop a service
   */
  static async stopService(args: { name: string }): Promise<ToolResult> {
    try {
      const { name } = args;
      const { SystemdServiceManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      await manager.stopService(name);

      return {
        success: true,
        data: { name, status: "stopped" },
        logs: [`Service '${name}' stopped successfully`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to stop service",
      };
    }
  }

  /**
   * Restart a service
   */
  static async restartService(args: { name: string }): Promise<ToolResult> {
    try {
      const { name } = args;
      const { SystemdServiceManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      await manager.restartService(name);

      return {
        success: true,
        data: { name, status: "restarted" },
        logs: [`Service '${name}' restarted successfully`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to restart service",
      };
    }
  }

  /**
   * Get service status
   */
  static async getServiceStatus(args: { name: string }): Promise<ToolResult> {
    try {
      const { name } = args;
      const { SystemdServiceManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      const info = await manager.getServiceInfo(name);

      if (!info) {
        return {
          success: false,
          error: `Service '${name}' not found`,
        };
      }

      return {
        success: true,
        data: info,
        logs: [`Service '${name}' status: ${info.status}, health: ${info.health}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get service status",
      };
    }
  }

  /**
   * Get service metrics
   */
  static async getServiceMetrics(args: { name: string }): Promise<ToolResult> {
    try {
      const { name } = args;
      const { SystemdClient, MetricsCollector } = await getServiceManager();

      const client = new SystemdClient();
      const collector = new MetricsCollector(client);
      const metrics = await collector.collectServiceMetrics(name);

      return {
        success: true,
        data: metrics,
        logs: [`Collected metrics for service '${name}'`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get service metrics",
      };
    }
  }

  /**
   * List all services
   */
  static async listServices(args: {}): Promise<ToolResult> {
    try {
      const { SystemdServiceManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      const allInfo = await manager.getAllServiceInfo();

      const services = Object.keys(allInfo).map((name) => ({
        name,
        status: allInfo[name].status,
        health: allInfo[name].health,
      }));

      return {
        success: true,
        data: { services, count: services.length },
        logs: [`Found ${services.length} services`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list services",
      };
    }
  }

  /**
   * Update a service (rolling update)
   */
  static async updateService(args: { name: string; definition: any }): Promise<ToolResult> {
    try {
      const { name, definition } = args;
      const { SystemdServiceManager, RollingUpdateManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      const updateManager = new RollingUpdateManager(manager);

      const result = await updateManager.performRollingUpdate({
        serviceName: name,
        newDefinition: definition,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || "Rolling update failed",
          data: result,
        };
      }

      return {
        success: true,
        data: result,
        logs: [`Service '${name}' updated successfully. New version: ${result.newVersion}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update service",
      };
    }
  }

  /**
   * Rollback a service to previous version
   */
  static async rollbackService(args: { name: string; oldVersion: string; newVersion: string }): Promise<ToolResult> {
    try {
      const { name, oldVersion, newVersion } = args;
      const { SystemdServiceManager, RollingUpdateManager } = await getServiceManager();

      const manager = new SystemdServiceManager();
      const updateManager = new RollingUpdateManager(manager);

      await updateManager.rollback(name, oldVersion, newVersion);

      return {
        success: true,
        data: { name, oldVersion, newVersion, rolledBack: true },
        logs: [`Service '${name}' rolled back to version ${oldVersion}`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to rollback service",
      };
    }
  }

  /**
   * Get service logs
   */
  static async getServiceLogs(args: { name: string; lines?: number }): Promise<ToolResult> {
    try {
      const { name, lines = 100 } = args;
      const { SystemdClient } = await getServiceManager();

      const client = new SystemdClient();
      const logs = await client.getLogs(name, lines);

      return {
        success: true,
        data: { name, logs: logs.split("\n") },
        logs: [`Retrieved ${lines} lines of logs for service '${name}'`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get service logs",
      };
    }
  }

  /**
   * Export Prometheus metrics
   */
  static async exportMetrics(args: {}): Promise<ToolResult> {
    try {
      const { SystemdClient, MetricsCollector } = await getServiceManager();

      const client = new SystemdClient();
      const collector = new MetricsCollector(client);
      const prometheusMetrics = await collector.exportPrometheusMetrics();

      return {
        success: true,
        data: prometheusMetrics,
        logs: ["Exported Prometheus metrics"],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export metrics",
      };
    }
  }

  /**
   * Set a secret for a service
   */
  static async setSecret(args: { serviceName: string; secretName: string; value: string; encrypt?: boolean }): Promise<ToolResult> {
    try {
      const { serviceName, secretName, value, encrypt = true } = args;
      const { SecretsManager } = await getServiceManager();

      const secretsManager = new SecretsManager();
      const secretPath = await secretsManager.setSecret(serviceName, secretName, value, encrypt);

      return {
        success: true,
        data: { serviceName, secretName, path: secretPath },
        logs: [`Secret '${secretName}' set for service '${serviceName}'`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to set secret",
      };
    }
  }

  /**
   * Get a secret for a service
   */
  static async getSecret(args: { serviceName: string; secretName: string }): Promise<ToolResult> {
    try {
      const { serviceName, secretName } = args;
      const { SecretsManager } = await getServiceManager();

      const secretsManager = new SecretsManager();
      const value = await secretsManager.getSecret(serviceName, secretName);

      if (!value) {
        return {
          success: false,
          error: `Secret '${secretName}' not found for service '${serviceName}'`,
        };
      }

      return {
        success: true,
        data: { serviceName, secretName, value },
        logs: [`Retrieved secret '${secretName}' for service '${serviceName}'`],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get secret",
      };
    }
  }
}






