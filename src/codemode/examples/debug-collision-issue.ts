import { codemode } from "../codemode";

async function debugCollisionIssue() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 10000 });

  console.log("=== Debug Collision Detection Issue ===\n");

  const result = await cm.executeCode(`
    const { batchCollisionDetection } = algorithms;
    
    // The problematic objects from Test 4
    const obj1 = { x: 100, y: 100, width: 50, height: 50, id: 'obj1' };
    const obj2 = { x: 120, y: 120, width: 50, height: 50, id: 'obj2' };
    const obj5 = { x: 150, y: 150, width: 30, height: 30, id: 'obj5' };
    
    console.log('Object 1 (obj1):', obj1);
    console.log('Object 2 (obj2):', obj2);
    console.log('Object 5 (obj5):', obj5);
    
    // Calculate bounding boxes for visualization
    const getBounds = (obj) => ({
      left: obj.x,
      right: obj.x + obj.width,
      top: obj.y,
      bottom: obj.y + obj.height
    });
    
    const bounds1 = getBounds(obj1);
    const bounds2 = getBounds(obj2);
    const bounds5 = getBounds(obj5);
    
    console.log('\\nBounding boxes:');
    console.log('obj1 bounds:', bounds1);
    console.log('obj2 bounds:', bounds2);
    console.log('obj5 bounds:', bounds5);
    
    // Manual collision detection logic
    const checkCollision = (objA, objB) => {
      const boundsA = getBounds(objA);
      const boundsB = getBounds(objB);
      
      const collides = !(
        boundsA.right <= boundsB.left ||
        boundsA.left >= boundsB.right ||
        boundsA.bottom <= boundsB.top ||
        boundsA.top >= boundsB.bottom
      );
      
      return collides;
    };
    
    console.log('\\nManual collision checks:');
    const collision12 = checkCollision(obj1, obj2);
    const collision15 = checkCollision(obj1, obj5);
    const collision25 = checkCollision(obj2, obj5);
    
    console.log('obj1 <-> obj2 collision:', collision12);
    console.log('obj1 <-> obj5 collision:', collision15);
    console.log('obj2 <-> obj5 collision:', collision25);
    
    // Test with batchCollisionDetection
    const objects = [obj1, obj2, obj5];
    const collisions = batchCollisionDetection(objects);
    
    console.log('\\nBatch collision detection results:');
    console.log('Total collisions:', collisions.length);
    console.log('Collision details:', collisions);
    
    // Map collisions to object pairs
    const collisionPairs = collisions.map(collision => {
      const objA = objects[collision.index1];
      const objB = objects[collision.index2];
      return \`\${objA.id} <-> \${objB.id}\`;
    });
    
    console.log('Detected collision pairs:', collisionPairs);
    
    // Check if obj1 <-> obj5 collision is missing
    const missingCollision = !collisionPairs.includes('obj1 <-> obj5');
    console.log('\\nAnalysis:');
    console.log('obj1 <-> obj5 collision missing:', missingCollision);
    
    if (missingCollision) {
      console.log('\\nDetailed analysis of obj1 <-> obj5:');
      console.log('obj1: x=100, y=100, w=50, h=50 (right=150, bottom=150)');
      console.log('obj5: x=150, y=150, w=30, h=30 (right=180, bottom=180)');
      console.log('obj1 right edge (150) touches obj5 left edge (150)');
      console.log('obj1 bottom edge (150) touches obj5 top edge (150)');
      console.log('This should be detected as a collision!');
    }
    
    return {
      objects: [obj1, obj2, obj5],
      manualCollisions: { collision12, collision15, collision25 },
      batchCollisions: collisions,
      collisionPairs,
      missingCollision,
      analysis: {
        obj1Bounds: bounds1,
        obj2Bounds: bounds2,
        obj5Bounds: bounds5
      }
    };
  `);
  
  console.log("Debug Result:", result.returned);
  console.log("Debug Logs:", result.logs);
  
  // Cleanup
  cm.cleanup();
  setTimeout(() => process.exit(0), 100);
}

debugCollisionIssue().catch(console.error);
