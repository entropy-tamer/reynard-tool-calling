/**
 * @file Topographic map visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a topographic map visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoTopographicMap(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 3: Topographic Map (Multi-Level Contours)\n");
  await cm.executeCode(`
    const size = 18;
    const centerX = size / 2;
    const centerY = size / 2;
    
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        const dx = (x - centerX) / size;
        const dy = (y - centerY) / size;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const height = Math.max(0, 1 - dist * 2);
        return height;
      })
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
      grid,
      options: {
        thresholds: [0.2, 0.4, 0.6, 0.8],
      },
    });
    
    let output = "Elevation Map (█ = high, ░ = low):\\n";
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const val = grid[y][x];
        const level = Math.floor(val * 4);
        const chars = [" ", "░", "▒", "▓", "█"];
        output += chars[level] + chars[level];
      }
      output += "\\n";
    }
    
    output += "\\nContour Levels:\\n";
    result.contoursByLevel.forEach((contours, threshold) => {
      const elevation = Math.round(threshold * 100);
      output += \`  Level \${elevation}%: \${contours.length} contours\\n\`;
    });
    
    output += "\\nTotal contours: " + result.stats.contourCount + "\\n";
    
    console.log(output);
  `);
}


