/**
 * @file MDS Demonstration
 *
 * Demonstrates Multidimensional Scaling (MDS) with distance matrix
 * and visualizations.
 */

import { codemode } from "../codemode";

async function mdsDemo() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("📊 MDS Demonstration\n");
    console.log("=".repeat(80));

    // Generate sample distance matrix (cities on a map)
    console.log("\n1. Generating sample distance matrix (simulated city distances)...");
    const distanceResult = await cm.executeCode(`
      // Simulate 8 cities arranged in a rough circle
      const cities = [
        { name: "City A", x: 0, y: 1 },
        { name: "City B", x: 0.7, y: 0.7 },
        { name: "City C", x: 1, y: 0 },
        { name: "City D", x: 0.7, y: -0.7 },
        { name: "City E", x: 0, y: -1 },
        { name: "City F", x: -0.7, y: -0.7 },
        { name: "City G", x: -1, y: 0 },
        { name: "City H", x: -0.7, y: 0.7 }
      ];
      
      // Compute Euclidean distances
      const n = cities.length;
      const distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            distanceMatrix[i][j] = 0;
          } else {
            const dx = cities[i].x - cities[j].x;
            const dy = cities[i].y - cities[j].y;
            distanceMatrix[i][j] = Math.sqrt(dx * dx + dy * dy);
          }
        }
      }
      
      return { distanceMatrix, cities, n };
    `);

    const distanceMatrix = distanceResult.returned.distanceMatrix;
    const cities = distanceResult.returned.cities;
    console.log(`   Generated ${distanceResult.returned.n}x${distanceResult.returned.n} distance matrix`);

    // Perform Classical MDS
    console.log("\n2. Performing Classical MDS...");
    const mdsResult = await cm.executeCode(`
      const result = await tools.algorithms.MDSTools.fitTransform({
        distanceMatrix: ${JSON.stringify(distanceMatrix)},
        options: {
          config: {
            dimensions: 2,
            classical: true
          }
        }
      });
      
      return result;
    `);

    const mds = mdsResult.returned;
    console.log(`   Execution time: ${mds.executionTime.toFixed(2)}ms`);
    console.log(`   Embedding dimensions: ${mds.embedding[0].length}D`);

    // Visualize 2D embedding
    console.log("\n3. Visualizing 2D MDS embedding...");
    const viz2D = await cm.executeCode(`
      const plot = await tools.algorithms.MDSTools.visualize2D({
        result: ${JSON.stringify(mds)},
        width: 80,
        height: 24,
        title: "MDS 2D Embedding (City Distances)"
      });
      
      return plot;
    `);

    console.log("\n" + viz2D.returned);

    // Analyze results
    console.log("\n4. Analyzing MDS results...");
    const analysis = await cm.executeCode(`
      const analysis = await tools.algorithms.MDSTools.analyze({
        result: ${JSON.stringify(mds)}
      });
      
      return analysis;
    `);

    const stats = analysis.returned;
    console.log("\n   Analysis Results:");
    console.log(`   - Number of samples: ${stats.numSamples}`);
    console.log(`   - Embedding dimensions: ${stats.dimensions}`);
    if (stats.eigenvalues) {
      console.log(`   - Eigenvalues: [${stats.eigenvalues.map((v: number) => v.toFixed(3)).join(", ")}]`);
    }
    if (stats.stress !== undefined) {
      console.log(`   - Stress: ${stats.stress.toFixed(4)}`);
      console.log(`   - Quality: ${stats.quality || "N/A"}`);
      console.log(`   - Iterations: ${stats.iterations || "N/A"}`);
    }

    // Demonstrate Metric MDS with stress visualization
    console.log("\n5. Demonstrating Metric MDS with stress convergence...");
    const metricMdsResult = await cm.executeCode(`
      const result = await tools.algorithms.MDSTools.fitTransform({
        distanceMatrix: ${JSON.stringify(distanceMatrix)},
        options: {
          config: {
            dimensions: 2,
            classical: false,
            maxIterations: 500,
            tolerance: 1e-6
          }
        }
      });
      
      return result;
    `);

    const metricMds = metricMdsResult.returned;
    console.log(`   Execution time: ${metricMds.executionTime.toFixed(2)}ms`);
    if (metricMds.stress !== undefined) {
      console.log(`   Final stress: ${metricMds.stress.toFixed(4)}`);
      console.log(`   Iterations: ${metricMds.iterations || "N/A"}`);
    }

    // Visualize stress
    if (metricMds.stress !== undefined) {
      console.log("\n6. Visualizing stress...");
      const vizStress = await cm.executeCode(`
        const chart = await tools.algorithms.MDSTools.visualizeStress({
          result: ${JSON.stringify(metricMds)},
          width: 80,
          height: 20,
          title: "MDS Stress (Metric MDS)"
        });
        
        return chart;
      `);

      console.log("\n" + vizStress.returned);
    }

    // Compare Classical vs Metric MDS
    console.log("\n7. Comparing Classical vs Metric MDS embeddings...");
    const comparison = await cm.executeCode(`
      const classicalViz = await tools.algorithms.MDSTools.visualize2D({
        result: ${JSON.stringify(mds)},
        width: 80,
        height: 24,
        title: "Classical MDS"
      });
      
      const metricViz = await tools.algorithms.MDSTools.visualize2D({
        result: ${JSON.stringify(metricMds)},
        width: 80,
        height: 24,
        title: "Metric MDS"
      });
      
      return {
        classical: classicalViz,
        metric: metricViz
      };
    `);

    console.log("\n" + comparison.returned.classical);
    console.log("\n" + comparison.returned.metric);

    // Comprehensive visualization
    console.log("\n8. Comprehensive MDS visualization...");
    const comprehensive = await cm.executeCode(`
      const viz = await tools.algorithms.MDSTools.visualize({
        result: ${JSON.stringify(mds)},
        width: 80,
        height: 24,
        title: "MDS Analysis"
      });
      
      return viz;
    `);

    console.log("\n" + comprehensive.returned.scatterPlot);
    if (comprehensive.returned.stressChart) {
      console.log("\n" + comprehensive.returned.stressChart);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ MDS demonstration complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

mdsDemo().catch(console.error);


