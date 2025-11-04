/**
 * @file Tool system types and interfaces
 *
 * Defines the core interfaces for the native TypeScript tool system
 * that replaces the Python MCP server architecture.
 */

export interface ToolMetadata {
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  config: Record<string, any>;
  handler: ToolHandler;
}

export interface ToolHandler {
  (args: Record<string, any>): Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  logs?: string[];
}

export interface ToolRegistry {
  registerTool(metadata: ToolMetadata): void;
  getTool(name: string): ToolMetadata | undefined;
  listTools(): ToolMetadata[];
  listToolsByCategory(category: string): ToolMetadata[];
  isToolEnabled(name: string): boolean;
  enableTool(name: string): boolean;
  disableTool(name: string): boolean;
}

export interface ToolExecutionContext {
  projectRoot: string;
  timeoutMs?: number;
  environment?: Record<string, string>;
}

export type ToolCategory = "agent" | "development" | "research" | "search" | "system" | "visualization" | "social";

export interface ToolConfig {
  name: string;
  category: ToolCategory;
  description: string;
  enabled?: boolean;
  dependencies?: string[];
  config?: Record<string, any>;
}
