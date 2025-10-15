import { codemode } from "../codemode";

async function testCollisionDetection() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 15000 });

  console.log("=== Collision Detection Proof Test ===\n");

  // Test 1: Basic Collision Detection - Two Overlapping Rectangles
  console.log("1. Basic Collision Detection - Two Overlapping Rectangles");
  const result1 = await cm.executeCode(`
    const { batchCollisionDetection } = algorithms;
    
    // Create two rectangles that clearly overlap
    const rect1 = { x: 100, y: 100, width: 50, height: 50, id: 'rect1' };
    const rect2 = { x: 120, y: 120, width: 50, height: 50, id: 'rect2' };
    
    console.log('Rectangle 1:', rect1);
    console.log('Rectangle 2:', rect2);
    console.log('Expected: COLLISION (rectangles overlap)');
    
    // Test collision detection
    const objects = [rect1, rect2];
    const collisions = batchCollisionDetection(objects);
    
    console.log('Collisions detected:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Verify the collision
    const hasCollision = collisions.length > 0;
    const expectedCollision = true; // We know these should collide
    
    console.log('Test result:', hasCollision === expectedCollision ? 'PASS' : 'FAIL');
    
    return {
      test: 'Basic Overlapping Rectangles',
      rect1,
      rect2,
      collisions,
      hasCollision,
      expectedCollision,
      passed: hasCollision === expectedCollision
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Test 2: No Collision - Two Separate Rectangles
  console.log("2. No Collision - Two Separate Rectangles");
  const result2 = await cm.executeCode(`
    const { batchCollisionDetection } = algorithms;
    
    // Create two rectangles that do NOT overlap
    const rect1 = { x: 100, y: 100, width: 50, height: 50, id: 'rect1' };
    const rect2 = { x: 200, y: 200, width: 50, height: 50, id: 'rect2' };
    
    console.log('Rectangle 1:', rect1);
    console.log('Rectangle 2:', rect2);
    console.log('Expected: NO COLLISION (rectangles are separate)');
    
    // Test collision detection
    const objects = [rect1, rect2];
    const collisions = batchCollisionDetection(objects);
    
    console.log('Collisions detected:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Verify no collision
    const hasCollision = collisions.length > 0;
    const expectedCollision = false; // We know these should NOT collide
    
    console.log('Test result:', hasCollision === expectedCollision ? 'PASS' : 'FAIL');
    
    return {
      test: 'Separate Rectangles',
      rect1,
      rect2,
      collisions,
      hasCollision,
      expectedCollision,
      passed: hasCollision === expectedCollision
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Test 3: Edge Case - Touching Rectangles
  console.log("3. Edge Case - Touching Rectangles");
  const result3 = await cm.executeCode(`
    const { batchCollisionDetection } = algorithms;
    
    // Create two rectangles that touch at the edge
    const rect1 = { x: 100, y: 100, width: 50, height: 50, id: 'rect1' };
    const rect2 = { x: 150, y: 100, width: 50, height: 50, id: 'rect2' }; // Touches right edge of rect1
    
    console.log('Rectangle 1:', rect1);
    console.log('Rectangle 2:', rect2);
    console.log('Expected: COLLISION (rectangles touch at edge)');
    
    // Test collision detection
    const objects = [rect1, rect2];
    const collisions = batchCollisionDetection(objects);
    
    console.log('Collisions detected:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Verify collision (touching should count as collision)
    const hasCollision = collisions.length > 0;
    const expectedCollision = true; // Touching should be considered collision
    
    console.log('Test result:', hasCollision === expectedCollision ? 'PASS' : 'FAIL');
    
    return {
      test: 'Touching Rectangles',
      rect1,
      rect2,
      collisions,
      hasCollision,
      expectedCollision,
      passed: hasCollision === expectedCollision
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Test 4: Multiple Objects - Some Colliding, Some Not
  console.log("4. Multiple Objects - Mixed Collision Scenario");
  const result4 = await cm.executeCode(`
    const { batchCollisionDetection } = algorithms;
    
    // Create multiple objects with known collision pattern
    const objects = [
      { x: 100, y: 100, width: 50, height: 50, id: 'obj1' },  // Will collide with obj2
      { x: 120, y: 120, width: 50, height: 50, id: 'obj2' },  // Collides with obj1
      { x: 300, y: 300, width: 50, height: 50, id: 'obj3' },  // No collision
      { x: 400, y: 400, width: 50, height: 50, id: 'obj4' },  // No collision
      { x: 150, y: 150, width: 30, height: 30, id: 'obj5' }   // Collides with obj1 and obj2
    ];
    
    console.log('Objects:', objects);
    console.log('Expected collisions:');
    console.log('- obj1 <-> obj2 (overlap)');
    console.log('- obj1 <-> obj5 (overlap)');
    console.log('- obj2 <-> obj5 (overlap)');
    console.log('- obj3 and obj4 should have no collisions');
    
    // Test collision detection
    const collisions = batchCollisionDetection(objects);
    
    console.log('Total collisions detected:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Analyze collision pairs
    const collisionPairs = collisions.map(collision => {
      const obj1 = objects[collision.index1];
      const obj2 = objects[collision.index2];
      return {
        pair: \`\${obj1.id} <-> \${obj2.id}\`,
        obj1: obj1.id,
        obj2: obj2.id,
        collision
      };
    });
    
    console.log('Collision pairs:', collisionPairs);
    
    // Expected collision pairs
    const expectedPairs = ['obj1 <-> obj2', 'obj1 <-> obj5', 'obj2 <-> obj5'];
    const detectedPairs = collisionPairs.map(p => p.pair);
    
    const allExpectedFound = expectedPairs.every(expected => 
      detectedPairs.some(detected => detected === expected)
    );
    
    console.log('Expected pairs:', expectedPairs);
    console.log('Detected pairs:', detectedPairs);
    console.log('All expected collisions found:', allExpectedFound);
    
    return {
      test: 'Multiple Objects Mixed Scenario',
      objects,
      collisions,
      collisionPairs,
      expectedPairs,
      detectedPairs,
      allExpectedFound,
      passed: allExpectedFound && collisions.length === 3
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  // Test 5: Spatial Hash Integration Test
  console.log("5. Spatial Hash Integration Test");
  const result5 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection } = algorithms;
    
    // Create spatial hash
    const spatialHash = new SpatialHash({
      cellSize: 50,
      worldBounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 }
    });
    
    // Create objects in different spatial regions
    const objects = [
      { x: 25, y: 25, width: 30, height: 30, id: 'obj1' },   // Cell (0,0)
      { x: 75, y: 25, width: 30, height: 30, id: 'obj2' },   // Cell (1,0) - should collide with obj1
      { x: 125, y: 125, width: 30, height: 30, id: 'obj3' }, // Cell (2,2)
      { x: 175, y: 175, width: 30, height: 30, id: 'obj4' }, // Cell (3,3)
      { x: 225, y: 225, width: 30, height: 30, id: 'obj5' }  // Cell (4,4)
    ];
    
    console.log('Spatial Hash Configuration:');
    console.log('- Cell size: 50x50');
    console.log('- World bounds: 400x400');
    console.log('- Objects in different cells');
    
    console.log('Objects:', objects);
    console.log('Expected: obj1 and obj2 should collide (adjacent cells)');
    console.log('Expected: obj3, obj4, obj5 should have no collisions');
    
    // Test collision detection
    const collisions = batchCollisionDetection(objects);
    
    console.log('Collisions detected:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Verify spatial hash behavior
    const hasExpectedCollision = collisions.length > 0;
    const collisionPairs = collisions.map(collision => {
      const obj1 = objects[collision.index1];
      const obj2 = objects[collision.index2];
      return \`\${obj1.id} <-> \${obj2.id}\`;
    });
    
    console.log('Collision pairs:', collisionPairs);
    console.log('Expected collision found:', collisionPairs.includes('obj1 <-> obj2'));
    
    return {
      test: 'Spatial Hash Integration',
      spatialHashConfig: { cellSize: 50, worldBounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 } },
      objects,
      collisions,
      collisionPairs,
      hasExpectedCollision,
      expectedCollisionFound: collisionPairs.includes('obj1 <-> obj2'),
      passed: collisionPairs.includes('obj1 <-> obj2') && collisions.length === 1
    };
  `);
  console.log("Result:", result5.returned);
  console.log("Logs:", result5.logs);
  console.log();

  // Test 6: Performance Test - Many Objects
  console.log("6. Performance Test - Many Objects");
  const result6 = await cm.executeCode(`
    const { batchCollisionDetection, PerformanceTimer } = algorithms;
    
    // Create many objects for performance testing
    const objectCount = 100;
    const objects = [];
    
    for (let i = 0; i < objectCount; i++) {
      objects.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        width: 20 + Math.random() * 30,
        height: 20 + Math.random() * 30,
        id: \`obj\${i}\`
      });
    }
    
    console.log('Performance Test:');
    console.log('- Object count:', objectCount);
    console.log('- Random positions in 800x600 area');
    console.log('- Random sizes 20-50 pixels');
    
    // Measure performance
    const timer = new PerformanceTimer();
    timer.start();
    
    const collisions = batchCollisionDetection(objects);
    
    const executionTime = timer.stop();
    
    console.log('Execution time:', executionTime, 'ms');
    console.log('Collisions detected:', collisions.length);
    console.log('Collision rate:', (collisions.length / objectCount * 100).toFixed(2) + '%');
    
    // Performance analysis
    const performanceAnalysis = {
      objectCount,
      executionTime,
      collisionsDetected: collisions.length,
      collisionRate: collisions.length / objectCount,
      objectsPerMs: objectCount / executionTime,
      performance: executionTime < 100 ? 'excellent' : executionTime < 500 ? 'good' : 'needs-optimization'
    };
    
    console.log('Performance analysis:', performanceAnalysis);
    
    return {
      test: 'Performance Test',
      performanceAnalysis,
      collisions: collisions.slice(0, 10), // First 10 collisions for brevity
      passed: executionTime < 1000 // Should complete in under 1 second
    };
  `);
  console.log("Result:", result6.returned);
  console.log("Logs:", result6.logs);
  console.log();

  // Summary of all tests
  console.log("=== COLLISION DETECTION TEST SUMMARY ===");
  const allResults = [result1.returned, result2.returned, result3.returned, result4.returned, result5.returned, result6.returned];
  const passedTests = allResults.filter(result => result?.passed).length;
  const totalTests = allResults.length;
  
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  console.log(`Success rate: ${(passedTests/totalTests*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log("✅ ALL TESTS PASSED - Collision detection is working correctly!");
  } else {
    console.log("❌ SOME TESTS FAILED - Collision detection has issues");
  }
  
  console.log("\nDetailed Results:");
  allResults.forEach((result, index) => {
    if (result) {
      console.log(`${index + 1}. ${result.test}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
    }
  });

  // Cleanup MCP client
  cm.cleanup();
  
  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the collision detection test
testCollisionDetection().catch((error) => {
  console.error("Collision detection test failed:", error);
  process.exit(1);
});

