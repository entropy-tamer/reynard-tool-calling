/**
 * @file Marching Squares Visual Console Demo
 *
 * Creates ASCII art visualizations of marching squares results using codemode.
 *
 * @example
 * ```bash
 * pnpm tsx src/codemode/examples/marching-squares-visual-demo.ts
 * ```
 */

import { codemode } from "../codemode.js";
import { demoCirclePattern } from "./marching-squares-visual-demos/demo-circle.js";
import { demoGradientPattern } from "./marching-squares-visual-demos/demo-gradient.js";
import { demoTopographicMap } from "./marching-squares-visual-demos/demo-topographic.js";
import { demoIslandGeneration } from "./marching-squares-visual-demos/demo-island.js";
import { demoHeatMap } from "./marching-squares-visual-demos/demo-heatmap.js";
import { demoWavePattern } from "./marching-squares-visual-demos/demo-wave.js";
import { demoSimplification } from "./marching-squares-visual-demos/demo-simplification.js";
import { demoPerformance } from "./marching-squares-visual-demos/demo-performance.js";

/**
 * Main function that runs all visual demonstrations.
 *
 * @example
 * ```typescript
 * await main();
 * ```
 */
async function main(): Promise<void> {
  console.log("🦊 Marching Squares Visual Console Demo\n");
  console.log("=".repeat(60) + "\n");

  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    await demoCirclePattern(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoGradientPattern(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoTopographicMap(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoIslandGeneration(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoHeatMap(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoWavePattern(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoSimplification(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    await demoPerformance(cm);
    console.log("\n" + "=".repeat(60) + "\n");

    console.log("✅ All visual demonstrations completed!\n");
    console.log("These examples show practical uses of marching squares:");
    console.log("  • Terrain/island generation");
    console.log("  • Heat map visualization");
    console.log("  • Topographic mapping");
    console.log("  • Scientific data analysis");
    console.log("  • Contour simplification");
    console.log("  • Performance profiling\n");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    cm.cleanup();
  }
}

main().catch(console.error);
