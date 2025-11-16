/**
 * @file Contour simplification visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a contour simplification visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoSimplification(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 7: Contour Simplification Visualization\n");
  await cm.executeCode(`
    const size = 16;
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.3;
        return 0.5 + noise;
      })
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.5,
    });
    
    if (result.contours.length > 0) {
      const original = result.contours[0];
      const simplified = await tools.algorithms.MarchingSquaresTools.simplifyContour({
        contour: original,
        options: {
          maxDistance: 0.15,
          preserveEndpoints: true,
        },
      });
      
      let output = "Simplification Comparison:\\n\\n";
      output += "Original: " + original.segments.length + " segments\\n";
      output += "Simplified: " + simplified.simplifiedContour.segments.length + " segments\\n";
      output += "Removed: " + simplified.segmentsRemoved + " segments\\n";
      output += "Compression: " + simplified.compressionRatio.toFixed(2) + "×\\n";
      
      output += "\\nVisualization:\\n";
      output += "  Original:  " + "█".repeat(Math.min(original.segments.length, 40));
      if (original.segments.length > 40) output += "...";
      output += "\\n";
      output += "  Simplified: " + "█".repeat(Math.min(simplified.simplifiedContour.segments.length, 40));
      if (simplified.simplifiedContour.segments.length > 40) output += "...";
      output += "\\n";
      
      console.log(output);
    }
  `);
}


