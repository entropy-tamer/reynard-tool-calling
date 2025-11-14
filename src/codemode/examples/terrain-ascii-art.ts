/**
 * @file Terrain ASCII Art Generator - Comparison System
 * Compares different noise algorithms and multiscale configurations
 */

import { codemode } from "../codemode";

interface TerrainConfig {
  label: string;
  noiseType: "simplex" | "perlin";
  method: "single" | "multiscale";
  scales?: Array<{ frequency: number; amplitude: number; name?: string }>;
  combinationMode?: "additive" | "multiplicative" | "weighted" | "max" | "min";
  seed?: number;
}

interface TerrainResult {
  label: string;
  ascii: string[];
  stats: {
    width: number;
    height: number;
    waterCount: number;
    landCount: number;
    mountainCount: number;
    peakCount: number;
    totalCells: number;
  };
}

const WIDTH = 80;
const HEIGHT = 40;
/** Defines terrain generation configurations for comparison
 * @returns Array of terrain configurations to test */
function defineTerrainConfigs(): TerrainConfig[] {
  return [
    { label: "Simplex Single", noiseType: "simplex", method: "single", seed: 12345 },
    {
      label: "Simplex 2-Scale",
      noiseType: "simplex",
      method: "multiscale",
      scales: [
        { frequency: 0.02, amplitude: 1.0 },
        { frequency: 0.1, amplitude: 0.5 },
      ],
      combinationMode: "additive",
      seed: 12345,
    },
    {
      label: "Simplex 3-Scale",
      noiseType: "simplex",
      method: "multiscale",
      scales: [
        { frequency: 0.02, amplitude: 1.0 },
        { frequency: 0.1, amplitude: 2.0 },
        { frequency: 2.0, amplitude: 0.3 },
      ],
      combinationMode: "additive",
      seed: 12345,
    },
    {
      label: "Simplex 4-Scale",
      noiseType: "simplex",
      method: "multiscale",
      scales: [
        { frequency: 0.01, amplitude: 1.0 },
        { frequency: 0.05, amplitude: 1.5 },
        { frequency: 0.2, amplitude: 1.0 },
        { frequency: 1.0, amplitude: 0.2 },
      ],
      combinationMode: "additive",
      seed: 12345,
    },
    { label: "Perlin Single", noiseType: "perlin", method: "single", seed: 12345 },
    {
      label: "Perlin 2-Scale",
      noiseType: "perlin",
      method: "multiscale",
      scales: [
        { frequency: 0.02, amplitude: 1.0 },
        { frequency: 0.1, amplitude: 0.5 },
      ],
      combinationMode: "additive",
      seed: 12345,
    },
    {
      label: "Perlin Multiplicative",
      noiseType: "perlin",
      method: "multiscale",
      scales: [
        { frequency: 0.02, amplitude: 1.0 },
        { frequency: 0.1, amplitude: 0.5 },
      ],
      combinationMode: "multiplicative",
      seed: 12345,
    },
  ];
}

/**
 * Generates terrain heightmap using specified noise configuration
 * @param cm - Codemode execution context
 * @param config - Terrain generation configuration
 * @returns Promise resolving to terrain generation result
 */
async function generateTerrain(cm: Awaited<ReturnType<typeof codemode>>, config: TerrainConfig) {
  const noiseClass = config.noiseType === "simplex" ? "SimplexNoise" : "PerlinNoise";
  const seed = config.seed ?? Math.floor(Math.random() * 10000);
  const scalesJson = config.scales ? JSON.stringify(config.scales) : "[]";
  const comboMode = config.combinationMode || "additive";

  const code = `
    const { ${noiseClass} } = algorithms;
    const noise = new ${noiseClass}({ seed: ${seed} });
    
    const width = ${WIDTH};
    const height = ${HEIGHT};
    const heightmap = [];
    let minHeight = Infinity;
    let maxHeight = -Infinity;
    
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        let h;
        if ('${config.method}' === 'single') {
          h = noise.noise2D(x * 0.02, y * 0.02);
        } else {
          const result = noise.multiscaleNoise2D(x, y, {
            scales: ${scalesJson},
            combinationMode: '${comboMode}'
          });
          h = result.combined;
        }
        row.push(h);
        minHeight = Math.min(minHeight, h);
        maxHeight = Math.max(maxHeight, h);
      }
      heightmap.push(row);
    }
    
    const range = maxHeight - minHeight;
    const normalized = heightmap.map(row => 
      row.map(h => range > 0 ? (h - minHeight) / range : 0.5)
    );
    
    return { normalized, minHeight, maxHeight, range };
  `;
  return await cm.executeCode(code);
}
/** Converts normalized heightmap to ASCII art representation
 * @param normalized - Normalized heightmap (0-1 range)
 * @returns Array of ASCII art lines
 */
