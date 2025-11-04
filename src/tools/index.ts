/**
 * @file Main Tools Index
 *
 * Exports all native TypeScript tools that replace the Python MCP server.
 */

export * from "./types";
export * from "./registry";

// Import all tool categories
export * from "./agent";
export * from "./development";

// Register all tools
import "./register-tools";

// Tool facade for codemode integration
export async function buildToolsFacade() {
  return {
    agent: await import("./agent"),
    development: await import("./development"),
    // TODO: Add other categories as they are implemented
    // research: await import('./research'),
    // search: await import('./search'),
    // system: await import('./system'),
    // visualization: await import('./visualization'),
  };
}

// Get all registered tools
export async function getAllTools() {
  try {
    const { getToolRegistry } = await import("./registry");
    return getToolRegistry().listTools();
  } catch (error) {
    return [];
  }
}

// Execute a tool by name
export async function executeTool(name: string, args: Record<string, any>) {
  try {
    const { getToolRegistry } = await import("./registry");
    return getToolRegistry().executeTool(name, args);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tool execution failed",
    };
  }
}
