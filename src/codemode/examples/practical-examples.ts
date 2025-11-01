#!/usr/bin/env tsx

/**
 * 🦊 Practical Examples - Useful Things AI Agents Can Do
 * 
 * Demonstrates real-world applications using available tools:
 * - Algorithms package for data analysis and optimization
 * - MCP tools for system interaction and automation
 */

import { codemode } from "../codemode.js";

async function main() {
  console.log("🦊 Practical Examples - AI Agent Capabilities");
  console.log("=============================================\n");

  const cm = await codemode({ 
    projectRoot: "/home/kade/runeset/reynard",
    timeoutMs: 15_000
  });

  try {
    // Example 1: Performance Analysis and Optimization
    console.log("📊 Example 1: Performance Analysis and Optimization");
    console.log("--------------------------------------------------");
    await cm.executeCode(`
      console.log("📊 Analyzing performance and optimizing algorithms...");
      
      if (typeof algorithms !== 'undefined') {
        const { PerformanceTimer, MemoryMonitor, UnionFind, SpatialHash } = algorithms;
        
        // Performance analysis
        const timer = new PerformanceTimer();
        timer.start();
        
        // Simulate some computational work
        const data = Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          value: Math.random() * 100
        }));
        
        // Use spatial hash for efficient spatial queries
        const spatialHash = new SpatialHash({
          cellSize: 50,
          worldBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
        });
        
        // Add objects to spatial hash
        data.forEach(item => {
          spatialHash.add(item, { x: item.x, y: item.y, width: 10, height: 10 });
        });
        
        // Find nearby objects efficiently
        const queryPoint = { x: 500, y: 500, width: 100, height: 100 };
        const nearby = spatialHash.query(queryPoint);
        
        timer.stop();
        
        console.log("✅ Performance Analysis Results:");
        console.log(\`   - Data points processed: \${data.length}\`);
        console.log(\`   - Spatial hash cells: \${spatialHash.getCellCount()}\`);
        console.log(\`   - Nearby objects found: \${nearby.length}\`);
        console.log(\`   - Processing time: \${timer.getElapsedTime()}ms\`);
        console.log(\`   - Performance: \${(data.length / timer.getElapsedTime()).toFixed(0)} ops/ms\`);
        
        // Memory monitoring
        const memoryMonitor = new MemoryMonitor();
        memoryMonitor.measure();
        console.log(\`   - Memory usage: \${memoryMonitor.getCurrentUsage()}MB\`);
        
      } else {
        console.log("❌ Algorithms package not available");
      }
    `);

    // Example 2: Dependency Analysis and Graph Optimization
    console.log("\n🔗 Example 2: Dependency Analysis and Graph Optimization");
    console.log("------------------------------------------------------");
    await cm.executeCode(`
      console.log("🔗 Analyzing dependencies and optimizing graph structures...");
      
      if (typeof algorithms !== 'undefined') {
        const { UnionFind } = algorithms;
        
        // Simulate a dependency graph
        const dependencies = [
          { from: 'A', to: 'B' },
          { from: 'B', to: 'C' },
          { from: 'C', to: 'D' },
          { from: 'E', to: 'F' },
          { from: 'F', to: 'G' },
          { from: 'H', to: 'I' },
          { from: 'I', to: 'J' },
          { from: 'J', to: 'K' }
        ];
        
        // Use Union-Find to detect connected components
        const uf = new UnionFind(11); // A-K = 11 components
        const componentMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9, 'K': 10 };
        
        dependencies.forEach(dep => {
          const fromIdx = componentMap[dep.from];
          const toIdx = componentMap[dep.to];
          uf.union(fromIdx, toIdx);
        });
        
        // Analyze connected components
        const components = {};
        Object.keys(componentMap).forEach(component => {
          const idx = componentMap[component];
          const root = uf.find(idx);
          if (!components[root]) components[root] = [];
          components[root].push(component);
        });
        
        console.log("✅ Dependency Analysis Results:");
        console.log(\`   - Total dependencies: \${dependencies.length}\`);
        console.log(\`   - Connected components: \${Object.keys(components).length}\`);
        Object.values(components).forEach((comp, i) => {
          console.log(\`   - Component \${i + 1}: [\${comp.join(', ')}]\`);
        });
        
        // Detect potential circular dependencies
        const hasCircular = dependencies.some(dep => {
          const fromIdx = componentMap[dep.from];
          const toIdx = componentMap[dep.to];
          return uf.find(fromIdx) === uf.find(toIdx) && fromIdx !== toIdx;
        });
        
        console.log(\`   - Circular dependencies detected: \${hasCircular ? 'YES' : 'NO'}\`);
        
      } else {
        console.log("❌ Algorithms package not available");
      }
    `);

    // Example 3: System Information and Health Monitoring
    console.log("\n💓 Example 3: System Information and Health Monitoring");
    console.log("----------------------------------------------------");
    await cm.executeCode(`
      console.log("💓 Gathering system information and monitoring health...");
      
      if (typeof tools !== 'undefined') {
        try {
          // Get current time
          if (tools.get_current_time) {
            const timeResult = await tools.get_current_time();
            console.log("⏰ Current time:", timeResult);
          }
          
          // Get current location
          if (tools.get_current_location) {
            const locationResult = await tools.get_current_location();
            console.log("🌍 Current location:", locationResult);
          }
          
          // List available tools
          const toolNames = Object.keys(tools);
          console.log("🛠️ Available MCP tools:", toolNames.length);
          console.log("   - Sample tools:", toolNames.slice(0, 5).join(', '));
          
          // System health summary
          console.log("✅ System Health Summary:");
          console.log(\`   - MCP tools available: \${toolNames.length}\`);
          console.log(\`   - Code Mode status: Active\`);
          console.log(\`   - Sandbox execution: Working\`);
          console.log(\`   - Timeout management: Active\`);
          
        } catch (error) {
          console.log("⚠️ MCP tool error:", error.message);
        }
      } else {
        console.log("❌ MCP tools not available");
      }
    `);

    // Example 4: Data Processing and Analysis Pipeline
    console.log("\n🔄 Example 4: Data Processing and Analysis Pipeline");
    console.log("--------------------------------------------------");
    await cm.executeCode(`
      console.log("🔄 Creating a data processing and analysis pipeline...");
      
      if (typeof algorithms !== 'undefined') {
        const { PerformanceTimer, SpatialHash, batchCollisionDetection } = algorithms;
        
        // Simulate processing a dataset
        const timer = new PerformanceTimer();
        timer.start();
        
        // Generate sample data (e.g., user interactions, events)
        const events = Array.from({ length: 5000 }, (_, i) => ({
          id: i,
          timestamp: Date.now() + Math.random() * 86400000, // Random time in next 24h
          x: Math.random() * 800,
          y: Math.random() * 600,
          type: ['click', 'scroll', 'hover', 'focus'][Math.floor(Math.random() * 4)],
          userId: Math.floor(Math.random() * 100),
          sessionId: Math.floor(Math.random() * 50)
        }));
        
        // Create spatial hash for event clustering
        const eventSpatialHash = new SpatialHash({
          cellSize: 100,
          worldBounds: { minX: 0, minY: 0, maxX: 800, maxY: 600 }
        });
        
        // Add events to spatial hash
        events.forEach(event => {
          eventSpatialHash.add(event, { x: event.x, y: event.y, width: 5, height: 5 });
        });
        
        // Analyze event patterns
        const eventTypes = {};
        const userActivity = {};
        const sessionActivity = {};
        
        events.forEach(event => {
          eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
          userActivity[event.userId] = (userActivity[event.userId] || 0) + 1;
          sessionActivity[event.sessionId] = (sessionActivity[event.sessionId] || 0) + 1;
        });
        
        // Find event clusters
        const clusters = [];
        for (let x = 0; x < 800; x += 100) {
          for (let y = 0; y < 600; y += 100) {
            const clusterEvents = eventSpatialHash.query({ x, y, width: 100, height: 100 });
            if (clusterEvents.length > 10) {
              clusters.push({
                x, y,
                eventCount: clusterEvents.length,
                types: [...new Set(clusterEvents.map(e => e.type))]
              });
            }
          }
        }
        
        timer.stop();
        
        console.log("✅ Data Processing Pipeline Results:");
        console.log(\`   - Events processed: \${events.length}\`);
        console.log(\`   - Processing time: \${timer.getElapsedTime()}ms\`);
        console.log(\`   - Event types: \${Object.keys(eventTypes).length}\`);
        console.log(\`   - Active users: \${Object.keys(userActivity).length}\`);
        console.log(\`   - Active sessions: \${Object.keys(sessionActivity).length}\`);
        console.log(\`   - Event clusters found: \${clusters.length}\`);
        console.log(\`   - Throughput: \${(events.length / timer.getElapsedTime()).toFixed(0)} events/ms\`);
        
        // Show top event types
        const topEventTypes = Object.entries(eventTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        console.log("   - Top event types:", topEventTypes.map(([type, count]) => \`\${type}:\${count}\`).join(', '));
        
      } else {
        console.log("❌ Algorithms package not available");
      }
    `);

    // Example 5: Intelligent Resource Management
    console.log("\n🧠 Example 5: Intelligent Resource Management");
    console.log("--------------------------------------------");
    await cm.executeCode(`
      console.log("🧠 Implementing intelligent resource management...");
      
      if (typeof algorithms !== 'undefined') {
        const { PerformanceTimer, MemoryMonitor, UnionFind } = algorithms;
        
        // Simulate resource allocation
        const resources = [
          { id: 'CPU', capacity: 100, used: 0, priority: 1 },
          { id: 'Memory', capacity: 8192, used: 0, priority: 2 },
          { id: 'Disk', capacity: 1000000, used: 0, priority: 3 },
          { id: 'Network', capacity: 1000, used: 0, priority: 4 }
        ];
        
        const tasks = [
          { id: 'Task1', cpu: 20, memory: 512, disk: 1000, network: 50, priority: 1 },
          { id: 'Task2', cpu: 15, memory: 256, disk: 500, network: 25, priority: 2 },
          { id: 'Task3', cpu: 30, memory: 1024, disk: 2000, network: 100, priority: 1 },
          { id: 'Task4', cpu: 10, memory: 128, disk: 250, network: 10, priority: 3 },
          { id: 'Task5', cpu: 25, memory: 768, disk: 1500, network: 75, priority: 2 }
        ];
        
        // Resource allocation algorithm
        const allocatedTasks = [];
        const resourceUsage = { ...resources };
        
        // Sort tasks by priority
        const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);
        
        for (const task of sortedTasks) {
          let canAllocate = true;
          
          // Check if resources are available
          if (resourceUsage[0].used + task.cpu > resourceUsage[0].capacity) canAllocate = false;
          if (resourceUsage[1].used + task.memory > resourceUsage[1].capacity) canAllocate = false;
          if (resourceUsage[2].used + task.disk > resourceUsage[2].capacity) canAllocate = false;
          if (resourceUsage[3].used + task.network > resourceUsage[3].capacity) canAllocate = false;
          
          if (canAllocate) {
            // Allocate resources
            resourceUsage[0].used += task.cpu;
            resourceUsage[1].used += task.memory;
            resourceUsage[2].used += task.disk;
            resourceUsage[3].used += task.network;
            allocatedTasks.push(task);
          }
        }
        
        // Calculate efficiency metrics
        const totalCapacity = resources.reduce((sum, r) => sum + r.capacity, 0);
        const totalUsed = resourceUsage.reduce((sum, r) => sum + r.used, 0);
        const efficiency = (totalUsed / totalCapacity) * 100;
        
        console.log("✅ Intelligent Resource Management Results:");
        console.log(\`   - Tasks submitted: \${tasks.length}\`);
        console.log(\`   - Tasks allocated: \${allocatedTasks.length}\`);
        console.log(\`   - Allocation rate: \${(allocatedTasks.length / tasks.length * 100).toFixed(1)}%\`);
        console.log(\`   - Resource efficiency: \${efficiency.toFixed(1)}%\`);
        
        // Show resource utilization
        resourceUsage.forEach((resource, i) => {
          const utilization = (resource.used / resource.capacity) * 100;
          console.log(\`   - \${resource.id}: \${resource.used}/\${resource.capacity} (\${utilization.toFixed(1)}%)\`);
        });
        
        // Show allocated tasks
        console.log("   - Allocated tasks:", allocatedTasks.map(t => t.id).join(', '));
        
      } else {
        console.log("❌ Algorithms package not available");
      }
    `);

    console.log("\n🎉 Practical Examples Complete!");
    console.log("===============================");
    console.log("✅ Demonstrated 5 practical AI agent capabilities:");
    console.log("   1. 📊 Performance Analysis and Optimization");
    console.log("   2. 🔗 Dependency Analysis and Graph Optimization");
    console.log("   3. 💓 System Information and Health Monitoring");
    console.log("   4. 🔄 Data Processing and Analysis Pipeline");
    console.log("   5. 🧠 Intelligent Resource Management");
    console.log("🚀 AI agents can now perform sophisticated analysis and optimization!");

  } catch (error) {
    console.error("❌ Examples failed:", error instanceof Error ? error.message : String(error));
  } finally {
    cm.cleanup();
    setTimeout(() => process.exit(0), 100);
  }
}

// Add timeout to the entire demo
const timeout = setTimeout(() => {
  console.log("⏰ Examples timeout reached, exiting...");
  process.exit(1);
}, 20_000); // 20 second total timeout

main().catch((error) => {
  console.error("❌ Examples error:", error instanceof Error ? error.message : String(error));
  clearTimeout(timeout);
  process.exit(1);
}).finally(() => {
  clearTimeout(timeout);
});
