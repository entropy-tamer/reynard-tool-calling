/**
 * @file PCA Demonstration
 *
 * Demonstrates Principal Component Analysis (PCA) with sample data
 * and visualizations.
 */

import { codemode } from "../codemode";

async function pcaDemo() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("📊 PCA Demonstration\n");
    console.log("=" .repeat(80));

    // Generate sample 3D data (spiral pattern)
    console.log("\n1. Generating sample 3D data (spiral pattern)...");
    const dataResult = await cm.executeCode(`
      const n = 100;
      const data = [];
      
      for (let i = 0; i < n; i++) {
        const t = (i / n) * 4 * Math.PI;
        const r = t / (4 * Math.PI);
        const x = r * Math.cos(t) + (Math.random() - 0.5) * 0.1;
        const y = r * Math.sin(t) + (Math.random() - 0.5) * 0.1;
        const z = t / (4 * Math.PI) + (Math.random() - 0.5) * 0.1;
        data.push([x, y, z]);
      }
      
      return { data, n };
    `);

    const data = dataResult.returned.data;
    console.log(`   Generated ${data.length} data points with ${data[0].length} dimensions`);

    // Perform PCA
    console.log("\n2. Performing PCA transformation...");
    const pcaResult = await cm.executeCode(`
      const result = await tools.algorithms.PCATools.fitTransform({
        data: ${JSON.stringify(data)},
        options: {
          config: {
            components: 2,
            center: true,
            scale: false
          }
        }
      });
      
      return result;
    `);

    const pca = pcaResult.returned;
    console.log(`   Execution time: ${pca.executionTime.toFixed(2)}ms`);
    console.log(`   Transformed to ${pca.transformed[0].length} dimensions`);

    // Visualize 2D projection
    console.log("\n3. Visualizing 2D PCA projection...");
    const viz2D = await cm.executeCode(`
      const plot = await tools.algorithms.PCATools.visualize2D({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 24,
        title: "PCA 2D Projection (Spiral Data)"
      });
      
      return plot;
    `);

    console.log("\n" + viz2D.returned);

    // Visualize explained variance
    console.log("\n4. Visualizing explained variance...");
    const vizVar = await cm.executeCode(`
      const chart = await tools.algorithms.PCATools.visualizeVariance({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 20,
        title: "Explained Variance Ratio"
      });
      
      return chart;
    `);

    console.log("\n" + vizVar.returned);

    // Analyze results
    console.log("\n5. Analyzing PCA results...");
    const analysis = await cm.executeCode(`
      const analysis = await tools.algorithms.PCATools.analyze({
        result: ${JSON.stringify(pca)}
      });
      
      return analysis;
    `);

    const stats = analysis.returned;
    console.log("\n   Analysis Results:");
    console.log(`   - Total variance: ${stats.totalVariance.toFixed(4)}`);
    console.log(`   - Original dimensions: ${stats.originalDimensions}`);
    console.log(`   - Reduced dimensions: ${stats.numComponents}`);
    console.log(`   - Reduction ratio: ${(stats.reductionRatio * 100).toFixed(1)}%`);
    console.log(`   - Cumulative variance (PC1+PC2): ${(stats.cumulativeVarianceRatio[1] * 100).toFixed(1)}%`);

    // Demonstrate inverse transform
    console.log("\n6. Demonstrating inverse transformation...");
    const inverseResult = await cm.executeCode(`
      // First, create and fit a PCA instance
      const fitResult = await tools.algorithms.PCATools.fitTransformWithInstance({
        instanceId: "demo-pca",
        data: ${JSON.stringify(data)},
        options: {
          config: {
            components: 2,
            center: true,
            scale: false
          }
        }
      });
      
      // Transform to 2D
      const transformed = fitResult.transformed;
      
      // Reconstruct original data
      const reconstructed = await tools.algorithms.PCATools.inverseTransform({
        instanceId: "demo-pca",
        transformed: transformed
      });
      
      // Calculate reconstruction error
      let totalError = 0;
      let totalNorm = 0;
      const original = ${JSON.stringify(data)};
      for (let i = 0; i < original.length; i++) {
        for (let j = 0; j < original[i].length; j++) {
          const error = Math.abs(original[i][j] - reconstructed[i][j]);
          totalError += error * error;
          totalNorm += original[i][j] * original[i][j];
        }
      }
      const reconstructionError = Math.sqrt(totalError / totalNorm);
      
      return {
        original: original.length,
        reconstructed: reconstructed.length,
        reconstructionError
      };
    `);

    if (inverseResult.returned && inverseResult.returned.reconstructionError !== undefined) {
      console.log(`   Reconstruction error: ${(inverseResult.returned.reconstructionError * 100).toFixed(2)}%`);
      console.log("   (Note: Some information is lost when reducing dimensions)");
    } else {
      console.log("   ⚠️  Could not compute reconstruction error");
    }

    // Comprehensive visualization
    console.log("\n7. Comprehensive visualization...");
    const comprehensive = await cm.executeCode(`
      const viz = await tools.algorithms.PCATools.visualize({
        result: ${JSON.stringify(pca)},
        width: 80,
        height: 24,
        title: "PCA Analysis"
      });
      
      return viz;
    `);

    console.log("\n" + comprehensive.returned.scatterPlot);
    console.log("\n" + comprehensive.returned.varianceChart);
    console.log("\n   Summary:");
    console.log(`   - ${stats.numComponents} principal components`);
    console.log(`   - ${(stats.cumulativeVarianceRatio[stats.numComponents - 1] * 100).toFixed(1)}% variance explained`);

    console.log("\n" + "=".repeat(80));
    console.log("✨ PCA demonstration complete!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

pcaDemo().catch(console.error);

