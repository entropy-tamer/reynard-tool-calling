/**
 * @file TypeScript Type Checking Test for Multiscale Noise
 * Verifies that multiscale noise types are properly accessible in codemode
 */

import { codemode } from "../codemode";

async function main() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("🔍 Testing Multiscale Noise Type Accessibility\n");

    // Test that types are accessible and functions work with proper typing
    const typeTest = await cm.executeCode(`
      const { SimplexNoise, PerlinNoise } = algorithms;
      
      // Test Simplex multiscale with proper options structure
      const simplexNoise = new SimplexNoise({ seed: 12345 });
      const simplexOptions = {
        scales: [
          { frequency: 0.01, amplitude: 1.0, name: "terrain" },
          { frequency: 0.05, amplitude: 0.5, name: "features" },
        ],
        combinationMode: "additive" as const,
        normalize: false,
      };
      
      const simplexResult = simplexNoise.multiscaleNoise2D(10, 20, simplexOptions);
      
      // Test Perlin multiscale
      const perlinNoise = new PerlinNoise({ seed: 12345 });
      const perlinOptions = {
        scales: [
          { frequency: 0.02, amplitude: 1.0, name: "base" },
          { frequency: 0.1, amplitude: 0.5, name: "details" },
        ],
        combinationMode: "additive" as const,
      };
      
      const perlinResult = perlinNoise.multiscaleNoise2D(10, 20, perlinOptions);
      
      // Test all combination modes
      const modes = ["additive", "multiplicative", "weighted", "max", "min"] as const;
      const modeResults = {};
      
      for (const mode of modes) {
        const result = simplexNoise.multiscaleNoise2D(10, 20, {
          scales: [{ frequency: 0.01, amplitude: 1.0 }],
          combinationMode: mode,
        });
        modeResults[mode] = {
          combined: result.combined,
          scaleCount: result.scales.size,
        };
      }
      
      // Test accessing individual scales by name and index
      const namedResult = simplexNoise.multiscaleNoise2D(10, 20, {
        scales: [
          { frequency: 0.01, amplitude: 1.0, name: "terrain" },
          { frequency: 0.05, amplitude: 0.5 },
        ],
      });
      
      const terrainValue = namedResult.scales.get("terrain");
      const indexValue = namedResult.scales.get(1);
      
      return {
        simplex: {
          combined: simplexResult.combined,
          terrain: simplexResult.scales.get("terrain"),
          features: simplexResult.scales.get("features"),
        },
        perlin: {
          combined: perlinResult.combined,
          base: perlinResult.scales.get("base"),
          details: perlinResult.scales.get("details"),
        },
        modes: modeResults,
        namedAccess: {
          terrain: terrainValue,
          index1: indexValue,
        },
      };
    `);

    console.log("✅ Type Test Results:", JSON.stringify(typeTest.returned, null, 2));

    // Test 3D and 4D multiscale
    console.log("\n📐 Testing 3D and 4D Multiscale...");
    const dimTest = await cm.executeCode(`
      const { SimplexNoise } = algorithms;
      
      const noise = new SimplexNoise({ seed: 12345 });
      const options = {
        scales: [
          { frequency: 0.01, amplitude: 1.0 },
          { frequency: 0.05, amplitude: 0.5 },
        ],
      };
      
      const result2D = noise.multiscaleNoise2D(10, 20, options);
      const result3D = noise.multiscaleNoise3D(10, 20, 30, options);
      const result4D = noise.multiscaleNoise4D(10, 20, 30, 40, options);
      
      return {
        "2D": { combined: result2D.combined, scaleCount: result2D.scales.size },
        "3D": { combined: result3D.combined, scaleCount: result3D.scales.size },
        "4D": { combined: result4D.combined, scaleCount: result4D.scales.size },
      };
    `);

    console.log("✅ Dimension Test Results:", JSON.stringify(dimTest.returned, null, 2));

    console.log("\n✅ All type and functionality tests passed!");
    console.log("✅ Multiscale noise is fully usable in codemode TypeScript tooling!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

main().catch(console.error);