function convertToASCII(normalized: number[][]): string[] {
  const getChar = (h: number) => {
    if (h < 0.1) return " ";
    if (h < 0.2) return "~";
    if (h < 0.3) return ".";
    if (h < 0.4) return ":";
    if (h < 0.5) return ";";
    if (h < 0.6) return "i";
    if (h < 0.7) return "I";
    if (h < 0.85) return "▲";
    return "█";
  };
  return normalized.map(row => row.map(getChar).join(""));
}
/** Calculates terrain statistics from normalized heightmap
 * @param normalized - Normalized heightmap (0-1 range)
 * @returns Terrain statistics object
 */
function calculateStats(normalized: number[][]): TerrainResult["stats"] {
  const flat = normalized.flat();
  return {
    width: WIDTH,
    height: HEIGHT,
    waterCount: flat.filter(h => h < 0.2).length,
    landCount: flat.filter(h => h >= 0.2 && h < 0.6).length,
    mountainCount: flat.filter(h => h >= 0.6).length,
    peakCount: flat.filter(h => h >= 0.85).length,
    totalCells: WIDTH * HEIGHT,
  };
}

/**
 * Displays terrain comparison results with statistics
 * @param results - Array of terrain results to display
 */
function printComparison(results: TerrainResult[]) {
  console.log(
    "🗺️  Terrain Comparison\nLegend: ' '=Deep Water, ~=Water, .=Sand, :=Grass, ;=Dense, i=I, I=High, ▲=Peaks, █=Summit\n"
  );
  results.forEach((r, i) => {
    const total = r.stats.totalCells;
    console.log(`\n${"─".repeat(82)}\n${i + 1}. ${r.label}`);
    console.log(
      `   Water: ${r.stats.waterCount} (${((r.stats.waterCount / total) * 100).toFixed(1)}%) | ` +
        `Land: ${r.stats.landCount} (${((r.stats.landCount / total) * 100).toFixed(1)}%) | ` +
        `Mountains: ${r.stats.mountainCount} (${((r.stats.mountainCount / total) * 100).toFixed(1)}%) | ` +
        `Peaks: ${r.stats.peakCount} (${((r.stats.peakCount / total) * 100).toFixed(1)}%)`
    );
    r.ascii.forEach(line => console.log(line));
  });
  console.log("─".repeat(82) + "\n✨ Comparison complete!");
}

/** Main function that orchestrates terrain comparison */
async function compareTerrains() {
  const cm = await codemode({ projectRoot: process.cwd() });
  try {
    const results: TerrainResult[] = [];
    for (const config of defineTerrainConfigs()) {
      const t = await generateTerrain(cm, config);
      if (!t || !t.returned || !t.returned.normalized) {
        console.error(`❌ Failed to generate terrain for: ${config.label}`);
        console.error("Result:", JSON.stringify(t, null, 2));
        continue;
      }
      results.push({
        label: config.label,
        ascii: convertToASCII(t.returned.normalized),
        stats: calculateStats(t.returned.normalized),
      });
    }
    if (results.length === 0) {
      throw new Error("No terrain configurations succeeded");
    }
    printComparison(results);
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}
compareTerrains().catch(console.error);
