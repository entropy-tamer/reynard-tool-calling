import { codemode } from "../codemode";

async function demonstrateAlgorithms() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 15000 });

  console.log("=== Algorithms Package Code Mode Demo ===\n");

  // Example 1: Union-Find for Connected Components
  console.log("1. Union-Find: Finding Connected Components");
  const result1 = await cm.executeCode(`
    const { UnionFind } = algorithms;
    
    // Create a union-find structure for 10 nodes
    const uf = new UnionFind(10);
    
    // Connect some nodes to form components
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(3, 4);
    uf.union(4, 5);
    uf.union(6, 7);
    uf.union(7, 8);
    
    // Find connected components
    const components = [];
    for (let i = 0; i < 10; i++) {
      const root = uf.find(i);
      if (!components[root]) {
        components[root] = [];
      }
      components[root].push(i);
    }
    
    const connectedComponents = Object.values(components).filter(comp => comp.length > 1);
    
    console.log('Connected components:', connectedComponents);
    console.log('Total components:', connectedComponents.length);
    
    return {
      connectedComponents,
      totalComponents: connectedComponents.length,
      stats: uf.getStats()
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Example 2: Spatial Hash for Collision Detection
  console.log("2. Spatial Hash: Collision Detection");
  const result2 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection } = algorithms;
    
    // Create a spatial hash for collision detection
    const spatialHash = new SpatialHash({
      cellSize: 50,
      worldBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
    });
    
    // Create some game objects with AABBs
    const objects = [
      { id: 1, x: 100, y: 100, width: 30, height: 30 },
      { id: 2, x: 120, y: 110, width: 25, height: 25 },
      { id: 3, x: 200, y: 200, width: 40, height: 40 },
      { id: 4, x: 220, y: 210, width: 35, height: 35 },
      { id: 5, x: 500, y: 500, width: 50, height: 50 }
    ];
    
    // Use batch collision detection
    const collisions = batchCollisionDetection(objects);
    
    console.log('Objects:', objects.length);
    console.log('Collisions found:', collisions.length);
    console.log('Collision pairs:', collisions);
    
    return {
      objectCount: objects.length,
      collisionPairs: collisions,
      spatialHashStats: spatialHash.getStats()
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Example 3: Performance Monitoring with Timer
  console.log("3. Performance Monitoring: Algorithm Comparison");
  const result3 = await cm.executeCode(`
    const { PerformanceTimer } = algorithms;
    
    // Compare different sorting algorithms
    const testData = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
    
    // Bubble sort (inefficient)
    const bubbleSort = (arr) => {
      const sorted = [...arr];
      for (let i = 0; i < sorted.length; i++) {
        for (let j = 0; j < sorted.length - i - 1; j++) {
          if (sorted[j] > sorted[j + 1]) {
            [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
          }
        }
      }
      return sorted;
    };
    
    // Quick sort (efficient)
    const quickSort = (arr) => {
      if (arr.length <= 1) return arr;
      const pivot = arr[Math.floor(arr.length / 2)];
      const left = arr.filter(x => x < pivot);
      const right = arr.filter(x => x > pivot);
      return [...quickSort(left), pivot, ...quickSort(right)];
    };
    
    // Measure performance using PerformanceTimer
    const timer = new PerformanceTimer();
    
    timer.start();
    const bubbleResult = bubbleSort(testData);
    const bubbleTime = timer.stop();
    
    timer.start();
    const quickResult = quickSort(testData);
    const quickTime = timer.stop();
    
    console.log('Bubble Sort Performance:');
    console.log(\`Time: \${bubbleTime}ms\`);
    
    console.log('Quick Sort Performance:');
    console.log(\`Time: \${quickTime}ms\`);
    
    const speedup = bubbleTime / quickTime;
    console.log(\`Quick sort is \${speedup.toFixed(2)}x faster than bubble sort\`);
    
    return {
      bubbleTime,
      quickTime,
      speedup: speedup,
      dataSize: testData.length,
      totalElapsed: timer.getElapsed()
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Example 4: Memory Monitoring
  console.log("4. Memory Monitoring: Memory Usage Tracking");
  const result4 = await cm.executeCode(`
    const { MemoryMonitor } = algorithms;
    
    // Create a memory monitor
    const memoryMonitor = new MemoryMonitor();
    
    // Simulate memory-intensive operations
    const createLargeArray = (size) => {
      const before = memoryMonitor.measure();
      const arr = new Array(size).fill(0).map((_, i) => ({ id: i, data: Math.random() }));
      const after = memoryMonitor.measure();
      return { arr, memoryDelta: after - before };
    };
    
    const processArray = (arr) => {
      const before = memoryMonitor.measure();
      const processed = arr.map(item => ({ ...item, processed: true, value: item.data * 2 }));
      const after = memoryMonitor.measure();
      return { processed, memoryDelta: after - before };
    };
    
    // Create and process arrays of different sizes
    const sizes = [1000, 5000, 10000];
    const results = [];
    
    sizes.forEach(size => {
      console.log(\`Processing array of size \${size}...\`);
      const { arr, memoryDelta: createDelta } = createLargeArray(size);
      const { processed, memoryDelta: processDelta } = processArray(arr);
      results.push({ 
        size, 
        originalLength: arr.length, 
        processedLength: processed.length,
        createMemoryDelta: createDelta,
        processMemoryDelta: processDelta
      });
    });
    
    console.log('Memory monitoring results:');
    console.log('Results:', results);
    
    return {
      results,
      averageUsage: memoryMonitor.getAverageUsage()
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  // Example 5: Geometry Operations
  console.log("5. Geometry Operations: Point and Circle Calculations");
  const result5 = await cm.executeCode(`
    const { PointOps, CircleOps, RectangleOps } = algorithms;
    
    // Create some geometric shapes
    const points = [
      { x: 0, y: 0 },
      { x: 3, y: 4 },
      { x: 6, y: 8 },
      { x: 10, y: 10 }
    ];
    
    const circles = [
      { x: 5, y: 5, radius: 3 },
      { x: 8, y: 8, radius: 2 },
      { x: 2, y: 2, radius: 4 }
    ];
    
    const rectangles = [
      { x: 1, y: 1, width: 4, height: 3 },
      { x: 7, y: 7, width: 2, height: 2 }
    ];
    
    // Calculate distances between points
    const distances = [];
    for (let i = 0; i < points.length - 1; i++) {
      const distance = PointOps.distance(points[i], points[i + 1]);
      distances.push({
        from: points[i],
        to: points[i + 1],
        distance: distance
      });
    }
    
    // Calculate circle areas and circumferences
    const circleStats = circles.map(circle => ({
      circle,
      area: CircleOps.area(circle),
      circumference: CircleOps.circumference(circle)
    }));
    
    // Calculate rectangle areas and perimeters
    const rectangleStats = rectangles.map(rect => ({
      rectangle: rect,
      area: RectangleOps.area(rect),
      perimeter: RectangleOps.perimeter(rect)
    }));
    
    console.log('Point distances:', distances.length);
    console.log('Circle statistics:', circleStats.length);
    console.log('Rectangle statistics:', rectangleStats.length);
    
    return {
      pointDistances: distances,
      circleStats,
      rectangleStats,
      totalShapes: points.length + circles.length + rectangles.length
    };
  `);
  console.log("Result:", result5.returned);
  console.log("Logs:", result5.logs);
  console.log();

  console.log("=== Algorithms Demo Complete ===");
  
  // Cleanup MCP client
  cm.cleanup();
  
  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the demo
demonstrateAlgorithms().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
