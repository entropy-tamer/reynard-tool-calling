/**
 * @file Main Tools Index
 * 
 * Exports all native TypeScript tools that replace the Python MCP server.
 */

export * from './types';
export * from './registry';

// Import all tool categories
export * from './agent';
export * from './development';

// Tool facade for codemode integration
export async function buildToolsFacade() {
  return {
    agent: await import('./agent'),
    development: await import('./development'),
    // TODO: Add other categories as they are implemented
    // research: await import('./research'),
    // search: await import('./search'),
    // system: await import('./system'),
    // visualization: await import('./visualization'),
  };
}

// Get all registered tools
export function getAllTools() {
  const { getToolRegistry } = require('./registry');
  return getToolRegistry().listTools();
}

// Execute a tool by name
export async function executeTool(name: string, args: Record<string, any>) {
  const { getToolRegistry } = require('./registry');
  return getToolRegistry().executeTool(name, args);
}
