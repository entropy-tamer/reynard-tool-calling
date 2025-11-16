/**
 * @file Gradient pattern visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a gradient pattern visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoGradientPattern(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 2: Gradient Pattern with Contour Lines\n");
  await cm.executeCode(`
    const size = 20;
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => (x + y) / (size * 2))
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.5,
    });
    
    let output = "Gradient Grid (darker = higher value):\\n";
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const val = grid[y][x];
        const shade = Math.floor(val * 4);
        const chars = [" ", "░", "▒", "▓", "█"];
        output += chars[shade] + chars[shade];
      }
      output += "\\n";
    }
    
    output += "\\nContour at threshold 0.5: " + result.stats.contourCount + " contours\\n";
    output += "Total segments: " + result.stats.segmentCount + "\\n";
    
    console.log(output);
  `);
}


