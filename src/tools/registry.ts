/**
 * @file Tool Registry System
 *
 * Implements the core tool registration and management system
 * that replaces the Python MCP server tool registry.
 */

import { ToolMetadata, ToolRegistry, ToolHandler, ToolResult } from "./types";

export class NativeToolRegistry implements ToolRegistry {
  private tools: Map<string, ToolMetadata> = new Map();
  private categories: Map<string, Set<string>> = new Map();

  registerTool(metadata: ToolMetadata): void {
    this.tools.set(metadata.name, metadata);

    if (!this.categories.has(metadata.category)) {
      this.categories.set(metadata.category, new Set());
    }
    this.categories.get(metadata.category)!.add(metadata.name);
  }

  getTool(name: string): ToolMetadata | undefined {
    return this.tools.get(name);
  }

  listTools(): ToolMetadata[] {
    return Array.from(this.tools.values());
  }

  listToolsByCategory(category: string): ToolMetadata[] {
    const toolNames = this.categories.get(category);
    if (!toolNames) return [];

    return Array.from(toolNames)
      .map(name => this.tools.get(name))
      .filter((tool): tool is ToolMetadata => tool !== undefined);
  }

  isToolEnabled(name: string): boolean {
    const tool = this.tools.get(name);
    return tool ? tool.enabled : false;
  }

  enableTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = true;
      return true;
    }
    return false;
  }

  disableTool(name: string): boolean {
    const tool = this.tools.get(name);
    if (tool) {
      tool.enabled = false;
      return true;
    }
    return false;
  }

  async executeTool(name: string, args: Record<string, any>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${name}' not found`,
      };
    }

    if (!tool.enabled) {
      return {
        success: false,
        error: `Tool '${name}' is disabled`,
      };
    }

    try {
      return await tool.handler(args);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Global registry instance
let globalRegistry: NativeToolRegistry | null = null;

export function getToolRegistry(): NativeToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new NativeToolRegistry();
  }
  return globalRegistry;
}

// Tool registration function (simplified without decorators)
export function registerTool(
  config: {
    name: string;
    category: string;
    description: string;
    enabled?: boolean;
    dependencies?: string[];
    config?: Record<string, any>;
  },
  handler: ToolHandler
) {
  const metadata: ToolMetadata = {
    name: config.name,
    category: config.category,
    description: config.description,
    enabled: config.enabled ?? true,
    dependencies: config.dependencies ?? [],
    config: config.config ?? {},
    handler,
  };

  getToolRegistry().registerTool(metadata);
}
