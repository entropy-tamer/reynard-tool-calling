import { codemode } from "../codemode";

async function demonstrateSpatialNavigation() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 20000 });

  console.log("=== Spatial Hash Navigation: Random Room with Obstacles ===\n");

  // Scenario 1: Basic Room Navigation with Spatial Hash
  console.log("1. Basic Room Navigation with Spatial Hash");
  const result1 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create a random room layout
    const roomWidth = 800;
    const roomHeight = 600;
    
    // Define room boundaries
    const roomBoundaries = [
      { x: 0, y: 0, width: roomWidth, height: 10, type: 'wall', id: 'top-wall' },
      { x: 0, y: roomHeight - 10, width: roomWidth, height: 10, type: 'wall', id: 'bottom-wall' },
      { x: 0, y: 0, width: 10, height: roomHeight, type: 'wall', id: 'left-wall' },
      { x: roomWidth - 10, y: 0, width: 10, height: roomHeight, type: 'wall', id: 'right-wall' }
    ];
    
    // Generate random obstacles
    const obstacles = [
      { x: 150, y: 100, width: 80, height: 60, type: 'furniture', id: 'desk-1' },
      { x: 300, y: 200, width: 50, height: 50, type: 'furniture', id: 'chair-1' },
      { x: 500, y: 150, width: 100, height: 40, type: 'furniture', id: 'table-1' },
      { x: 200, y: 400, width: 60, height: 80, type: 'furniture', id: 'cabinet-1' },
      { x: 600, y: 300, width: 70, height: 70, type: 'furniture', id: 'plant-1' },
      { x: 100, y: 300, width: 40, height: 40, type: 'furniture', id: 'lamp-1' }
    ];
    
    // Create spatial hash for efficient collision detection
    const spatialHash = new SpatialHash({
      cellSize: 50, // 50x50 pixel cells
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Define the AI agent
    const agent = {
      id: 'navigator-agent',
      x: 50,  // Start position
      y: 50,
      width: 20,
      height: 20,
      radius: 15,
      targetX: 750, // Target position
      targetY: 550,
      speed: 2,
      path: []
    };
    
    // Add all objects to spatial hash
    const allObjects = [...roomBoundaries, ...obstacles, agent];
    
    // Function to check if a position is valid (no collisions)
    const isValidPosition = (x, y, width = agent.width, height = agent.height) => {
      const testObject = { x, y, width, height, id: 'test' };
      const collisions = batchCollisionDetection([testObject, ...allObjects.filter(obj => obj.id !== 'test')]);
      return collisions.length === 0;
    };
    
    // Simple pathfinding using spatial hash
    const findPath = (startX, startY, endX, endY) => {
      const path = [];
      let currentX = startX;
      let currentY = startY;
      
      // Add start position
      path.push({ x: currentX, y: currentY });
      
      // Simple pathfinding: move towards target, avoiding obstacles
      const maxSteps = 1000;
      let steps = 0;
      
      while (steps < maxSteps) {
        const dx = endX - currentX;
        const dy = endY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're close enough to target, we're done
        if (distance < 20) {
          path.push({ x: endX, y: endY });
          break;
        }
        
        // Calculate next position
        const moveX = (dx / distance) * agent.speed;
        const moveY = (dy / distance) * agent.speed;
        
        let nextX = currentX + moveX;
        let nextY = currentY + moveY;
        
        // Check if next position is valid
        if (isValidPosition(nextX, nextY)) {
          currentX = nextX;
          currentY = nextY;
          path.push({ x: currentX, y: currentY });
        } else {
          // Try to find alternative path around obstacle
          const alternatives = [
            { x: currentX + agent.speed, y: currentY },
            { x: currentX - agent.speed, y: currentY },
            { x: currentX, y: currentY + agent.speed },
            { x: currentX, y: currentY - agent.speed },
            { x: currentX + agent.speed, y: currentY + agent.speed },
            { x: currentX - agent.speed, y: currentY - agent.speed }
          ];
          
          let foundAlternative = false;
          for (const alt of alternatives) {
            if (isValidPosition(alt.x, alt.y)) {
              currentX = alt.x;
              currentY = alt.y;
              path.push({ x: currentX, y: currentY });
              foundAlternative = true;
              break;
            }
          }
          
          if (!foundAlternative) {
            console.log('No valid path found, stopping at step', steps);
            break;
          }
        }
        
        steps++;
      }
      
      return path;
    };
    
    // Find path from start to target
    const navigationPath = findPath(agent.x, agent.y, agent.targetX, agent.targetY);
    
    // Analyze the navigation
    const navigationAnalysis = {
      startPosition: { x: agent.x, y: agent.y },
      targetPosition: { x: agent.targetX, y: agent.targetY },
      pathLength: navigationPath.length,
      totalDistance: 0,
      obstaclesAvoided: 0,
      efficiency: 0,
      roomUtilization: 0
    };
    
    // Calculate total distance
    for (let i = 1; i < navigationPath.length; i++) {
      const prev = navigationPath[i - 1];
      const curr = navigationPath[i];
      navigationAnalysis.totalDistance += PointOps.distance(prev, curr);
    }
    
    // Calculate direct distance
    const directDistance = PointOps.distance(
      { x: agent.x, y: agent.y },
      { x: agent.targetX, y: agent.targetY }
    );
    
    navigationAnalysis.efficiency = directDistance / navigationAnalysis.totalDistance;
    navigationAnalysis.roomUtilization = (obstacles.length / ((roomWidth * roomHeight) / 10000)) * 100;
    
    console.log('Navigation analysis:');
    console.log('Start position:', navigationAnalysis.startPosition);
    console.log('Target position:', navigationAnalysis.targetPosition);
    console.log('Path length:', navigationAnalysis.pathLength, 'steps');
    console.log('Total distance:', navigationAnalysis.totalDistance.toFixed(2), 'units');
    console.log('Direct distance:', directDistance.toFixed(2), 'units');
    console.log('Path efficiency:', (navigationAnalysis.efficiency * 100).toFixed(1) + '%');
    console.log('Room utilization:', navigationAnalysis.roomUtilization.toFixed(1) + '%');
    console.log('Obstacles in room:', obstacles.length);
    
    return {
      navigationAnalysis,
      path: navigationPath,
      obstacles,
      roomDimensions: { width: roomWidth, height: roomHeight },
      spatialHashConfig: { cellSize: 50, worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight } }
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Scenario 2: Multi-Agent Navigation with Collision Avoidance
  console.log("2. Multi-Agent Navigation with Collision Avoidance");
  const result2 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create a more complex room with multiple agents
    const roomWidth = 1000;
    const roomHeight = 800;
    
    // Room boundaries
    const roomBoundaries = [
      { x: 0, y: 0, width: roomWidth, height: 15, type: 'wall', id: 'top-wall' },
      { x: 0, y: roomHeight - 15, width: roomWidth, height: 15, type: 'wall', id: 'bottom-wall' },
      { x: 0, y: 0, width: 15, height: roomHeight, type: 'wall', id: 'left-wall' },
      { x: roomWidth - 15, y: 0, width: 15, height: roomHeight, type: 'wall', id: 'right-wall' }
    ];
    
    // More complex obstacle layout
    const obstacles = [
      { x: 200, y: 150, width: 120, height: 80, type: 'furniture', id: 'desk-1' },
      { x: 400, y: 200, width: 80, height: 60, type: 'furniture', id: 'table-1' },
      { x: 600, y: 100, width: 100, height: 100, type: 'furniture', id: 'cabinet-1' },
      { x: 150, y: 400, width: 60, height: 60, type: 'furniture', id: 'chair-1' },
      { x: 500, y: 450, width: 80, height: 40, type: 'furniture', id: 'bench-1' },
      { x: 750, y: 300, width: 50, height: 50, type: 'furniture', id: 'plant-1' },
      { x: 300, y: 600, width: 100, height: 60, type: 'furniture', id: 'sofa-1' },
      { x: 100, y: 250, width: 40, height: 40, type: 'furniture', id: 'lamp-1' }
    ];
    
    // Multiple AI agents with different targets
    const agents = [
      { id: 'agent-1', x: 50, y: 50, targetX: 950, targetY: 750, width: 20, height: 20, speed: 2, color: 'red' },
      { id: 'agent-2', x: 950, y: 50, targetX: 50, targetY: 750, width: 20, height: 20, speed: 2, color: 'blue' },
      { id: 'agent-3', x: 50, y: 750, targetX: 950, targetY: 50, width: 20, height: 20, speed: 2, color: 'green' },
      { id: 'agent-4', x: 950, y: 750, targetX: 50, targetY: 50, width: 20, height: 20, speed: 2, color: 'yellow' }
    ];
    
    // Create spatial hash for multi-agent collision detection
    const spatialHash = new SpatialHash({
      cellSize: 40,
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Function to check collisions for multiple agents
    const checkMultiAgentCollisions = (agentPositions) => {
      const allObjects = [...roomBoundaries, ...obstacles, ...agentPositions];
      const collisions = batchCollisionDetection(allObjects);
      
      // Separate agent-agent collisions from agent-obstacle collisions
      const agentCollisions = [];
      const obstacleCollisions = [];
      
      collisions.forEach(collision => {
        const obj1 = allObjects[collision.index1];
        const obj2 = allObjects[collision.index2];
        
        if (obj1.id && obj1.id.startsWith('agent-') && obj2.id && obj2.id.startsWith('agent-')) {
          agentCollisions.push({ agent1: obj1.id, agent2: obj2.id, collision });
        } else if ((obj1.id && obj1.id.startsWith('agent-') && obj2.type === 'furniture') ||
                   (obj2.id && obj2.id.startsWith('agent-') && obj1.type === 'furniture')) {
          const agent = obj1.id && obj1.id.startsWith('agent-') ? obj1 : obj2;
          obstacleCollisions.push({ agent: agent.id, obstacle: obj1.id === agent.id ? obj2.id : obj1.id, collision });
        }
      });
      
      return { agentCollisions, obstacleCollisions };
    };
    
    // Simulate multi-agent navigation
    const simulationSteps = 200;
    const simulationResults = [];
    
    // Initialize agent positions
    let currentAgentPositions = agents.map(agent => ({ ...agent }));
    
    for (let step = 0; step < simulationSteps; step++) {
      const stepResults = {
        step,
        agentPositions: [],
        collisions: { agentCollisions: [], obstacleCollisions: [] },
        distances: []
      };
      
      // Move each agent towards their target
      currentAgentPositions = currentAgentPositions.map(agent => {
        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
          // Agent reached target
          return { ...agent, reached: true };
        }
        
        // Calculate movement
        const moveX = (dx / distance) * agent.speed;
        const moveY = (dy / distance) * agent.speed;
        
        let newX = agent.x + moveX;
        let newY = agent.y + moveY;
        
        // Check if new position is valid
        const testAgent = { ...agent, x: newX, y: newY };
        const tempPositions = currentAgentPositions.map(a => a.id === agent.id ? testAgent : a);
        const collisions = checkMultiAgentCollisions([...roomBoundaries, ...obstacles, ...tempPositions]);
        
        if (collisions.obstacleCollisions.length === 0 && collisions.agentCollisions.length === 0) {
          // Valid position, move agent
          agent.x = newX;
          agent.y = newY;
        } else {
          // Try alternative movement (simple avoidance)
          const alternatives = [
            { x: agent.x + agent.speed, y: agent.y },
            { x: agent.x - agent.speed, y: agent.y },
            { x: agent.x, y: agent.y + agent.speed },
            { x: agent.x, y: agent.y - agent.speed }
          ];
          
          for (const alt of alternatives) {
            const testAlt = { ...agent, x: alt.x, y: alt.y };
            const tempAltPositions = currentAgentPositions.map(a => a.id === agent.id ? testAlt : a);
            const altCollisions = checkMultiAgentCollisions([...roomBoundaries, ...obstacles, ...tempAltPositions]);
            
            if (altCollisions.obstacleCollisions.length === 0 && altCollisions.agentCollisions.length === 0) {
              agent.x = alt.x;
              agent.y = alt.y;
              break;
            }
          }
        }
        
        // Calculate distance to target
        const targetDistance = PointOps.distance(
          { x: agent.x, y: agent.y },
          { x: agent.targetX, y: agent.targetY }
        );
        
        stepResults.distances.push({
          agent: agent.id,
          distance: targetDistance,
          reached: targetDistance < 10
        });
        
        return agent;
      });
      
      // Check for collisions after movement
      const collisions = checkMultiAgentCollisions([...roomBoundaries, ...obstacles, ...currentAgentPositions]);
      stepResults.collisions = collisions;
      stepResults.agentPositions = currentAgentPositions.map(agent => ({ 
        id: agent.id, 
        x: agent.x, 
        y: agent.y, 
        reached: agent.reached || false 
      }));
      
      simulationResults.push(stepResults);
      
      // Check if all agents reached their targets
      const allReached = currentAgentPositions.every(agent => agent.reached || 
        PointOps.distance({ x: agent.x, y: agent.y }, { x: agent.targetX, y: agent.targetY }) < 10
      );
      
      if (allReached) {
        console.log('All agents reached their targets at step', step);
        break;
      }
    }
    
    // Analyze multi-agent navigation
    const multiAgentAnalysis = {
      totalAgents: agents.length,
      totalSteps: simulationResults.length,
      totalCollisions: simulationResults.reduce((sum, step) => 
        sum + step.collisions.agentCollisions.length + step.collisions.obstacleCollisions.length, 0
      ),
      agentsReached: currentAgentPositions.filter(agent => 
        PointOps.distance({ x: agent.x, y: agent.y }, { x: agent.targetX, y: agent.targetY }) < 10
      ).length,
      averageDistance: 0,
      navigationEfficiency: 0
    };
    
    // Calculate average distance to targets
    const finalDistances = simulationResults[simulationResults.length - 1]?.distances || [];
    multiAgentAnalysis.averageDistance = finalDistances.reduce((sum, d) => sum + d.distance, 0) / finalDistances.length;
    
    // Calculate navigation efficiency
    const totalDirectDistance = agents.reduce((sum, agent) => 
      sum + PointOps.distance({ x: agent.x, y: agent.y }, { x: agent.targetX, y: agent.targetY }), 0
    );
    const totalActualDistance = simulationResults.reduce((sum, step) => 
      sum + step.distances.reduce((stepSum, d) => stepSum + d.distance, 0), 0
    );
    multiAgentAnalysis.navigationEfficiency = totalDirectDistance / totalActualDistance;
    
    console.log('Multi-agent navigation analysis:');
    console.log('Total agents:', multiAgentAnalysis.totalAgents);
    console.log('Simulation steps:', multiAgentAnalysis.totalSteps);
    console.log('Total collisions:', multiAgentAnalysis.totalCollisions);
    console.log('Agents reached targets:', multiAgentAnalysis.agentsReached);
    console.log('Average final distance:', multiAgentAnalysis.averageDistance.toFixed(2));
    console.log('Navigation efficiency:', (multiAgentAnalysis.navigationEfficiency * 100).toFixed(1) + '%');
    
    return {
      multiAgentAnalysis,
      simulationResults: simulationResults.slice(0, 10), // First 10 steps for brevity
      finalPositions: currentAgentPositions,
      roomLayout: { boundaries: roomBoundaries, obstacles }
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Scenario 3: Dynamic Obstacle Avoidance with Real-time Path Planning
  console.log("3. Dynamic Obstacle Avoidance with Real-time Path Planning");
  const result3 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create a room with moving obstacles
    const roomWidth = 600;
    const roomHeight = 400;
    
    const roomBoundaries = [
      { x: 0, y: 0, width: roomWidth, height: 10, type: 'wall', id: 'top-wall' },
      { x: 0, y: roomHeight - 10, width: roomWidth, height: 10, type: 'wall', id: 'bottom-wall' },
      { x: 0, y: 0, width: 10, height: roomHeight, type: 'wall', id: 'left-wall' },
      { x: roomWidth - 10, y: 0, width: 10, height: roomHeight, type: 'wall', id: 'right-wall' }
    ];
    
    // Static obstacles
    const staticObstacles = [
      { x: 200, y: 100, width: 60, height: 60, type: 'furniture', id: 'desk-1', moving: false },
      { x: 400, y: 250, width: 80, height: 40, type: 'furniture', id: 'table-1', moving: false }
    ];
    
    // Moving obstacles
    const movingObstacles = [
      { 
        x: 150, y: 200, width: 40, height: 40, type: 'moving', id: 'moving-1', 
        moving: true, direction: { x: 1, y: 0 }, speed: 1, bounds: { minX: 100, maxX: 500, minY: 200, maxY: 200 }
      },
      { 
        x: 350, y: 150, width: 30, height: 30, type: 'moving', id: 'moving-2', 
        moving: true, direction: { x: 0, y: 1 }, speed: 0.8, bounds: { minX: 350, maxX: 350, minY: 100, maxY: 300 }
      }
    ];
    
    const allObstacles = [...staticObstacles, ...movingObstacles];
    
    // AI agent with dynamic path planning
    const agent = {
      id: 'dynamic-agent',
      x: 50, y: 50,
      targetX: 550, targetY: 350,
      width: 20, height: 20,
      speed: 2,
      path: [],
      currentPathIndex: 0,
      replanThreshold: 30 // Replan if distance to current path point > 30
    };
    
    // Create spatial hash for dynamic collision detection
    const spatialHash = new SpatialHash({
      cellSize: 30,
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Function to update moving obstacles
    const updateMovingObstacles = (obstacles) => {
      return obstacles.map(obstacle => {
        if (!obstacle.moving) return obstacle;
        
        let newX = obstacle.x + obstacle.direction.x * obstacle.speed;
        let newY = obstacle.y + obstacle.direction.y * obstacle.speed;
        
        // Check bounds and reverse direction if needed
        if (newX <= obstacle.bounds.minX || newX >= obstacle.bounds.maxX) {
          obstacle.direction.x *= -1;
          newX = obstacle.x + obstacle.direction.x * obstacle.speed;
        }
        if (newY <= obstacle.bounds.minY || newY >= obstacle.bounds.maxY) {
          obstacle.direction.y *= -1;
          newY = obstacle.y + obstacle.direction.y * obstacle.speed;
        }
        
        return { ...obstacle, x: newX, y: newY };
      });
    };
    
    // A* inspired pathfinding with spatial hash
    const findDynamicPath = (startX, startY, endX, endY, obstacles) => {
      const path = [];
      let currentX = startX;
      let currentY = startY;
      
      path.push({ x: currentX, y: currentY });
      
      const maxSteps = 500;
      let steps = 0;
      
      while (steps < maxSteps) {
        const dx = endX - currentX;
        const dy = endY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          path.push({ x: endX, y: endY });
          break;
        }
        
        // Calculate next position
        const moveX = (dx / distance) * agent.speed;
        const moveY = (dy / distance) * agent.speed;
        
        let nextX = currentX + moveX;
        let nextY = currentY + moveY;
        
        // Check collision with current obstacles
        const testAgent = { x: nextX, y: nextY, width: agent.width, height: agent.height, id: 'test' };
        const allObjects = [...roomBoundaries, ...obstacles, testAgent];
        const collisions = batchCollisionDetection(allObjects);
        
        if (collisions.length === 0) {
          currentX = nextX;
          currentY = nextY;
          path.push({ x: currentX, y: currentY });
        } else {
          // Try alternative directions
          const alternatives = [
            { x: currentX + agent.speed, y: currentY },
            { x: currentX - agent.speed, y: currentY },
            { x: currentX, y: currentY + agent.speed },
            { x: currentX, y: currentY - agent.speed },
            { x: currentX + agent.speed, y: currentY + agent.speed },
            { x: currentX - agent.speed, y: currentY - agent.speed }
          ];
          
          let foundAlternative = false;
          for (const alt of alternatives) {
            const testAlt = { x: alt.x, y: alt.y, width: agent.width, height: agent.height, id: 'test' };
            const altObjects = [...roomBoundaries, ...obstacles, testAlt];
            const altCollisions = batchCollisionDetection(altObjects);
            
            if (altCollisions.length === 0) {
              currentX = alt.x;
              currentY = alt.y;
              path.push({ x: currentX, y: currentY });
              foundAlternative = true;
              break;
            }
          }
          
          if (!foundAlternative) {
            console.log('No valid path found at step', steps);
            break;
          }
        }
        
        steps++;
      }
      
      return path;
    };
    
    // Simulate dynamic navigation
    const simulationSteps = 150;
    const dynamicResults = [];
    let currentObstacles = [...allObstacles];
    let currentPath = findDynamicPath(agent.x, agent.y, agent.targetX, agent.targetY, currentObstacles);
    let pathIndex = 0;
    
    for (let step = 0; step < simulationSteps; step++) {
      // Update moving obstacles
      currentObstacles = updateMovingObstacles(currentObstacles);
      
      // Check if we need to replan path
      if (pathIndex < currentPath.length) {
        const currentTarget = currentPath[pathIndex];
        const distanceToTarget = PointOps.distance(
          { x: agent.x, y: agent.y },
          currentTarget
        );
        
        if (distanceToTarget < 10) {
          pathIndex++;
        } else if (distanceToTarget > agent.replanThreshold) {
          // Replan path due to moving obstacles
          currentPath = findDynamicPath(agent.x, agent.y, agent.targetX, agent.targetY, currentObstacles);
          pathIndex = 0;
          console.log('Path replanned at step', step);
        }
      }
      
      // Move agent towards current path target
      if (pathIndex < currentPath.length) {
        const target = currentPath[pathIndex];
        const dx = target.x - agent.x;
        const dy = target.y - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const moveX = (dx / distance) * agent.speed;
          const moveY = (dy / distance) * agent.speed;
          
          agent.x += moveX;
          agent.y += moveY;
        }
      }
      
      // Record step results
      const stepResult = {
        step,
        agentPosition: { x: agent.x, y: agent.y },
        movingObstacles: currentObstacles.filter(o => o.moving).map(o => ({ id: o.id, x: o.x, y: o.y })),
        pathIndex,
        pathLength: currentPath.length,
        distanceToTarget: PointOps.distance(
          { x: agent.x, y: agent.y },
          { x: agent.targetX, y: agent.targetY }
        )
      };
      
      dynamicResults.push(stepResult);
      
      // Check if agent reached target
      if (stepResult.distanceToTarget < 15) {
        console.log('Agent reached target at step', step);
        break;
      }
    }
    
    // Analyze dynamic navigation
    const dynamicAnalysis = {
      totalSteps: dynamicResults.length,
      pathReplans: dynamicResults.filter((_, i) => 
        i > 0 && dynamicResults[i].pathLength !== dynamicResults[i-1].pathLength
      ).length,
      finalDistance: dynamicResults[dynamicResults.length - 1]?.distanceToTarget || 0,
      averagePathLength: dynamicResults.reduce((sum, step) => sum + step.pathLength, 0) / dynamicResults.length,
      navigationSuccess: dynamicResults[dynamicResults.length - 1]?.distanceToTarget < 15
    };
    
    console.log('Dynamic navigation analysis:');
    console.log('Total simulation steps:', dynamicAnalysis.totalSteps);
    console.log('Path replans:', dynamicAnalysis.pathReplans);
    console.log('Final distance to target:', dynamicAnalysis.finalDistance.toFixed(2));
    console.log('Average path length:', dynamicAnalysis.averagePathLength.toFixed(1));
    console.log('Navigation successful:', dynamicAnalysis.navigationSuccess);
    
    return {
      dynamicAnalysis,
      simulationResults: dynamicResults.slice(0, 20), // First 20 steps
      finalAgentPosition: { x: agent.x, y: agent.y },
      movingObstacles: currentObstacles.filter(o => o.moving)
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  console.log("=== Spatial Navigation Demo Complete ===");

  // Cleanup MCP client
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the spatial navigation demonstration
demonstrateSpatialNavigation().catch(error => {
  console.error("Spatial navigation demo failed:", error);
  process.exit(1);
});
