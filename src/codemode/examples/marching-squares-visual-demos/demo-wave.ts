/**
 * @file Wave pattern analysis demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a wave pattern analysis demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoWavePattern(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 6: Wave Pattern Contour Analysis\n");
  await cm.executeCode(`
    const size = 20;
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        const wave1 = Math.sin(x * 0.4) * 0.3;
        const wave2 = Math.cos(y * 0.4) * 0.3;
        const wave3 = Math.sin((x + y) * 0.3) * 0.2;
        return 0.5 + wave1 + wave2 + wave3;
      })
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.compute({
      grid,
      threshold: 0.5,
    });
    
    let output = "Wave Pattern (above/below threshold):\\n";
    output += "  █ = Above threshold, ░ = Below threshold\\n\\n";
    
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const val = grid[y][x];
        output += val > 0.5 ? "██" : "░░";
      }
      output += "\\n";
    }
    
    output += "\\nContours at threshold 0.5: " + result.stats.contourCount + "\\n";
    output += "Total segments: " + result.stats.segmentCount + "\\n";
    
    if (result.contours.length > 0) {
      let largest = result.contours[0];
      let maxLength = 0;
      
      for (const contour of result.contours) {
        const analysis = await tools.algorithms.MarchingSquaresTools.analyzeContour({
          contour,
          options: { computeLengths: true },
        });
        
        if (analysis.length > maxLength) {
          maxLength = analysis.length;
          largest = contour;
        }
      }
      
      const fullAnalysis = await tools.algorithms.MarchingSquaresTools.analyzeContour({
        contour: largest,
        options: {
          computeLengths: true,
          computeAreas: true,
          computeCentroids: true,
        },
      });
      
      output += "\\nLargest Contour Analysis:\\n";
      output += "  Length: " + fullAnalysis.length.toFixed(2) + " units\\n";
      if (fullAnalysis.area !== undefined) {
        output += "  Area: " + fullAnalysis.area.toFixed(2) + " square units\\n";
      }
      output += "  Centroid: (" + fullAnalysis.centroid.x.toFixed(1) + ", " + fullAnalysis.centroid.y.toFixed(1) + ")\\n";
    }
    
    console.log(output);
  `);
}

