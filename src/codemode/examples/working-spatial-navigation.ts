import { codemode } from "../codemode";

async function demonstrateWorkingSpatialNavigation() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 20000 });

  console.log("=== Working Spatial Hash Navigation Demo ===\n");

  // Scenario 1: Simple Room Navigation with Working Pathfinding
  console.log("1. Simple Room Navigation with Working Pathfinding");
  const result1 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create a simple room layout
    const roomWidth = 400;
    const roomHeight = 300;
    
    // Room boundaries (walls)
    const walls = [
      { x: 0, y: 0, width: roomWidth, height: 5, type: 'wall', id: 'top' },
      { x: 0, y: roomHeight - 5, width: roomWidth, height: 5, type: 'wall', id: 'bottom' },
      { x: 0, y: 0, width: 5, height: roomHeight, type: 'wall', id: 'left' },
      { x: roomWidth - 5, y: 0, width: 5, height: roomHeight, type: 'wall', id: 'right' }
    ];
    
    // Simple obstacles
    const obstacles = [
      { x: 150, y: 100, width: 50, height: 50, type: 'obstacle', id: 'obstacle-1' },
      { x: 250, y: 200, width: 60, height: 40, type: 'obstacle', id: 'obstacle-2' }
    ];
    
    // AI agent
    const agent = {
      id: 'navigator',
      x: 20, y: 20,           // Start position
      targetX: 380, targetY: 280, // Target position
      width: 15, height: 15,
      speed: 3
    };
    
    // Create spatial hash
    const spatialHash = new SpatialHash({
      cellSize: 25,
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Simple but working pathfinding
    const findPath = (startX, startY, endX, endY) => {
      const path = [];
      let currentX = startX;
      let currentY = startY;
      
      path.push({ x: currentX, y: currentY });
      
      const maxSteps = 200;
      let steps = 0;
      
      while (steps < maxSteps) {
        // Calculate direction to target
        const dx = endX - currentX;
        const dy = endY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If close to target, we're done
        if (distance < 10) {
          path.push({ x: endX, y: endY });
          break;
        }
        
        // Move towards target
        const moveX = (dx / distance) * agent.speed;
        const moveY = (dy / distance) * agent.speed;
        
        let nextX = currentX + moveX;
        let nextY = currentY + moveY;
        
        // Check if next position collides with walls or obstacles
        const testAgent = { x: nextX, y: nextY, width: agent.width, height: agent.height, id: 'test' };
        const allObjects = [...walls, ...obstacles, testAgent];
        const collisions = batchCollisionDetection(allObjects);
        
        if (collisions.length === 0) {
          // No collision, move to next position
          currentX = nextX;
          currentY = nextY;
          path.push({ x: currentX, y: currentY });
        } else {
          // Collision detected, try to go around
          const alternatives = [
            { x: currentX + agent.speed, y: currentY },
            { x: currentX - agent.speed, y: currentY },
            { x: currentX, y: currentY + agent.speed },
            { x: currentX, y: currentY - agent.speed },
            { x: currentX + agent.speed, y: currentY + agent.speed },
            { x: currentX - agent.speed, y: currentY - agent.speed }
          ];
          
          let moved = false;
          for (const alt of alternatives) {
            const testAlt = { x: alt.x, y: alt.y, width: agent.width, height: agent.height, id: 'test' };
            const altObjects = [...walls, ...obstacles, testAlt];
            const altCollisions = batchCollisionDetection(altObjects);
            
            if (altCollisions.length === 0) {
              currentX = alt.x;
              currentY = alt.y;
              path.push({ x: currentX, y: currentY });
              moved = true;
              break;
            }
          }
          
          if (!moved) {
            // If we can't move, try a different approach
            // Move perpendicular to the obstacle
            const obstacle = obstacles.find(obs => {
              const testAgent = { x: currentX, y: currentY, width: agent.width, height: agent.height, id: 'test' };
              const testObjects = [...walls, obs, testAgent];
              const testCollisions = batchCollisionDetection(testObjects);
              return testCollisions.length > 0;
            });
            
            if (obstacle) {
              // Try to move around the obstacle
              const obstacleCenterX = obstacle.x + obstacle.width / 2;
              const obstacleCenterY = obstacle.y + obstacle.height / 2;
              
              const avoidX = currentX > obstacleCenterX ? currentX + agent.speed : currentX - agent.speed;
              const avoidY = currentY > obstacleCenterY ? currentY + agent.speed : currentY - agent.speed;
              
              const testAvoid = { x: avoidX, y: avoidY, width: agent.width, height: agent.height, id: 'test' };
              const avoidObjects = [...walls, ...obstacles, testAvoid];
              const avoidCollisions = batchCollisionDetection(avoidObjects);
              
              if (avoidCollisions.length === 0) {
                currentX = avoidX;
                currentY = avoidY;
                path.push({ x: currentX, y: currentY });
              }
            }
          }
        }
        
        steps++;
      }
      
      return path;
    };
    
    // Find path
    const path = findPath(agent.x, agent.y, agent.targetX, agent.targetY);
    
    // Analyze the path
    const analysis = {
      startPosition: { x: agent.x, y: agent.y },
      targetPosition: { x: agent.targetX, y: agent.targetY },
      pathLength: path.length,
      totalDistance: 0,
      directDistance: PointOps.distance(
        { x: agent.x, y: agent.y },
        { x: agent.targetX, y: agent.targetY }
      ),
      efficiency: 0,
      obstacles: obstacles.length,
      roomSize: { width: roomWidth, height: roomHeight }
    };
    
    // Calculate total path distance
    for (let i = 1; i < path.length; i++) {
      analysis.totalDistance += PointOps.distance(path[i - 1], path[i]);
    }
    
    analysis.efficiency = analysis.directDistance / analysis.totalDistance;
    
    console.log('Navigation Results:');
    console.log('Start:', analysis.startPosition);
    console.log('Target:', analysis.targetPosition);
    console.log('Path length:', analysis.pathLength, 'steps');
    console.log('Total distance:', analysis.totalDistance.toFixed(2));
    console.log('Direct distance:', analysis.directDistance.toFixed(2));
    console.log('Efficiency:', (analysis.efficiency * 100).toFixed(1) + '%');
    console.log('Obstacles avoided:', analysis.obstacles);
    
    return {
      analysis,
      path: path.slice(0, 20), // First 20 steps for brevity
      obstacles,
      roomLayout: { walls, obstacles, dimensions: { width: roomWidth, height: roomHeight } }
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Scenario 2: Multi-Agent Coordination with Spatial Hash
  console.log("2. Multi-Agent Coordination with Spatial Hash");
  const result2 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create a room for multiple agents
    const roomWidth = 500;
    const roomHeight = 400;
    
    const walls = [
      { x: 0, y: 0, width: roomWidth, height: 8, type: 'wall', id: 'top' },
      { x: 0, y: roomHeight - 8, width: roomWidth, height: 8, type: 'wall', id: 'bottom' },
      { x: 0, y: 0, width: 8, height: roomHeight, type: 'wall', id: 'left' },
      { x: roomWidth - 8, y: 0, width: 8, height: roomHeight, type: 'wall', id: 'right' }
    ];
    
    const obstacles = [
      { x: 200, y: 150, width: 60, height: 60, type: 'obstacle', id: 'center-obstacle' },
      { x: 100, y: 300, width: 40, height: 40, type: 'obstacle', id: 'left-obstacle' },
      { x: 350, y: 200, width: 50, height: 30, type: 'obstacle', id: 'right-obstacle' }
    ];
    
    // Multiple agents with different targets
    const agents = [
      { id: 'agent-1', x: 30, y: 30, targetX: 470, targetY: 370, width: 12, height: 12, speed: 2, color: 'red' },
      { id: 'agent-2', x: 470, y: 30, targetX: 30, targetY: 370, width: 12, height: 12, speed: 2, color: 'blue' },
      { id: 'agent-3', x: 30, y: 370, targetX: 470, targetY: 30, width: 12, height: 12, speed: 2, color: 'green' }
    ];
    
    // Create spatial hash for efficient collision detection
    const spatialHash = new SpatialHash({
      cellSize: 30,
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Simulate multi-agent navigation
    const simulationSteps = 100;
    const results = [];
    let currentPositions = agents.map(agent => ({ ...agent }));
    
    for (let step = 0; step < simulationSteps; step++) {
      const stepResult = {
        step,
        agentPositions: [],
        collisions: 0,
        distances: []
      };
      
      // Move each agent
      currentPositions = currentPositions.map(agent => {
        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          // Agent reached target
          return { ...agent, reached: true };
        }
        
        // Calculate movement
        const moveX = (dx / distance) * agent.speed;
        const moveY = (dy / distance) * agent.speed;
        
        let newX = agent.x + moveX;
        let newY = agent.y + moveY;
        
        // Check for collisions with walls and obstacles
        const testAgent = { x: newX, y: newY, width: agent.width, height: agent.height, id: 'test' };
        const allObjects = [...walls, ...obstacles, testAgent];
        const collisions = batchCollisionDetection(allObjects);
        
        if (collisions.length === 0) {
          // No collision with environment, check for agent-agent collisions
          const otherAgents = currentPositions.filter(a => a.id !== agent.id);
          const agentObjects = [...otherAgents, testAgent];
          const agentCollisions = batchCollisionDetection(agentObjects);
          
          if (agentCollisions.length === 0) {
            // Safe to move
            agent.x = newX;
            agent.y = newY;
          } else {
            // Agent collision, try alternative movement
            const alternatives = [
              { x: agent.x + agent.speed, y: agent.y },
              { x: agent.x - agent.speed, y: agent.y },
              { x: agent.x, y: agent.y + agent.speed },
              { x: agent.x, y: agent.y - agent.speed }
            ];
            
            for (const alt of alternatives) {
              const testAlt = { x: alt.x, y: alt.y, width: agent.width, height: agent.height, id: 'test' };
              const altObjects = [...walls, ...obstacles, ...otherAgents, testAlt];
              const altCollisions = batchCollisionDetection(altObjects);
              
              if (altCollisions.length === 0) {
                agent.x = alt.x;
                agent.y = alt.y;
                break;
              }
            }
          }
        } else {
          // Environment collision, try to go around
          const alternatives = [
            { x: agent.x + agent.speed, y: agent.y },
            { x: agent.x - agent.speed, y: agent.y },
            { x: agent.x, y: agent.y + agent.speed },
            { x: agent.x, y: agent.y - agent.speed }
          ];
          
          for (const alt of alternatives) {
            const testAlt = { x: alt.x, y: alt.y, width: agent.width, height: agent.height, id: 'test' };
            const altObjects = [...walls, ...obstacles, testAlt];
            const altCollisions = batchCollisionDetection(altObjects);
            
            if (altCollisions.length === 0) {
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
        
        stepResult.distances.push({
          agent: agent.id,
          distance: targetDistance,
          reached: targetDistance < 15
        });
        
        return agent;
      });
      
      // Count collisions
      const allObjects = [...walls, ...obstacles, ...currentPositions];
      const totalCollisions = batchCollisionDetection(allObjects).length;
      stepResult.collisions = totalCollisions;
      
      stepResult.agentPositions = currentPositions.map(agent => ({
        id: agent.id,
        x: agent.x,
        y: agent.y,
        reached: agent.reached || false
      }));
      
      results.push(stepResult);
      
      // Check if all agents reached their targets
      const allReached = currentPositions.every(agent => 
        agent.reached || PointOps.distance(
          { x: agent.x, y: agent.y },
          { x: agent.targetX, y: agent.targetY }
        ) < 15
      );
      
      if (allReached) {
        console.log('All agents reached targets at step', step);
        break;
      }
    }
    
    // Analyze results
    const analysis = {
      totalAgents: agents.length,
      totalSteps: results.length,
      totalCollisions: results.reduce((sum, step) => sum + step.collisions, 0),
      agentsReached: currentPositions.filter(agent => 
        PointOps.distance({ x: agent.x, y: agent.y }, { x: agent.targetX, y: agent.targetY }) < 15
      ).length,
      averageFinalDistance: 0,
      navigationSuccess: false
    };
    
    const finalDistances = results[results.length - 1]?.distances || [];
    analysis.averageFinalDistance = finalDistances.reduce((sum, d) => sum + d.distance, 0) / finalDistances.length;
    analysis.navigationSuccess = analysis.agentsReached === agents.length;
    
    console.log('Multi-Agent Navigation Results:');
    console.log('Total agents:', analysis.totalAgents);
    console.log('Simulation steps:', analysis.totalSteps);
    console.log('Total collisions:', analysis.totalCollisions);
    console.log('Agents reached targets:', analysis.agentsReached);
    console.log('Average final distance:', analysis.averageFinalDistance.toFixed(2));
    console.log('Navigation successful:', analysis.navigationSuccess);
    
    return {
      analysis,
      simulationResults: results.slice(0, 10), // First 10 steps
      finalPositions: currentPositions,
      roomLayout: { walls, obstacles, dimensions: { width: roomWidth, height: roomHeight } }
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Scenario 3: Dynamic Obstacle Avoidance
  console.log("3. Dynamic Obstacle Avoidance with Real-time Updates");
  const result3 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PointOps } = algorithms;
    
    // Create room with moving obstacles
    const roomWidth = 300;
    const roomHeight = 200;
    
    const walls = [
      { x: 0, y: 0, width: roomWidth, height: 5, type: 'wall', id: 'top' },
      { x: 0, y: roomHeight - 5, width: roomWidth, height: 5, type: 'wall', id: 'bottom' },
      { x: 0, y: 0, width: 5, height: roomHeight, type: 'wall', id: 'left' },
      { x: roomWidth - 5, y: 0, width: 5, height: roomHeight, type: 'wall', id: 'right' }
    ];
    
    // Moving obstacle
    const movingObstacle = {
      x: 100, y: 100, width: 30, height: 30, type: 'moving', id: 'moving-1',
      direction: { x: 1, y: 0 }, speed: 1,
      bounds: { minX: 50, maxX: 250, minY: 100, maxY: 100 }
    };
    
    // Static obstacles
    const staticObstacles = [
      { x: 150, y: 50, width: 40, height: 40, type: 'static', id: 'static-1' }
    ];
    
    // AI agent
    const agent = {
      id: 'dynamic-agent',
      x: 20, y: 20,
      targetX: 280, targetY: 180,
      width: 12, height: 12,
      speed: 2
    };
    
    // Create spatial hash
    const spatialHash = new SpatialHash({
      cellSize: 20,
      worldBounds: { minX: 0, minY: 0, maxX: roomWidth, maxY: roomHeight }
    });
    
    // Update moving obstacle position
    const updateMovingObstacle = (obstacle) => {
      let newX = obstacle.x + obstacle.direction.x * obstacle.speed;
      let newY = obstacle.y + obstacle.direction.y * obstacle.speed;
      
      // Check bounds and reverse direction
      if (newX <= obstacle.bounds.minX || newX >= obstacle.bounds.maxX) {
        obstacle.direction.x *= -1;
        newX = obstacle.x + obstacle.direction.x * obstacle.speed;
      }
      if (newY <= obstacle.bounds.minY || newY >= obstacle.bounds.maxY) {
        obstacle.direction.y *= -1;
        newY = obstacle.y + obstacle.direction.y * obstacle.speed;
      }
      
      return { ...obstacle, x: newX, y: newY };
    };
    
    // Simulate dynamic navigation
    const simulationSteps = 80;
    const results = [];
    let currentObstacle = { ...movingObstacle };
    
    for (let step = 0; step < simulationSteps; step++) {
      // Update moving obstacle
      currentObstacle = updateMovingObstacle(currentObstacle);
      
      // Calculate movement towards target
      const dx = agent.targetX - agent.x;
      const dy = agent.targetY - agent.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        console.log('Agent reached target at step', step);
        break;
      }
      
      // Move towards target
      const moveX = (dx / distance) * agent.speed;
      const moveY = (dy / distance) * agent.speed;
      
      let newX = agent.x + moveX;
      let newY = agent.y + moveY;
      
      // Check for collisions with all obstacles (including moving one)
      const allObstacles = [currentObstacle, ...staticObstacles];
      const testAgent = { x: newX, y: newY, width: agent.width, height: agent.height, id: 'test' };
      const allObjects = [...walls, ...allObstacles, testAgent];
      const collisions = batchCollisionDetection(allObjects);
      
      if (collisions.length === 0) {
        // No collision, move to new position
        agent.x = newX;
        agent.y = newY;
      } else {
        // Collision detected, try alternative movement
        const alternatives = [
          { x: agent.x + agent.speed, y: agent.y },
          { x: agent.x - agent.speed, y: agent.y },
          { x: agent.x, y: agent.y + agent.speed },
          { x: agent.x, y: agent.y - agent.speed }
        ];
        
        for (const alt of alternatives) {
          const testAlt = { x: alt.x, y: alt.y, width: agent.width, height: agent.height, id: 'test' };
          const altObjects = [...walls, ...allObstacles, testAlt];
          const altCollisions = batchCollisionDetection(altObjects);
          
          if (altCollisions.length === 0) {
            agent.x = alt.x;
            agent.y = alt.y;
            break;
          }
        }
      }
      
      // Record step results
      const stepResult = {
        step,
        agentPosition: { x: agent.x, y: agent.y },
        movingObstaclePosition: { x: currentObstacle.x, y: currentObstacle.y },
        distanceToTarget: PointOps.distance(
          { x: agent.x, y: agent.y },
          { x: agent.targetX, y: agent.targetY }
        )
      };
      
      results.push(stepResult);
    }
    
    // Analyze dynamic navigation
    const analysis = {
      totalSteps: results.length,
      finalDistance: results[results.length - 1]?.distanceToTarget || 0,
      navigationSuccess: results[results.length - 1]?.distanceToTarget < 10,
      movingObstaclePositions: results.map(r => r.movingObstaclePosition),
      agentPath: results.map(r => r.agentPosition)
    };
    
    console.log('Dynamic Navigation Results:');
    console.log('Total steps:', analysis.totalSteps);
    console.log('Final distance to target:', analysis.finalDistance.toFixed(2));
    console.log('Navigation successful:', analysis.navigationSuccess);
    console.log('Moving obstacle range:', 
      Math.min(...analysis.movingObstaclePositions.map(p => p.x)).toFixed(1),
      'to',
      Math.max(...analysis.movingObstaclePositions.map(p => p.x)).toFixed(1)
    );
    
    return {
      analysis,
      simulationResults: results.slice(0, 15), // First 15 steps
      finalAgentPosition: { x: agent.x, y: agent.y },
      finalObstaclePosition: { x: currentObstacle.x, y: currentObstacle.y }
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  console.log("=== Working Spatial Navigation Demo Complete ===");

  // Cleanup MCP client
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the working spatial navigation demonstration
demonstrateWorkingSpatialNavigation().catch(error => {
  console.error("Working spatial navigation demo failed:", error);
  process.exit(1);
});
