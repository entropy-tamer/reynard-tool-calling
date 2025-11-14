/**
 * @file Island generation visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs an island generation visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoIslandGeneration(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 4: Island Generation with Coastline\n");
  await cm.executeCode(`
    const size = 25;
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size * 0.4;
    
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const normalizedDist = dist / maxRadius;
        const height = Math.max(0, 1 - normalizedDist);
        return Math.min(1, height);
      })
    );
    
    const coastline = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.3,
    });
    
    const elevation = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.6,
    });
    
    let output = "Island Map:\\n";
    output += "  ~ = Water, ░ = Low land, ▒ = Medium, ▓ = High, █ = Peak\\n\\n";
    
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const val = grid[y][x];
        if (val < 0.3) {
          output += "~~";
        } else if (val < 0.5) {
          output += "░░";
        } else if (val < 0.7) {
          output += "▒▒";
        } else if (val < 0.9) {
          output += "▓▓";
        } else {
          output += "██";
        }
      }
      output += "\\n";
    }
    
    output += "\\nCoastline contours: " + coastline.stats.contourCount + "\\n";
    output += "Elevation contours (60%): " + elevation.stats.contourCount + "\\n";
    
    console.log(output);
  `);
}

