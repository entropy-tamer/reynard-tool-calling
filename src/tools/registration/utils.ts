/**
 * @file Registration Utilities
 *
 * Helper functions for tool registration to reduce repetition
 * and provide consistent registration patterns.
 */

import { registerTool } from "../registry";
import { ToolHandler } from "../types";

/**
 * Tool registration configuration
 */
export interface ToolRegistrationConfig {
  name: string;
  category?: string; // Optional because it's set by registerToolCategory
  description: string;
  enabled?: boolean;
  dependencies?: string[];
  config?: Record<string, any>;
}

/**
 * Register a tool with type-safe handler
 */
export function registerToolHandler(config: ToolRegistrationConfig, handler: ToolHandler): void {
  if (!config.category) {
    throw new Error(`Tool ${config.name} must have a category`);
  }
  const toolConfig: {
    name: string;
    category: string;
    description: string;
    enabled?: boolean;
    dependencies?: string[];
    config?: Record<string, any>;
  } = {
    name: config.name,
    category: config.category,
    description: config.description,
  };
  if (config.enabled !== undefined) {
    toolConfig.enabled = config.enabled;
  }
  if (config.dependencies !== undefined) {
    toolConfig.dependencies = config.dependencies;
  }
  if (config.config !== undefined) {
    toolConfig.config = config.config;
  }
  registerTool(toolConfig, handler);
}

/**
 * Register multiple tools from a category
 */
export function registerToolCategory(
  category: string,
  tools: Array<{ config: ToolRegistrationConfig; handler: ToolHandler }>
): void {
  for (const { config: toolConfig, handler } of tools) {
    registerToolHandler(
      {
        ...toolConfig,
        category,
      },
      handler
    );
  }
}

/**
 * Create a typed handler wrapper for tool methods
 */
export function createHandler<T extends Record<string, any>>(method: (args: T) => Promise<any>): ToolHandler {
  return async (args: Record<string, any>) => {
    return method(args as T);
  };
}
