/**
 * @file Performance comparison visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a performance comparison visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoPerformance(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 8: Performance Comparison (ASCII Chart)\n");
  await cm.executeCode(`
    const gridSizes = [10, 20, 30, 40];
    const results = [];
    
    for (const size of gridSizes) {
      const grid = Array(size).fill(null).map(() =>
        Array(size).fill(0).map(() => Math.random())
      );
      
      const start = performance.now();
      const result = await tools.algorithms.MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });
      const time = performance.now() - start;
      
      results.push({ size, time, contours: result.stats.contourCount });
    }
    
    let output = "Performance by Grid Size:\\n\\n";
    output += "Grid Size | Time (ms) | Contours | Performance Bar\\n";
    output += "----------|-----------|----------|" + "-".repeat(30) + "\\n";
    
    const maxTime = Math.max(...results.map(r => r.time));
    
    for (const r of results) {
      const barLength = Math.round((r.time / maxTime) * 30);
      const bar = "█".repeat(barLength);
      output += \`  \${r.size}×\${r.size}   | \${r.time.toFixed(2).padStart(7)} | \${String(r.contours).padStart(8)} | \${bar}\\n\`;
    }
    
    output += "\\n";
    output += "Note: Performance scales approximately with grid area\\n";
    
    console.log(output);
  `);
}


