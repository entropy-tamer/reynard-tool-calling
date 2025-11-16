/**
 * @file Isomap Demonstration
 *
 * Demonstrates Isomap (Isometric Mapping) with non-linear manifold data
 * and visualizations.
 */

import { codemode } from "../codemode";

async function isomapDemo() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("📊 Isomap Demonstration\n");
    console.log("=".repeat(80));

    // Generate sample non-linear manifold data (Swiss roll)
    console.log("\n1. Generating sample non-linear manifold data (Swiss roll)...");
    const dataResult = await cm.executeCode(`
      // Generate Swiss roll manifold
      const n = 150;
      const data = [];
      
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 3 * Math.PI;
        const y = (Math.random() - 0.5) * 2;
        const x = t * Math.cos(t);
        const z = t * Math.sin(t);
        data.push([x, y, z]);
      }
      
      return { data, n };
    `);

    const data = dataResult.returned.data;
    console.log(`   Generated ${data.length} data points with ${data[0].length} dimensions`);

    // Perform Isomap
    console.log("\n2. Performing Isomap transformation...");
    const isomapResult = await cm.executeCode(`
      const result = await tools.algorithms.IsomapTools.fitTransform({
        data: ${JSON.stringify(data)},
        options: {
          config: {
            k: 8,
            dimensions: 2,
            checkConnectivity: true
          }
        }
      });
      
      return result;
    `);

    const isomap = isomapResult.returned;
    console.log(`   Execution time: ${isomap.executionTime.toFixed(2)}ms`);
    
    if (isomap.error) {
      console.log(`   ⚠️  Error: ${isomap.error}`);
    } else {
      console.log(`   Embedding dimensions: ${isomap.embedding[0].length}D`);
      if (isomap.graph) {
        console.log(`   Graph: ${isomap.graph.nodes} nodes, ${isomap.graph.edges.length} edges`);
      }
    }

    // Visualize 2D embedding
    console.log("\n3. Visualizing 2D Isomap embedding...");
    const viz2D = await cm.executeCode(`
      const plot = await tools.algorithms.IsomapTools.visualize2D({
        result: ${JSON.stringify(isomap)},
        width: 80,
        height: 24,
        title: "Isomap 2D Embedding (Swiss Roll)"
      });
      
      return plot;
    `);

    console.log("\n" + viz2D.returned);

    // Visualize graph structure
    if (isomap.graph && !isomap.error) {
      console.log("\n4. Visualizing k-NN graph structure...");
      const vizGraph = await cm.executeCode(`
        const graph = await tools.algorithms.IsomapTools.visualizeGraph({
          result: ${JSON.stringify(isomap)},
          width: 80,
          height: 24,
          title: "Isomap k-NN Graph (Adjacency Matrix)"
        });
        
        return graph;
      `);

      console.log("\n" + vizGraph.returned);
    }

    // Visualize geodesic distances
    if (isomap.geodesicDistances && isomap.geodesicDistances.length > 0 && !isomap.error) {
      console.log("\n5. Visualizing geodesic distance matrix...");
      const vizDist = await cm.executeCode(`
        const heatmap = await tools.algorithms.IsomapTools.visualizeDistances({
          result: ${JSON.stringify(isomap)},
          width: 80,
          height: 24,
          title: "Geodesic Distance Matrix"
        });
        
        return heatmap;
      `);

      console.log("\n" + vizDist.returned);
    }

    // Analyze results
    console.log("\n6. Analyzing Isomap results...");
    const analysis = await cm.executeCode(`
      const analysis = await tools.algorithms.IsomapTools.analyze({
        result: ${JSON.stringify(isomap)}
      });
      
      return analysis;
    `);

    const stats = analysis.returned;
    console.log("\n   Analysis Results:");
    console.log(`   - Number of samples: ${stats.numSamples}`);
    console.log(`   - Embedding dimensions: ${stats.dimensions}`);
    console.log(`   - k (nearest neighbors): ${stats.k}`);
    console.log(`   - Graph nodes: ${stats.graphNodes}`);
    console.log(`   - Graph edges: ${stats.graphEdges}`);
    console.log(`   - Average degree: ${stats.averageDegree.toFixed(2)}`);
    if (stats.geodesicDistances) {
      console.log(`   - Geodesic distances:`);
      console.log(`     * Min: ${stats.geodesicDistances.min.toFixed(3)}`);
      console.log(`     * Max: ${stats.geodesicDistances.max.toFixed(3)}`);
      console.log(`     * Mean: ${stats.geodesicDistances.mean.toFixed(3)}`);
      console.log(`     * Median: ${stats.geodesicDistances.median.toFixed(3)}`);
    }
    if (stats.error) {
      console.log(`   - Error: ${stats.error}`);
    }

    // Try different k values
    console.log("\n7. Comparing different k values...");
    const kComparison = await cm.executeCode(`
      const kValues = [5, 8, 12];
      const results = [];
      
      for (const k of kValues) {
        const result = await tools.algorithms.IsomapTools.fitTransform({
          data: ${JSON.stringify(data)},
          options: {
            config: {
              k: k,
              dimensions: 2,
              checkConnectivity: true
            }
          }
        });
        
        if (!result.error) {
          const viz = await tools.algorithms.IsomapTools.visualize2D({
            result: result,
            width: 80,
            height: 24,
            title: \`Isomap (k=\${k})\`
          });
          
          results.push({ k, viz, error: result.error });
        } else {
          results.push({ k, viz: \`Error: \${result.error}\`, error: result.error });
        }
      }
      
      return results;
    `);

    console.log("\n   Comparison of different k values:");
    for (const comp of kComparison.returned) {
      console.log(`\n   k = ${comp.k}:`);
      if (comp.error) {
        console.log(`   ${comp.viz}`);
      } else {
        // Just show a summary for k comparison
        console.log(`   (Visualization available - see comprehensive output below)`);
      }
    }

    // Comprehensive visualization
    console.log("\n8. Comprehensive Isomap visualization...");
    const comprehensive = await cm.executeCode(`
      const viz = await tools.algorithms.IsomapTools.visualize({
        result: ${JSON.stringify(isomap)},
        width: 80,
        height: 24,
        title: "Isomap Analysis",
        includeGraph: true,
        includeDistances: true
      });
      
      return viz;
    `);

    console.log("\n" + comprehensive.returned.scatterPlot);
    if (comprehensive.returned.graphVisualization) {
      console.log("\n" + comprehensive.returned.graphVisualization);
    }
    if (comprehensive.returned.distanceHeatmap) {
      console.log("\n" + comprehensive.returned.distanceHeatmap);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Isomap demonstration complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

isomapDemo().catch(console.error);


