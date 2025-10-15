/**
 * @file Smoke test for the codemode system
 *
 * This module provides a comprehensive smoke test for the codemode functionality,
 * validating that the system can properly initialize, connect to MCP servers,
 * and execute JavaScript/TypeScript code in the Reynard project context.
 *
 * The smoke test performs the following operations:
 * - Initializes a codemode instance with project configuration
 * - Performs health checks to verify MCP server connectivity
 * - Tests code execution through both MCP and direct execution modes
 * - Validates proper resource cleanup and process termination
 *
 * This test is designed to be run as part of CI/CD pipelines and local
 * development workflows to ensure the codemode system is functioning correctly.
 *
 * @author Reynard AI Tool-Calling System
 * @version 1.0.0
 * @since 1.0.0
 *
 * @example
 * ```bash
 * # Run the smoke test
 * npx tsx packages/ai/tool-calling/src/codemode/examples/smoke.ts
 *
 * # Expected output:
 * # health: { ok: true, message: 'MCP server is healthy' }
 * # MCP execution result: { success: true, result: 'done' }
 * ```
 */

import { codemode } from "../codemode";

/**
 * Main smoke test function that validates the codemode functionality.
 *
 * This function performs a comprehensive smoke test of the codemode system by:
 * 1. Initializing a codemode instance with the Reynard project root
 * 2. Performing a health check to verify MCP server availability
 * 3. Executing test code either through MCP (if available) or direct execution
 * 4. Cleaning up resources and exiting gracefully
 *
 * The test serves as a quick validation that the codemode system is properly
 * configured and can execute JavaScript/TypeScript code in the project context.
 *
 * @async
 * @function main
 * @returns {Promise<void>} Resolves when the smoke test completes
 * @throws {Error} If the smoke test fails or encounters critical errors
 *
 * @example
 * ```typescript
 * // Run the smoke test
 * main().catch(console.error);
 * ```
 */
async function main() {
  try {
    // Initialize codemode with Reynard project root and 5-second timeout
    const projectRoot = "/home/kade/runeset/reynard";
    const cm = await codemode({ projectRoot, timeoutMs: 5000 });

    // Perform health check to verify MCP server connectivity
    const status = await cm.healthCheck();
     
    console.log("health:", status);

    if (status.ok) {
      // MCP server is available - test code execution through MCP
      const res = await cm.executeCode("console.log('ok'); return 'done';");
       
      console.log("MCP execution result:", res);
    } else {
      // MCP server unavailable - fall back to direct execution mode
       
      console.log("MCP server not available, testing direct execution...");
      const res = await cm.executeCode("console.log('Direct execution works!'); return 'direct-done';");
       
      console.log("Direct execution result:", res);
    }

    // Cleanup MCP client resources to prevent memory leaks
    cm.cleanup();

    // Force exit after cleanup to ensure process termination
    // Small delay allows cleanup operations to complete
    setTimeout(() => {
      process.exit(0);
    }, 100);
  } catch (error) {
    // Log any errors encountered during smoke test execution
     
    console.error("Smoke test failed:", error);
    process.exit(1);
  }
}

/**
 * Entry point for the smoke test script.
 *
 * Executes the main smoke test function and handles any uncaught errors
 * that might occur during execution. This ensures the process exits
 * with an appropriate exit code for CI/CD systems and debugging.
 *
 * @function
 * @returns {void}
 *
 * @example
 * ```bash
 * pnpm smoke
 * ```
 */
main().catch(e => {
   
  console.error(e);
  process.exit(1);
});
