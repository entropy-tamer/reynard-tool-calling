/**
 * @file Multiscale Noise Generation Demo
 * Demonstrates multiscale noise generation in codemode
 */

import { codemode } from "../codemode";

async function main() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("🎨 Testing Multiscale Noise Generation in Codemode\n");

    // Test Perlin multiscale noise
    console.log("📊 Testing Perlin Multiscale Noise...");
    const perlinResult = await cm.executeCode(`
      const { PerlinNoise } = algorithms;
      
      const noise = new PerlinNoise({ seed: 12345 });
      const options = {
        scales: [
          { frequency: 0.02, amplitude: 1.0, name: "base" },
          { frequency: 0.1, amplitude: 2.0, name: "large_features" },
          { frequency: 2.0, amplitude: 0.3, name: "small_details" },
        ],
        combinationMode: "additive",
      };

      const result = noise.multiscaleNoise2D(50, 50, options);
      
      return {
        combined: result.combined,
        base: result.scales.get("base"),
        largeFeatures: result.scales.get("large_features"),
        smallDetails: result.scales.get("small_details"),
        scaleCount: result.scales.size,
      };
    `);

    console.log("✅ Perlin Multiscale Result:", JSON.stringify(perlinResult.returned, null, 2));

    // Test Simplex multiscale noise
    console.log("\n📊 Testing Simplex Multiscale Noise...");
    const simplexResult = await cm.executeCode(`
      const { SimplexNoise } = algorithms;
      
      const noise = new SimplexNoise({ seed: 12345 });
      const options = {
        scales: [
          { frequency: 0.02, amplitude: 1.0, name: "terrain" },
          { frequency: 0.05, amplitude: 0.5, name: "features" },
        ],
        combinationMode: "additive",
      };

      const result = noise.multiscaleNoise2D(10, 20, options);
      
      return {
        combined: result.combined,
        terrain: result.scales.get("terrain"),
        features: result.scales.get("features"),
        scaleCount: result.scales.size,
      };
    `);

    console.log("✅ Simplex Multiscale Result:", JSON.stringify(simplexResult.returned, null, 2));

    // Test all combination modes
    console.log("\n🔄 Testing All Combination Modes...");
    const modesResult = await cm.executeCode(`
      const { SimplexNoise } = algorithms;
      
      const noise = new SimplexNoise({ seed: 12345 });
      const scales = [
        { frequency: 0.01, amplitude: 1.0 },
        { frequency: 0.05, amplitude: 0.5 },
      ];

      const modes = ["additive", "multiplicative", "weighted", "max", "min"];
      const results = {};

      for (const mode of modes) {
        const result = noise.multiscaleNoise2D(10, 20, {
          scales,
          combinationMode: mode,
        });
        results[mode] = result.combined;
      }

      return results;
    `);

    console.log("✅ Combination Modes Results:", JSON.stringify(modesResult.returned, null, 2));

    // Test terrain generation pattern
    console.log("\n🏔️ Testing Terrain Generation Pattern...");
    const terrainResult = await cm.executeCode(`
      const { SimplexNoise } = algorithms;
      
      const noise = new SimplexNoise({ seed: 12345 });
      
      // Generate height map for a small terrain
      const size = 10;
      const heights = [];
      
      for (let x = 0; x < size; x++) {
        for (let z = 0; z < size; z++) {
          const result = noise.multiscaleNoise2D(x, z, {
            scales: [
              { frequency: 0.02, amplitude: 1.0, name: "base" },
              { frequency: 0.1, amplitude: 2.0, name: "features" },
              { frequency: 2.0, amplitude: 0.3, name: "details" },
            ],
            combinationMode: "additive",
          });
          heights.push({
            x,
            z,
            height: result.combined,
            base: result.scales.get("base"),
            features: result.scales.get("features"),
            details: result.scales.get("details"),
          });
        }
      }

      return {
        sampleCount: heights.length,
        sample: heights[0],
        minHeight: Math.min(...heights.map(h => h.height)),
        maxHeight: Math.max(...heights.map(h => h.height)),
      };
    `);

    console.log("✅ Terrain Generation Result:", JSON.stringify(terrainResult.returned, null, 2));

    console.log("\n✅ All multiscale noise tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

main().catch(console.error);






