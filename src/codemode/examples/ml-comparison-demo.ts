/**
 * @file ML Algorithms Comparison Demonstration
 *
 * Compares PCA, MDS, and Isomap on the same dataset to show
 * their different characteristics and use cases.
 */

import { codemode } from "../codemode";

async function comparisonDemo() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("📊 ML Algorithms Comparison: PCA vs MDS vs Isomap\n");
    console.log("=".repeat(80));

    // Generate sample data (non-linear manifold - Swiss roll)
    console.log("\n1. Generating sample data (Swiss roll manifold)...");
    const dataResult = await cm.executeCode(`
      // Generate Swiss roll manifold
      const n = 120;
      const data = [];
      
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 3 * Math.PI;
        const y = (Math.random() - 0.5) * 1.5;
        const x = t * Math.cos(t);
        const z = t * Math.sin(t);
        data.push([x, y, z]);
      }
      
      return { data, n };
    `);

    const data = dataResult.returned.data;
    console.log(`   Generated ${data.length} data points with ${data[0].length} dimensions`);

    // Compute distance matrix for MDS
    console.log("\n2. Computing distance matrix for MDS...");
    const distanceResult = await cm.executeCode(`
      const n = ${data.length};
      const distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
      
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            distanceMatrix[i][j] = 0;
          } else {
            let dist = 0;
            for (let d = 0; d < ${data[0].length}; d++) {
              const diff = ${JSON.stringify(data)}[i][d] - ${JSON.stringify(data)}[j][d];
              dist += diff * diff;
            }
            distanceMatrix[i][j] = Math.sqrt(dist);
          }
        }
      }
      
      return distanceMatrix;
    `);

    const distanceMatrix = distanceResult.returned;

    // Run all three algorithms
    console.log("\n3. Running PCA, MDS, and Isomap...");
    const results = await cm.executeCode(`
      // PCA
      const pcaResult = await tools.algorithms.PCATools.fitTransform({
        data: ${JSON.stringify(data)},
        options: {
          config: {
            components: 2,
            center: true,
            scale: false
          }
        }
      });
      
      // MDS
      const mdsResult = await tools.algorithms.MDSTools.fitTransform({
        distanceMatrix: ${JSON.stringify(distanceMatrix)},
        options: {
          config: {
            dimensions: 2,
            classical: true
          }
        }
      });
      
      // Isomap
      const isomapResult = await tools.algorithms.IsomapTools.fitTransform({
        data: ${JSON.stringify(data)},
        options: {
          config: {
            k: 8,
            dimensions: 2,
            checkConnectivity: true
          }
        }
      });
      
      return {
        pca: pcaResult,
        mds: mdsResult,
        isomap: isomapResult
      };
    `);

    const pca = results.returned.pca;
    const mds = results.returned.mds;
    const isomap = results.returned.isomap;

    console.log(`   PCA: ${pca.executionTime.toFixed(2)}ms`);
    console.log(`   MDS: ${mds.executionTime.toFixed(2)}ms`);
    console.log(`   Isomap: ${isomap.executionTime.toFixed(2)}ms`);

    // Visualize all three side-by-side
    console.log("\n4. Visualizing all three algorithms...");
    const visualizations = await cm.executeCode(`
      const pcaViz = await tools.algorithms.PCATools.visualize2D({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 24,
        title: "PCA (Linear)"
      });
      
      const mdsViz = await tools.algorithms.MDSTools.visualize2D({
        result: ${JSON.stringify(mds)},
        width: 80,
        height: 24,
        title: "MDS (Classical)"
      });
      
      let isomapViz = "Isomap (Non-linear)\\n(Error occurred)";
      if (!${JSON.stringify(isomap)}.error) {
        isomapViz = await tools.algorithms.IsomapTools.visualize2D({
          result: ${JSON.stringify(isomap)},
          width: 80,
          height: 24,
          title: "Isomap (Non-linear)"
        });
      }
      
      return {
        pca: pcaViz,
        mds: mdsViz,
        isomap: isomapViz
      };
    `);

    console.log("\n" + "─".repeat(80));
    console.log("PCA (Principal Component Analysis) - Linear dimensionality reduction");
    console.log("─".repeat(80));
    console.log(visualizations.returned.pca);

    console.log("\n" + "─".repeat(80));
    console.log("MDS (Multidimensional Scaling) - Distance-preserving embedding");
    console.log("─".repeat(80));
    console.log(visualizations.returned.mds);

    console.log("\n" + "─".repeat(80));
    console.log("Isomap (Isometric Mapping) - Non-linear manifold learning");
    console.log("─".repeat(80));
    console.log(visualizations.returned.isomap);

    // Analyze and compare
    console.log("\n5. Analyzing and comparing results...");
    const analyses = await cm.executeCode(`
      const pcaAnalysis = await tools.algorithms.PCATools.analyze({
        result: ${JSON.stringify(pca)}
      });
      
      const mdsAnalysis = await tools.algorithms.MDSTools.analyze({
        result: ${JSON.stringify(mds)}
      });
      
      const isomapAnalysis = await tools.algorithms.IsomapTools.analyze({
        result: ${JSON.stringify(isomap)}
      });
      
      return {
        pca: pcaAnalysis,
        mds: mdsAnalysis,
        isomap: isomapAnalysis
      };
    `);

    const pcaStats = analyses.returned.pca;
    const mdsStats = analyses.returned.mds;
    const isomapStats = analyses.returned.isomap;

    console.log("\n" + "=".repeat(80));
    console.log("COMPARISON SUMMARY");
    console.log("=".repeat(80));

    console.log("\n📈 Performance:");
    console.log(`   PCA:    ${pca.executionTime.toFixed(2)}ms`);
    console.log(`   MDS:    ${mds.executionTime.toFixed(2)}ms`);
    console.log(`   Isomap: ${isomap.executionTime.toFixed(2)}ms`);

    console.log("\n📊 Characteristics:");
    console.log("\n   PCA (Linear):");
    console.log(`   - Variance explained (PC1+PC2): ${(pcaStats.cumulativeVarianceRatio[1] * 100).toFixed(1)}%`);
    console.log(`   - Reduction ratio: ${(pcaStats.reductionRatio * 100).toFixed(1)}%`);
    console.log(`   - Best for: Linear relationships, fast computation`);

    console.log("\n   MDS (Distance-preserving):");
    console.log(`   - Stress: ${mdsStats.stress !== undefined ? mdsStats.stress.toFixed(4) : "N/A"}`);
    console.log(`   - Quality: ${mdsStats.quality || "N/A"}`);
    console.log(`   - Best for: Distance matrices, preserving global structure`);

    console.log("\n   Isomap (Non-linear):");
    if (isomapStats.error) {
      console.log(`   - Error: ${isomapStats.error}`);
    } else {
      console.log(`   - k (nearest neighbors): ${isomapStats.k}`);
      console.log(`   - Graph edges: ${isomapStats.graphEdges}`);
      console.log(`   - Average degree: ${isomapStats.averageDegree.toFixed(2)}`);
    }
    console.log(`   - Best for: Non-linear manifolds, preserving local structure`);

    // Show variance explained for PCA
    console.log("\n6. PCA Explained Variance:");
    const pcaVar = await cm.executeCode(`
      const chart = await tools.algorithms.PCATools.visualizeVariance({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 20,
        title: "PCA Explained Variance Ratio"
      });
      
      return chart;
    `);

    console.log("\n" + pcaVar.returned);

    // Show comprehensive visualizations
    console.log("\n7. Comprehensive visualizations...");
    const comprehensive = await cm.executeCode(`
      const pcaComp = await tools.algorithms.PCATools.visualize({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 24,
        title: "PCA Comprehensive"
      });
      
      const mdsComp = await tools.algorithms.MDSTools.visualize({
        result: ${JSON.stringify(mds)},
        width: 80,
        height: 24,
        title: "MDS Comprehensive"
      });
      
      let isomapComp = null;
      if (!${JSON.stringify(isomap)}.error) {
        isomapComp = await tools.algorithms.IsomapTools.visualize({
          result: ${JSON.stringify(isomap)},
          width: 80,
          height: 24,
          title: "Isomap Comprehensive",
          includeGraph: false,
          includeDistances: false
        });
      }
      
      return {
        pca: pcaComp,
        mds: mdsComp,
        isomap: isomapComp
      };
    `);

    console.log("\n" + "─".repeat(80));
    console.log("PCA COMPREHENSIVE");
    console.log("─".repeat(80));
    console.log(comprehensive.returned.pca.scatterPlot);
    console.log("\n" + comprehensive.returned.pca.varianceChart);

    console.log("\n" + "─".repeat(80));
    console.log("MDS COMPREHENSIVE");
    console.log("─".repeat(80));
    console.log(comprehensive.returned.mds.scatterPlot);

    if (comprehensive.returned.isomap) {
      console.log("\n" + "─".repeat(80));
      console.log("ISOMAP COMPREHENSIVE");
      console.log("─".repeat(80));
      console.log(comprehensive.returned.isomap.scatterPlot);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Comparison demonstration complete!");
    console.log("\n💡 Key Takeaways:");
    console.log("   - PCA: Fast, linear, preserves variance");
    console.log("   - MDS: Preserves distances, works with distance matrices");
    console.log("   - Isomap: Handles non-linear manifolds, preserves geodesic distances");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

comparisonDemo().catch(console.error);

