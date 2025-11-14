/**
 * @file Circle pattern visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a circle pattern visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoCirclePattern(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 1: Circle Pattern Visualization\n");
  await cm.executeCode(`
    const size = 15;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < radius ? 1 : 0;
      })
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.5,
    });
    
    let output = "Grid Values:\\n";
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const val = grid[y][x];
        output += val > 0.5 ? "██" : "░░";
      }
      output += "\\n";
    }
    
    output += "\\nContours: " + result.stats.contourCount + "\\n";
    output += "Segments: " + result.stats.segmentCount + "\\n";
    
    console.log(output);
  `);
}

