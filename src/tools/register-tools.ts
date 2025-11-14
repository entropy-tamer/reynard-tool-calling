/**
 * @file Tool Registration
 *
 * Registers all native tools with the registry using modular category-specific registration.
 * This file serves as the central entry point for tool registration.
 */

import { registerAgentTools } from "./registration/agent";
import { registerDevelopmentTools } from "./registration/development";
import { registerSystemdTools } from "./registration/systemd";
import { registerAlgorithmTools } from "./registration/algorithms";

/**
 * Register all tools across all categories
 * This function is called automatically when the tools module is imported
 */
export function registerAllTools(): void {
  registerAgentTools();
  registerDevelopmentTools();
  registerSystemdTools();
  registerAlgorithmTools();
}

// Auto-register all tools on module load
registerAllTools();
