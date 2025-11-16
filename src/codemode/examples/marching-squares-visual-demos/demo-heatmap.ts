/**
 * @file Heat map visualization demo.
 */

import type { Awaited } from "type-fest";

type CodemodeInstance = Awaited<ReturnType<typeof import("../codemode.js").codemode>>;

/**
 * Runs a heat map visualization demo.
 *
 * @param cm - The codemode instance to use for execution.
 */
export async function demoHeatMap(cm: CodemodeInstance): Promise<void> {
  console.log("📊 Demo 5: Heat Map with Temperature Zones\n");
  await cm.executeCode(`
    const size = 22;
    const hotSpots = [
      { x: 5, y: 5, intensity: 0.95 },
      { x: 17, y: 17, intensity: 0.85 },
      { x: 11, y: 15, intensity: 0.75 },
    ];
    
    const grid = Array(size).fill(null).map((_, y) =>
      Array(size).fill(null).map((_, x) => {
        let temp = 0.2;
        
        for (const spot of hotSpots) {
          const dx = x - spot.x;
          const dy = y - spot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influence = spot.intensity * Math.exp(-dist / 6);
          temp = Math.max(temp, influence);
        }
        
        return Math.min(1, temp);
      })
    );
    
    const result = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
      grid,
      options: {
        thresholds: [0.3, 0.5, 0.7, 0.9],
      },
    });
    
    let output = "Heat Map (colder → hotter):\\n";
    output += "  ░ = Cold, ▒ = Warm, ▓ = Hot, █ = Very Hot\\n\\n";
    
    for (let y = 0; y < size; y++) {
      output += "  ";
      for (let x = 0; x < size; x++) {
        const temp = grid[y][x];
        if (temp < 0.3) {
          output += "░░";
        } else if (temp < 0.5) {
          output += "▒▒";
        } else if (temp < 0.7) {
          output += "▓▓";
        } else if (temp < 0.9) {
          output += "██";
        } else {
          output += "🔥";
        }
      }
      output += "\\n";
    }
    
    output += "\\nTemperature Zones:\\n";
    result.contoursByLevel.forEach((contours, threshold) => {
      const temp = Math.round(threshold * 100);
      output += \`  \${temp}°C zone: \${contours.length} contours\\n\`;
    });
    
    console.log(output);
  `);
}


