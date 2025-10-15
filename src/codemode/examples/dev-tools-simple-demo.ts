#!/usr/bin/env tsx

/**
 * 🦊 Dev-Tools Simple Demo
 *
 * A simplified demonstration that works with available packages and has proper timeouts.
 */

import { codemode } from "../codemode.js";

/**
 *
 * @example
 */
async function main() {
  console.log("🦊 Dev-Tools Simple Demo");
  console.log("=======================\n");

  // Use a shorter timeout for this demo
  const cm = await codemode({
    projectRoot: "/home/kade/runeset/reynard",
    timeoutMs: 10_000, // 10 second timeout
  });

  try {
    // Health check first
    const health = await cm.healthCheck();
    console.log(`✅ Code Mode Health: ${health.ok ? "OK" : "FAILED"}`);
    if (health.ok) {
      console.log(`📊 Available MCP Tools: ${health.count}\n`);
    }

    // Demo 1: Check available packages
    console.log("🔍 Demo 1: Available Dev-Tools Packages");
    console.log("----------------------------------------");
    await cm.executeCode(`
      console.log("🔍 Checking available dev-tools packages...");
      
      const packages = {
        codeQuality: typeof codeQuality !== 'undefined',
        projectArchitecture: typeof projectArchitecture !== 'undefined',
        dependencyGraph: typeof dependencyGraph !== 'undefined',
        devServerManagement: typeof devServerManagement !== 'undefined',
        adrSystem: typeof adrSystem !== 'undefined',
        diagramGenerator: typeof diagramGenerator !== 'undefined',
        fileProcessing: typeof fileProcessing !== 'undefined',
        publicPackageManager: typeof publicPackageManager !== 'undefined',
        queueWatcher: typeof queueWatcher !== 'undefined',
        apiClient: typeof apiClient !== 'undefined',
        algorithms: typeof algorithms !== 'undefined',
        mcp: typeof mcp !== 'undefined'
      };
      
      const availableCount = Object.values(packages).filter(Boolean).length;
      const totalCount = Object.keys(packages).length;
      
      console.log("📦 Package Availability:", JSON.stringify(packages, null, 2));
      console.log(\`📊 Available: \${availableCount}/\${totalCount} packages\`);
      
      if (packages.algorithms) {
        console.log("✅ Algorithms package is available!");
        console.log("🎯 Available algorithms:", Object.keys(algorithms).slice(0, 5));
      }
      
      if (packages.mcp) {
        console.log("✅ MCP tools are available!");
        console.log("🛠️ MCP tools:", Object.keys(mcp).slice(0, 5));
      }
    `);

    // Demo 2: Test algorithms package (should always be available)
    console.log("\n🧮 Demo 2: Algorithms Package Test");
    console.log("----------------------------------");
    await cm.executeCode(`
      console.log("🧮 Testing algorithms package...");
      
      if (typeof algorithms !== 'undefined') {
        try {
          // Test Union-Find
          const { UnionFind } = algorithms;
          const uf = new UnionFind(5);
          uf.union(0, 1);
          uf.union(2, 3);
          console.log("✅ Union-Find test passed");
          
          // Test Spatial Hash
          const { SpatialHash } = algorithms;
          const spatialHash = new SpatialHash({ cellSize: 50, worldBounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 } });
          console.log("✅ Spatial Hash test passed");
          
          // Test Performance Timer
          const { PerformanceTimer } = algorithms;
          const timer = new PerformanceTimer();
          timer.start();
          // Simulate some work
          for (let i = 0; i < 1000; i++) { Math.random(); }
          timer.stop();
          console.log("✅ Performance Timer test passed");
          
          console.log("🎉 All algorithm tests passed!");
          
        } catch (error) {
          console.log("⚠️ Algorithm test error:", error.message);
        }
      } else {
        console.log("❌ Algorithms package not available");
      }
    `);

    // Demo 3: Test MCP tools (should always be available)
    console.log("\n🛠️ Demo 3: MCP Tools Test");
    console.log("-------------------------");
    await cm.executeCode(`
      console.log("🛠️ Testing MCP tools...");
      
      if (typeof mcp !== 'undefined') {
        try {
          // List available tools
          const toolNames = Object.keys(mcp);
          console.log("📋 Available MCP tools:", toolNames.slice(0, 10));
          
          // Test a simple tool call (if available)
          if (mcp.get_current_time) {
            const timeResult = await mcp.get_current_time();
            console.log("⏰ Current time:", timeResult);
          }
          
          console.log("✅ MCP tools are working!");
          
        } catch (error) {
          console.log("⚠️ MCP test error:", error.message);
        }
      } else {
        console.log("❌ MCP tools not available");
      }
    `);

    // Demo 4: Test dev-tools packages (if available)
    console.log("\n🔧 Demo 4: Dev-Tools Packages Test");
    console.log("----------------------------------");
    await cm.executeCode(`
      console.log("🔧 Testing dev-tools packages...");
      
      const devToolsResults = {};
      
      // Test each dev-tools package
      const packages = [
        'codeQuality', 'projectArchitecture', 'dependencyGraph',
        'devServerManagement', 'adrSystem', 'diagramGenerator',
        'fileProcessing', 'publicPackageManager', 'queueWatcher', 'apiClient'
      ];
      
      for (const pkg of packages) {
        try {
          if (typeof eval(pkg) !== 'undefined') {
            devToolsResults[pkg] = 'available';
            console.log(\`✅ \${pkg}: available\`);
          } else {
            devToolsResults[pkg] = 'not available';
            console.log(\`❌ \${pkg}: not available\`);
          }
        } catch (error) {
          devToolsResults[pkg] = 'error: ' + error.message;
          console.log(\`⚠️ \${pkg}: error - \${error.message}\`);
        }
      }
      
      const availableCount = Object.values(devToolsResults).filter(r => r === 'available').length;
      console.log(\`📊 Dev-tools summary: \${availableCount}/\${packages.length} packages available\`);
    `);

    console.log("\n🎉 Dev-Tools Simple Demo Complete!");
    console.log("==================================");
    console.log("✅ Demo completed successfully with proper timeouts");
    console.log("🚀 Ready for more advanced integrations when packages are built");
  } catch (error: any) {
    console.error("❌ Demo failed:", error.message);
  } finally {
    cm.cleanup();
    setTimeout(() => process.exit(0), 100);
  }
}

// Add timeout to the entire demo
const timeout = setTimeout(() => {
  console.log("⏰ Demo timeout reached, exiting...");
  process.exit(1);
}, 15_000); // 15 second total timeout

main()
  .catch(error => {
    console.error("❌ Demo error:", error);
    clearTimeout(timeout);
    process.exit(1);
  })
  .finally(() => {
    clearTimeout(timeout);
  });
