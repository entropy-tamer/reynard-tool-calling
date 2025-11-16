/**
 * @file ML Visualization Showcase
 *
 * Showcase of ASCII visualizations with various interesting datasets
 */

import { codemode } from "../codemode";

async function visualizationShowcase() {
  const cm = await codemode({ projectRoot: process.cwd() });

  try {
    console.log("🎨 ML Visualization Showcase\n");
    console.log("=".repeat(80));

    // Showcase 1: PCA on clustered data
    console.log("\n🎯 Showcase 1: PCA on 3 distinct clusters");
    const showcase1 = await cm.executeCode(`
      // Create 3 distinct clusters in 4D space
      const data = [];
      
      // Cluster 1: centered at (0, 0, 0, 0)
      for (let i = 0; i < 20; i++) {
        data.push([
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ]);
      }
      
      // Cluster 2: centered at (3, 3, 0, 0)
      for (let i = 0; i < 20; i++) {
        data.push([
          3 + (Math.random() - 0.5) * 0.5,
          3 + (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ]);
      }
      
      // Cluster 3: centered at (0, 0, 3, 3)
      for (let i = 0; i < 20; i++) {
        data.push([
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          3 + (Math.random() - 0.5) * 0.5,
          3 + (Math.random() - 0.5) * 0.5
        ]);
      }
      
      const result = await tools.algorithms.PCATools.fitTransform({
        data: data,
        options: {
          config: {
            components: 2,
            center: true,
            scale: false
          }
        }
      });
      
      const viz = await tools.algorithms.PCATools.visualize2D({
        result: result,
        width: 70,
        height: 20,
        title: "PCA: 3 Clusters in 4D → 2D"
      });
      
      const analysis = await tools.algorithms.PCATools.analyze({
        result: result
      });
      
      return {
        viz,
        variance: analysis.cumulativeVarianceRatio[1] * 100
      };
    `);

    console.log(showcase1.returned.viz);
    console.log(`\n   Clusters are ${showcase1.returned.variance.toFixed(1)}% preserved in 2D`);

    // Showcase 2: MDS on network-like distances
    console.log("\n🌐 Showcase 2: MDS on network topology (ring + hub)");
    const showcase2 = await cm.executeCode(`
      // Create a network: ring of 8 nodes + 1 central hub
      const n = 9;
      const distanceMatrix = Array(n).fill(null).map(() => Array(n).fill(0));
      
      // Hub (node 0) connects to all ring nodes
      for (let i = 1; i < n; i++) {
        distanceMatrix[0][i] = 1.0;
        distanceMatrix[i][0] = 1.0;
      }
      
      // Ring connections (neighbors are close)
      for (let i = 1; i < n; i++) {
        const next = i === n - 1 ? 1 : i + 1;
        const prev = i === 1 ? n - 1 : i - 1;
        distanceMatrix[i][next] = 0.5;
        distanceMatrix[next][i] = 0.5;
        distanceMatrix[i][prev] = 0.5;
        distanceMatrix[prev][i] = 0.5;
      }
      
      // Non-adjacent ring nodes are further
      for (let i = 1; i < n; i++) {
        for (let j = 1; j < n; j++) {
          if (i !== j && distanceMatrix[i][j] === 0) {
            const ringDist = Math.min(
              Math.abs(i - j),
              n - 1 - Math.abs(i - j)
            );
            distanceMatrix[i][j] = ringDist * 0.3;
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
        width: 70,
        height: 20,
        title: "MDS: Network Topology"
      });
      
      return { viz };
    `);

    console.log(showcase2.returned.viz);
    console.log("   (Hub should be in center, ring nodes around it)");

    // Showcase 3: Isomap on torus
    console.log("\n🍩 Showcase 3: Isomap on torus (donut) manifold");
    const showcase3 = await cm.executeCode(`
      // Generate points on a torus
      const data = [];
      const R = 2; // Major radius
      const r = 1; // Minor radius
      
      for (let i = 0; i < 100; i++) {
        const u = (i / 100) * 2 * Math.PI;
        const v = ((i * 1.618) % 100 / 100) * 2 * Math.PI; // Golden ratio for coverage
        
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        
        data.push([x, y, z]);
      }
      
      const result = await tools.algorithms.IsomapTools.fitTransform({
        data: data,
        options: {
          config: {
            k: 8,
            dimensions: 2,
            checkConnectivity: true
          }
        }
      });
      
      if (result.error) {
        return { error: result.error, viz: "Error" };
      }
      
      const viz = await tools.algorithms.IsomapTools.visualize2D({
        result: result,
        width: 70,
        height: 20,
        title: "Isomap: Torus → 2D"
      });
      
      return { viz, executionTime: result.executionTime };
    `);

    if (showcase3.returned.error) {
      console.log(`   ⚠️  Error: ${showcase3.returned.error}`);
    } else {
      console.log(showcase3.returned.viz);
      console.log(`\n   Execution time: ${showcase3.returned.executionTime.toFixed(2)}ms`);
      console.log("   (Torus should unfold into a rectangle-like shape)");
    }

    // Showcase 4: PCA variance with noise
    console.log("\n📊 Showcase 4: PCA variance with different noise levels");
    const showcase4 = await cm.executeCode(`
      // Generate data with varying noise
      const datasets = [];
      const noiseLevels = [0.1, 0.5, 1.0];
      
      for (const noise of noiseLevels) {
        const data = [];
        for (let i = 0; i < 50; i++) {
          const t = (i / 50) * 2 * Math.PI;
          data.push([
            Math.cos(t) + (Math.random() - 0.5) * noise,
            Math.sin(t) + (Math.random() - 0.5) * noise,
            t / (2 * Math.PI) + (Math.random() - 0.5) * noise
          ]);
        }
        
        const result = await tools.algorithms.PCATools.fitTransform({
          data: data,
          options: {
            config: {
              components: 2,
              center: true,
              scale: false
            }
          }
        });
        
        const analysis = await tools.algorithms.PCATools.analyze({
          result: result
        });
        
        datasets.push({
          noise,
          variance: analysis.cumulativeVarianceRatio[1] * 100,
          viz: await tools.algorithms.PCATools.visualize2D({
            result: result,
            width: 50,
            height: 15,
            title: \`PCA (noise=\${noise})\`
          })
        });
      }
      
      return datasets;
    `);

    for (const dataset of showcase4.returned) {
      console.log(`\n   Noise level: ${dataset.noise}`);
      console.log(dataset.viz);
      console.log(`   Variance explained: ${dataset.variance.toFixed(1)}%`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Visualization showcase complete!");
    console.log("\n🎨 All visualizations are working beautifully!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await cm.cleanup();
  }
}

visualizationShowcase().catch(console.error);


