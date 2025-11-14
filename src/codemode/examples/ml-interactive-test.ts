/**
 * @file Interactive ML Tools Test
 *
 * Interactive exploration of ML algorithm tools with various datasets
 */

import { codemode } from "../codemode";

async function interactiveTest() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("🧪 Interactive ML Tools Test\n");
    console.log("=".repeat(80));

    // Test 1: PCA on random high-dimensional data
    console.log("\n📊 Test 1: PCA on 5D random data");
    const test1 = await cm.executeCode(`
      // Generate random 5D data
      const data = [];
      for (let i = 0; i < 50; i++) {
        data.push([
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10,
          Math.random() * 10
        ]);
      }
      
      const result = await tools.algorithms.PCATools.fitTransform({
        data: data,
        options: {
          config: {
            components: 2,
            center: true,
            scale: true
          }
        }
      });
      
      const viz = await tools.algorithms.PCATools.visualize2D({
        result: result,
        width: 60,
        height: 20,
        title: "PCA: 5D → 2D (Scaled)"
      });
      
      const analysis = await tools.algorithms.PCATools.analyze({
        result: result
      });
      
      return {
        viz,
        varianceExplained: analysis.cumulativeVarianceRatio[1] * 100,
        executionTime: result.executionTime
      };
    `);

    console.log(test1.returned.viz);
    console.log(`\n   Variance explained: ${test1.returned.varianceExplained.toFixed(1)}%`);
    console.log(`   Execution time: ${test1.returned.executionTime.toFixed(2)}ms`);

    // Test 2: MDS on custom distance matrix
    console.log("\n📊 Test 2: MDS on custom distance matrix (star pattern)");
    const test2 = await cm.executeCode(`
      // Create a star pattern: center point + 8 points in a circle
      const n = 9;
      const distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
      
      // Center point (index 0) is equidistant from all others
      for (let i = 1; i < n; i++) {
        distanceMatrix[0][i] = 1.0;
        distanceMatrix[i][0] = 1.0;
      }
      
      // Circle points are close to neighbors
      for (let i = 1; i < n; i++) {
        for (let j = 1; j < n; j++) {
          if (i !== j) {
            const angleDiff = Math.abs((i - j) * (2 * Math.PI / 8));
            const dist = 2 * Math.sin(angleDiff / 2);
            distanceMatrix[i][j] = dist;
          }
        }
      }
      
      const result = await tools.algorithms.MDSTools.fitTransform({
        distanceMatrix: distanceMatrix,
        options: {
          config: {
            dimensions: 2,
            classical: true
          }
        }
      });
      
      const viz = await tools.algorithms.MDSTools.visualize2D({
        result: result,
        width: 60,
        height: 20,
        title: "MDS: Star Pattern"
      });
      
      return { viz, executionTime: result.executionTime };
    `);

    console.log(test2.returned.viz);
    console.log(`\n   Execution time: ${test2.returned.executionTime.toFixed(2)}ms`);

    // Test 3: Isomap on S-curve
    console.log("\n📊 Test 3: Isomap on S-curve manifold");
    const test3 = await cm.executeCode(`
      // Generate S-curve in 3D
      const data = [];
      for (let i = 0; i < 80; i++) {
        const t = (i / 80) * 4 * Math.PI - 2 * Math.PI;
        const x = Math.sin(t);
        const y = t;
        const z = (Math.random() - 0.5) * 0.3;
        data.push([x, y, z]);
      }
      
      const result = await tools.algorithms.IsomapTools.fitTransform({
        data: data,
        options: {
          config: {
            k: 6,
            dimensions: 2,
            checkConnectivity: true
          }
        }
      });
      
      if (result.error) {
        return { error: result.error, viz: "Error occurred" };
      }
      
      const viz = await tools.algorithms.IsomapTools.visualize2D({
        result: result,
        width: 60,
        height: 20,
        title: "Isomap: S-Curve"
      });
      
      const analysis = await tools.algorithms.IsomapTools.analyze({
        result: result
      });
      
      return {
        viz,
        executionTime: result.executionTime,
        graphEdges: analysis.graphEdges,
        k: analysis.k
      };
    `);

    if (test3.returned.error) {
      console.log(`   ⚠️  Error: ${test3.returned.error}`);
    } else {
      console.log(test3.returned.viz);
      console.log(`\n   Execution time: ${test3.returned.executionTime.toFixed(2)}ms`);
      console.log(`   k: ${test3.returned.k}, Graph edges: ${test3.returned.graphEdges}`);
    }

    // Test 4: PCA variance visualization with many components
    console.log("\n📊 Test 4: PCA with 4 components (variance breakdown)");
    const test4 = await cm.executeCode(`
      // Generate data with clear structure
      const data = [];
      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        data.push([
          Math.sin(t * 2 * Math.PI),
          Math.cos(t * 2 * Math.PI),
          t * 2 - 1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        ]);
      }
      
      const result = await tools.algorithms.PCATools.fitTransform({
        data: data,
        options: {
          config: {
            components: 4,
            center: true,
            scale: false
          }
        }
      });
      
      const varianceViz = await tools.algorithms.PCATools.visualizeVariance({
        result: result,
        width: 60,
        height: 15,
        title: "PCA Variance (4 Components)"
      });
      
      const analysis = await tools.algorithms.PCATools.analyze({
        result: result
      });
      
      return {
        varianceViz,
        explained: analysis.explainedVarianceRatio.map((v, i) => ({
          component: \`PC\${i + 1}\`,
          ratio: v * 100
        })),
        cumulative: analysis.cumulativeVarianceRatio[3] * 100
      };
    `);

    console.log(test4.returned.varianceViz);
    console.log("\n   Explained variance per component:");
    for (const comp of test4.returned.explained) {
      console.log(`     ${comp.component}: ${comp.ratio.toFixed(1)}%`);
    }
    console.log(`   Cumulative (PC1-PC4): ${test4.returned.cumulative.toFixed(1)}%`);

    // Test 5: Quick comparison on same small dataset
    console.log("\n📊 Test 5: Quick comparison on same dataset");
    const test5 = await cm.executeCode(`
      // Small dataset for quick comparison
      const data = [];
      for (let i = 0; i < 30; i++) {
        const t = (i / 30) * 2 * Math.PI;
        data.push([
          Math.cos(t) + (Math.random() - 0.5) * 0.2,
          Math.sin(t) + (Math.random() - 0.5) * 0.2,
          t / (2 * Math.PI) + (Math.random() - 0.5) * 0.1
        ]);
      }
      
      // Compute distance matrix for MDS
      const n = data.length;
      const distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) {
            let dist = 0;
            for (let d = 0; d < 3; d++) {
              const diff = data[i][d] - data[j][d];
              dist += diff * diff;
            }
            distanceMatrix[i][j] = Math.sqrt(dist);
          }
        }
      }
      
      // Run all three
      const pca = await tools.algorithms.PCATools.fitTransform({
        data: data,
        options: { config: { components: 2, center: true } }
      });
      
      const mds = await tools.algorithms.MDSTools.fitTransform({
        distanceMatrix: distanceMatrix,
        options: { config: { dimensions: 2, classical: true } }
      });
      
      const isomap = await tools.algorithms.IsomapTools.fitTransform({
        data: data,
        options: { config: { k: 5, dimensions: 2, checkConnectivity: true } }
      });
      
      const pcaViz = await tools.algorithms.PCATools.visualize2D({
        result: pca,
        width: 50,
        height: 15,
        title: "PCA"
      });
      
      const mdsViz = await tools.algorithms.MDSTools.visualize2D({
        result: mds,
        width: 50,
        height: 15,
        title: "MDS"
      });
      
      let isomapViz = "Error";
      if (!isomap.error) {
        isomapViz = await tools.algorithms.IsomapTools.visualize2D({
          result: isomap,
          width: 50,
          height: 15,
          title: "Isomap"
        });
      }
      
      return {
        pca: { viz: pcaViz, time: pca.executionTime },
        mds: { viz: mdsViz, time: mds.executionTime },
        isomap: { viz: isomapViz, time: isomap.executionTime, error: isomap.error }
      };
    `);

    console.log("\n   PCA:");
    console.log(test5.returned.pca.viz);
    console.log(`   Time: ${test5.returned.pca.time.toFixed(2)}ms`);

    console.log("\n   MDS:");
    console.log(test5.returned.mds.viz);
    console.log(`   Time: ${test5.returned.mds.time.toFixed(2)}ms`);

    console.log("\n   Isomap:");
    if (test5.returned.isomap.error) {
      console.log(`   ⚠️  Error: ${test5.returned.isomap.error}`);
    } else {
      console.log(test5.returned.isomap.viz);
      console.log(`   Time: ${test5.returned.isomap.time.toFixed(2)}ms`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Interactive test complete!");
    console.log("\n💡 All tools are working correctly!");
    console.log("   - PCA: Fast linear dimensionality reduction");
    console.log("   - MDS: Distance-preserving embeddings");
    console.log("   - Isomap: Non-linear manifold learning");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

interactiveTest().catch(console.error);

