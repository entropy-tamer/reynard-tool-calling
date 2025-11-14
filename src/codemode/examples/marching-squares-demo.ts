/**
 * Marching Squares Codemode API Demo
 *
 * Demonstrates practical usage of marching squares tools in codemode.
 */

import { codemode } from "../codemode.js";

async function main() {
  console.log("🦊 Marching Squares Codemode API Demo\n");

  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    // Example 1: Basic contour generation from terrain data
    console.log("=== Example 1: Terrain Contour Generation ===\n");
    const terrainResult = await cm.executeCode(`
      const grid = [
        [0.1, 0.2, 0.3, 0.4, 0.5],
        [0.2, 0.4, 0.6, 0.7, 0.6],
        [0.3, 0.6, 0.9, 0.8, 0.7],
        [0.4, 0.7, 0.8, 0.6, 0.5],
        [0.5, 0.6, 0.7, 0.5, 0.4],
      ];
      
      const result = await tools.algorithms.MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });
      
      console.log('Terrain contours:', result.stats.contourCount);
      console.log('Total segments:', result.stats.segmentCount);
      console.log('Execution time:', result.stats.executionTime.toFixed(3), 'ms');
      
      return {
        contourCount: result.stats.contourCount,
        segmentCount: result.stats.segmentCount,
        executionTime: result.stats.executionTime,
      };
    `);

    console.log("Result:", terrainResult.returned);
    console.log("");

    // Example 2: Multi-level contour lines (like topographic maps)
    console.log("=== Example 2: Multi-Level Contour Lines ===\n");
    const multiLevelResult = await cm.executeCode(`
      // Generate a gradient terrain
      const size = 20;
      const grid = Array(size).fill(null).map((_, y) =>
        Array(size).fill(null).map((_, x) => {
          const centerX = size / 2;
          const centerY = size / 2;
          const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          return Math.max(0, 1 - dist / (size / 2));
        })
      );
      
      const result = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
        grid,
        options: {
          thresholds: [0.2, 0.4, 0.6, 0.8],
        },
      });
      
      console.log('Multi-level contours generated');
      result.contoursByLevel.forEach((contours, threshold) => {
        console.log(\`  Threshold \${threshold}: \${contours.length} contours\`);
      });
      
      return {
        levels: Array.from(result.contoursByLevel.keys()),
        totalContours: result.stats.contourCount,
      };
    `);

    console.log("Result:", multiLevelResult.returned);
    console.log("");

    // Example 3: Contour analysis (calculate area, length, centroid)
    console.log("=== Example 3: Contour Analysis ===\n");
    const analysisResult = await cm.executeCode(`
      const grid = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0.3, 0.5, 0.3, 0, 0],
        [0, 0.3, 0.7, 0.9, 0.7, 0.3, 0],
        [0, 0.5, 0.9, 1.0, 0.9, 0.5, 0],
        [0, 0.3, 0.7, 0.9, 0.7, 0.3, 0],
        [0, 0, 0.3, 0.5, 0.3, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ];
      
      const computeResult = await tools.algorithms.MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });
      
      if (computeResult.contours.length > 0) {
        const analysis = await tools.algorithms.MarchingSquaresTools.analyzeContour({
          contour: computeResult.contours[0],
          options: {
            computeLengths: true,
            computeAreas: true,
            computeCentroids: true,
            computeBoundingBoxes: true,
          },
        });
        
        console.log('Contour Analysis:');
        console.log('  Length:', analysis.length.toFixed(3));
        if (analysis.area !== undefined) {
          console.log('  Area:', analysis.area.toFixed(3));
        }
        console.log('  Centroid: (', analysis.centroid.x.toFixed(2), ',', analysis.centroid.y.toFixed(2), ')');
        console.log('  Bounding Box:', analysis.boundingBox);
        
        return analysis;
      }
      
      return { error: 'No contours found' };
    `);

    console.log("Analysis Result:", JSON.stringify(analysisResult.returned, null, 2));
    console.log("");

    // Example 4: Contour simplification (reduce complexity)
    console.log("=== Example 4: Contour Simplification ===\n");
    const simplificationResult = await cm.executeCode(`
      // Create a complex contour pattern
      const size = 15;
      const grid = Array(size).fill(null).map((_, y) =>
        Array(size).fill(null).map((_, x) => {
          const noise = Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.3;
          return 0.5 + noise;
        })
      );
      
      const computeResult = await tools.algorithms.MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });
      
      if (computeResult.contours.length > 0) {
        const original = computeResult.contours[0];
        const simplification = await tools.algorithms.MarchingSquaresTools.simplifyContour({
          contour: original,
          options: {
            maxDistance: 0.2,
            preserveEndpoints: true,
          },
        });
        
        console.log('Simplification Results:');
        console.log('  Original segments:', original.segments.length);
        console.log('  Simplified segments:', simplification.simplifiedContour.segments.length);
        console.log('  Segments removed:', simplification.segmentsRemoved);
        console.log('  Compression ratio:', simplification.compressionRatio.toFixed(2), 'x');
        
        return {
          originalSegments: original.segments.length,
          simplifiedSegments: simplification.simplifiedContour.segments.length,
          compressionRatio: simplification.compressionRatio,
        };
      }
      
      return { error: 'No contours found' };
    `);

    console.log("Simplification Result:", simplificationResult.returned);
    console.log("");

    // Example 5: Real-world use case - Island generation
    console.log("=== Example 5: Procedural Island Generation ===\n");
    const islandResult = await cm.executeCode(`
      // Generate island-like terrain using distance from center
      const size = 30;
      const centerX = size / 2;
      const centerY = size / 2;
      const maxRadius = size * 0.4;
      
      const grid = Array(size).fill(null).map((_, y) =>
        Array(size).fill(null).map((_, x) => {
          const dx = x - centerX;
          const dy = y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const normalizedDist = dist / maxRadius;
          
          // Create island shape with falloff
          let height = Math.max(0, 1 - normalizedDist);
          // Add some noise for natural variation
          height += (Math.random() - 0.5) * 0.1;
          
          return Math.max(0, Math.min(1, height));
        })
      );
      
      // Generate coastline (water level)
      const coastline = await tools.algorithms.MarchingSquaresTools.compute({
        grid,
        threshold: 0.3,
      });
      
      // Generate elevation contours
      const elevation = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
        grid,
        options: {
          thresholds: [0.4, 0.5, 0.6, 0.7, 0.8],
        },
      });
      
      console.log('Island Generation:');
      console.log('  Coastline contours:', coastline.stats.contourCount);
      console.log('  Elevation levels:', elevation.contoursByLevel.size);
      console.log('  Total elevation contours:', elevation.stats.contourCount);
      
      return {
        coastlineContours: coastline.stats.contourCount,
        elevationLevels: elevation.contoursByLevel.size,
        totalElevationContours: elevation.stats.contourCount,
      };
    `);

    console.log("Island Generation Result:", islandResult.returned);
    console.log("");

    // Example 6: Data visualization - heat map contours
    console.log("=== Example 6: Heat Map Contour Visualization ===\n");
    const heatMapResult = await cm.executeCode(`
      // Simulate temperature/heat data
      const size = 25;
      const hotSpots = [
        { x: 5, y: 5, intensity: 0.9 },
        { x: 20, y: 20, intensity: 0.8 },
        { x: 12, y: 15, intensity: 0.7 },
      ];
      
      const grid = Array(size).fill(null).map((_, y) =>
        Array(size).fill(null).map((_, x) => {
          let value = 0.2; // Base temperature
          
          // Add heat from hot spots
          for (const spot of hotSpots) {
            const dx = x - spot.x;
            const dy = y - spot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const influence = spot.intensity * Math.exp(-dist / 5);
            value = Math.max(value, influence);
          }
          
          return Math.min(1, value);
        })
      );
      
      // Generate temperature level contours
      const contours = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
        grid,
        options: {
          thresholds: [0.3, 0.5, 0.7, 0.9],
        },
      });
      
      console.log('Heat Map Contours:');
      contours.contoursByLevel.forEach((levelContours, threshold) => {
        const temp = Math.round(threshold * 100);
        console.log(\`  \${temp}°C level: \${levelContours.length} contours\`);
      });
      
      return {
        temperatureLevels: Array.from(contours.contoursByLevel.keys()),
        totalContours: contours.stats.contourCount,
      };
    `);

    console.log("Heat Map Result:", heatMapResult.returned);
    console.log("");

    // Example 7: Performance comparison
    console.log("=== Example 7: Performance Comparison ===\n");
    const perfResult = await cm.executeCode(`
      const grid = Array(40).fill(null).map(() =>
        Array(40).fill(0).map(() => Math.random())
      );
      
      const iterations = 5;
      let totalTime = 0;
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await tools.algorithms.MarchingSquaresTools.compute({
          grid,
          threshold: 0.5,
        });
        totalTime += performance.now() - start;
      }
      
      const avgTime = totalTime / iterations;
      
      console.log('Performance Test (40x40 grid,', iterations, 'iterations):');
      console.log('  Average time:', avgTime.toFixed(3), 'ms');
      
      return {
        gridSize: '40x40',
        iterations,
        averageTime: avgTime,
      };
    `);

    console.log("Performance Result:", perfResult.returned);
    console.log("");

    // Example 8: Scientific data visualization
    console.log("=== Example 8: Scientific Data Visualization ===\n");
    const scientificResult = await cm.executeCode(`
      // Simulate scientific measurement data (e.g., pressure, temperature, etc.)
      const size = 20;
      const grid = Array(size).fill(null).map((_, y) =>
        Array(size).fill(null).map((_, x) => {
          // Create a wave pattern with multiple frequencies
          const wave1 = Math.sin(x * 0.3) * 0.3;
          const wave2 = Math.cos(y * 0.3) * 0.3;
          const wave3 = Math.sin((x + y) * 0.2) * 0.2;
          return 0.5 + wave1 + wave2 + wave3;
        })
      );
      
      // Analyze the data with multiple thresholds
      const analysis = await tools.algorithms.MarchingSquaresTools.computeMultiLevel({
        grid,
        options: {
          thresholds: [0.3, 0.4, 0.5, 0.6, 0.7],
        },
      });
      
      // Analyze the largest contour
      let largestContour = null;
      let maxLength = 0;
      
      for (const contours of analysis.contoursByLevel.values()) {
        for (const contour of contours) {
          const contourAnalysis = await tools.algorithms.MarchingSquaresTools.analyzeContour({
            contour,
            options: { computeLengths: true },
          });
          
          if (contourAnalysis.length > maxLength) {
            maxLength = contourAnalysis.length;
            largestContour = contourAnalysis;
          }
        }
      }
      
      console.log('Scientific Data Analysis:');
      console.log('  Contour levels:', analysis.contoursByLevel.size);
      console.log('  Total contours:', analysis.stats.contourCount);
      if (largestContour) {
        console.log('  Largest contour length:', largestContour.length.toFixed(3));
      }
      
      return {
        levels: analysis.contoursByLevel.size,
        totalContours: analysis.stats.contourCount,
        largestContourLength: maxLength,
      };
    `);

    console.log("Scientific Data Result:", scientificResult.returned);
    console.log("");

    console.log("✅ All marching squares codemode API tests completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    cm.cleanup();
  }
}

main().catch(console.error);

