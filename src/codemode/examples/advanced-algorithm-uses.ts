import { codemode } from "../codemode";

async function demonstrateAdvancedAlgorithmUses() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 25000 });

  console.log("=== Advanced Algorithm Uses for AI Agents ===\n");

  // Scenario 1: Intelligent Caching and Memory Management
  console.log("1. Intelligent Caching: LRU Cache for AI Agent Memory");
  const result1 = await cm.executeCode(`
    const { LRUCache, MemoryMonitor } = algorithms;
    
    // Create an intelligent cache for AI agent conversations and context
    const agentCache = new LRUCache({
      maxSize: 100, // Store up to 100 items
      ttl: 300000   // 5 minutes TTL
    });
    
    // Simulate AI agent conversation history
    const conversations = [
      { id: 'conv-1', user: 'alice', topic: 'code-review', timestamp: Date.now() - 1000, context: 'TypeScript refactoring' },
      { id: 'conv-2', user: 'bob', topic: 'bug-fix', timestamp: Date.now() - 2000, context: 'React component issue' },
      { id: 'conv-3', user: 'charlie', topic: 'architecture', timestamp: Date.now() - 3000, context: 'Microservices design' },
      { id: 'conv-4', user: 'diana', topic: 'testing', timestamp: Date.now() - 4000, context: 'Unit test coverage' },
      { id: 'conv-5', user: 'eve', topic: 'deployment', timestamp: Date.now() - 5000, context: 'CI/CD pipeline' }
    ];
    
    // Populate cache with conversation data
    conversations.forEach(conv => {
      agentCache.set(conv.id, {
        ...conv,
        cached: true,
        accessCount: 0
      });
    });
    
    // Simulate agent accessing conversations (LRU behavior)
    const accessPattern = ['conv-1', 'conv-3', 'conv-1', 'conv-5', 'conv-2', 'conv-4', 'conv-1'];
    
    accessPattern.forEach(convId => {
      const cached = agentCache.get(convId);
      if (cached) {
        cached.accessCount++;
        console.log(\`Accessed \${convId}: \${cached.topic} (access count: \${cached.accessCount})\`);
      }
    });
    
    // Add new conversation (should evict least recently used)
    const newConv = {
      id: 'conv-6',
      user: 'frank',
      topic: 'performance',
      timestamp: Date.now(),
      context: 'Database optimization',
      cached: true,
      accessCount: 0
    };
    
    agentCache.set(newConv.id, newConv);
    console.log('Added new conversation, cache eviction may have occurred');
    
    // Analyze cache performance
    const cacheStats = {
      size: agentCache.size,
      maxSize: agentCache.maxSize,
      hitRate: 0,
      mostAccessed: null,
      leastAccessed: null
    };
    
    // Calculate hit rate and find most/least accessed items
    let totalAccesses = 0;
    let maxAccesses = 0;
    let minAccesses = Infinity;
    let mostAccessed = null;
    let leastAccessed = null;
    
    for (const [key, value] of agentCache.entries()) {
      totalAccesses += value.accessCount;
      if (value.accessCount > maxAccesses) {
        maxAccesses = value.accessCount;
        mostAccessed = { key, ...value };
      }
      if (value.accessCount < minAccesses) {
        minAccesses = value.accessCount;
        leastAccessed = { key, ...value };
      }
    }
    
    cacheStats.hitRate = totalAccesses / agentCache.size;
    cacheStats.mostAccessed = mostAccessed;
    cacheStats.leastAccessed = leastAccessed;
    
    console.log('Cache performance analysis:');
    console.log('Cache size:', cacheStats.size, '/', cacheStats.maxSize);
    console.log('Average hit rate:', cacheStats.hitRate.toFixed(2));
    console.log('Most accessed:', cacheStats.mostAccessed?.topic);
    console.log('Least accessed:', cacheStats.leastAccessed?.topic);
    
    return {
      cacheStats,
      totalConversations: conversations.length,
      accessPattern: accessPattern.length,
      cacheEfficiency: cacheStats.hitRate,
      memoryOptimization: 'LRU eviction for optimal memory usage'
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Scenario 2: Priority Queue for Task Scheduling
  console.log("2. Priority Queue: Intelligent Task Scheduling for AI Agents");
  const result2 = await cm.executeCode(`
    const { PriorityQueue, PerformanceTimer } = algorithms;
    
    // Create priority queue for AI agent task scheduling
    const taskQueue = new PriorityQueue({
      compare: (a, b) => {
        // Higher priority (lower number) comes first
        if (a.priority !== b.priority) return a.priority - b.priority;
        // If same priority, shorter duration comes first
        return a.estimatedDuration - b.estimatedDuration;
      }
    });
    
    // Define AI agent tasks with different priorities and characteristics
    const agentTasks = [
      { id: 'urgent-bug', type: 'bug-fix', priority: 1, estimatedDuration: 2000, complexity: 'high', user: 'alice' },
      { id: 'security-audit', type: 'security', priority: 0, estimatedDuration: 5000, complexity: 'high', user: 'admin' },
      { id: 'code-review', type: 'review', priority: 2, estimatedDuration: 1500, complexity: 'medium', user: 'bob' },
      { id: 'documentation', type: 'docs', priority: 4, estimatedDuration: 3000, complexity: 'low', user: 'charlie' },
      { id: 'performance-opt', type: 'optimization', priority: 1, estimatedDuration: 4000, complexity: 'high', user: 'diana' },
      { id: 'test-coverage', type: 'testing', priority: 3, estimatedDuration: 2500, complexity: 'medium', user: 'eve' },
      { id: 'deployment', type: 'deploy', priority: 0, estimatedDuration: 1000, complexity: 'medium', user: 'admin' },
      { id: 'refactoring', type: 'refactor', priority: 2, estimatedDuration: 6000, complexity: 'high', user: 'frank' }
    ];
    
    // Add tasks to priority queue
    agentTasks.forEach(task => {
      taskQueue.enqueue(task);
    });
    
    console.log('Task queue initialized with', taskQueue.size, 'tasks');
    
    // Simulate task execution with priority scheduling
    const timer = new PerformanceTimer();
    const executionResults = [];
    let currentTime = 0;
    
    while (!taskQueue.isEmpty()) {
      const task = taskQueue.dequeue();
      
      timer.start();
      
      // Simulate task execution
      await new Promise(resolve => setTimeout(resolve, task.estimatedDuration / 10));
      
      const executionTime = timer.stop();
      const endTime = currentTime + task.estimatedDuration;
      
      executionResults.push({
        ...task,
        startTime: currentTime,
        endTime: endTime,
        actualDuration: executionTime * 10,
        efficiency: task.estimatedDuration / (executionTime * 10)
      });
      
      currentTime = endTime;
      
      console.log(\`Executed \${task.id} (\${task.type}) - Priority: \${task.priority}, Duration: \${task.estimatedDuration}ms\`);
    }
    
    // Analyze scheduling efficiency
    const totalExecutionTime = Math.max(...executionResults.map(r => r.endTime));
    const averageEfficiency = executionResults.reduce((sum, r) => sum + r.efficiency, 0) / executionResults.length;
    
    // Group by priority
    const priorityGroups = {};
    executionResults.forEach(result => {
      if (!priorityGroups[result.priority]) {
        priorityGroups[result.priority] = [];
      }
      priorityGroups[result.priority].push(result);
    });
    
    console.log('Priority queue scheduling analysis:');
    console.log('Total execution time:', totalExecutionTime, 'ms');
    console.log('Average efficiency:', averageEfficiency.toFixed(2));
    console.log('Tasks by priority:', Object.keys(priorityGroups).map(p => \`P\${p}: \${priorityGroups[p].length}\`).join(', '));
    
    return {
      totalTasks: agentTasks.length,
      totalExecutionTime,
      averageEfficiency,
      priorityGroups,
      executionResults,
      schedulingStrategy: 'Priority-based with duration optimization'
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Scenario 3: Spatial Hash for AI Agent Navigation and Collision Detection
  console.log("3. Spatial Hash: AI Agent Navigation and Collision Detection");
  const result3 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection } = algorithms;
    
    // Create spatial hash for AI agent navigation in a virtual workspace
    const workspaceHash = new SpatialHash({
      cellSize: 100,
      worldBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
    });
    
    // Define AI agents with positions and capabilities
    const agents = [
      { id: 'fox-agent', x: 100, y: 150, width: 50, height: 50, type: 'strategic', status: 'active' },
      { id: 'otter-agent', x: 300, y: 200, width: 50, height: 50, type: 'quality', status: 'active' },
      { id: 'wolf-agent', x: 500, y: 100, width: 50, height: 50, type: 'security', status: 'active' },
      { id: 'eagle-agent', x: 700, y: 300, width: 50, height: 50, type: 'vision', status: 'active' },
      { id: 'lion-agent', x: 200, y: 400, width: 50, height: 50, type: 'leadership', status: 'active' }
    ];
    
    // Define workspace obstacles and resources
    const obstacles = [
      { id: 'obstacle-1', x: 250, y: 250, width: 100, height: 100, type: 'wall' },
      { id: 'obstacle-2', x: 450, y: 350, width: 80, height: 80, type: 'furniture' },
      { id: 'obstacle-3', x: 650, y: 150, width: 120, height: 60, type: 'equipment' }
    ];
    
    const resources = [
      { id: 'resource-1', x: 150, y: 300, width: 30, height: 30, type: 'data', value: 100 },
      { id: 'resource-2', x: 350, y: 100, width: 30, height: 30, type: 'compute', value: 150 },
      { id: 'resource-3', x: 550, y: 400, width: 30, height: 30, type: 'storage', value: 200 },
      { id: 'resource-4', x: 750, y: 200, width: 30, height: 30, type: 'network', value: 120 }
    ];
    
    // Simulate agent movement and collision detection
    const movementResults = [];
    
    agents.forEach(agent => {
      // Simulate agent movement (random walk)
      const newX = Math.max(0, Math.min(950, agent.x + (Math.random() - 0.5) * 100));
      const newY = Math.max(0, Math.min(950, agent.y + (Math.random() - 0.5) * 100));
      
      const movedAgent = {
        ...agent,
        x: newX,
        y: newY,
        previousX: agent.x,
        previousY: agent.y
      };
      
      // Check for collisions with obstacles
      const allObjects = [...obstacles, ...resources, ...agents.filter(a => a.id !== agent.id)];
      const potentialCollisions = batchCollisionDetection([movedAgent, ...allObjects]);
      
      const agentCollisions = potentialCollisions.filter(collision => 
        collision.index1 === 0 || collision.index2 === 0
      );
      
      movementResults.push({
        agent: agent.id,
        type: agent.type,
        from: { x: agent.x, y: agent.y },
        to: { x: newX, y: newY },
        collisions: agentCollisions.length,
        collisionObjects: agentCollisions.map(c => {
          const objIndex = c.index1 === 0 ? c.index2 - 1 : c.index1 - 1;
          return allObjects[objIndex];
        })
      });
    });
    
    // Find nearby resources for each agent
    const resourceProximity = agents.map(agent => {
      const nearbyResources = resources.filter(resource => {
        const distance = Math.sqrt(
          Math.pow(agent.x - resource.x, 2) + Math.pow(agent.y - resource.y, 2)
        );
        return distance < 200; // Within 200 units
      });
      
      return {
        agent: agent.id,
        type: agent.type,
        nearbyResources: nearbyResources.length,
        totalValue: nearbyResources.reduce((sum, r) => sum + r.value, 0),
        resources: nearbyResources
      };
    });
    
    // Analyze spatial distribution
    const spatialAnalysis = {
      totalAgents: agents.length,
      totalObstacles: obstacles.length,
      totalResources: resources.length,
      averageCollisions: movementResults.reduce((sum, r) => sum + r.collisions, 0) / agents.length,
      resourceUtilization: resourceProximity.reduce((sum, r) => sum + r.totalValue, 0),
      workspaceEfficiency: (resources.length / (agents.length + obstacles.length)) * 100
    };
    
    console.log('Spatial hash navigation analysis:');
    console.log('Total agents:', spatialAnalysis.totalAgents);
    console.log('Total obstacles:', spatialAnalysis.totalObstacles);
    console.log('Total resources:', spatialAnalysis.totalResources);
    console.log('Average collisions per agent:', spatialAnalysis.averageCollisions.toFixed(2));
    console.log('Total resource value accessible:', spatialAnalysis.resourceUtilization);
    console.log('Workspace efficiency:', spatialAnalysis.workspaceEfficiency.toFixed(1) + '%');
    
    return {
      spatialAnalysis,
      movementResults,
      resourceProximity,
      navigationStrategy: 'Spatial hash with collision detection',
      optimizationOpportunities: {
        collisionAvoidance: spatialAnalysis.averageCollisions > 0,
        resourceOptimization: spatialAnalysis.resourceUtilization < 500,
        workspaceUtilization: spatialAnalysis.workspaceEfficiency < 50
      }
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Scenario 4: Advanced Performance Monitoring for AI Agent Operations
  console.log("4. Advanced Performance Monitoring: AI Agent Operation Analysis");
  const result4 = await cm.executeCode(`
    const { PerformanceTimer, MemoryMonitor } = algorithms;
    
    // Create comprehensive performance monitoring for AI agent operations
    const performanceMonitor = new PerformanceTimer();
    const memoryMonitor = new MemoryMonitor();
    
    // Simulate different AI agent operations
    const agentOperations = [
      { name: 'code-analysis', type: 'cpu-intensive', expectedDuration: 3000, memoryUsage: 512 },
      { name: 'pattern-recognition', type: 'ml-inference', expectedDuration: 5000, memoryUsage: 1024 },
      { name: 'text-generation', type: 'nlp', expectedDuration: 2000, memoryUsage: 768 },
      { name: 'image-processing', type: 'computer-vision', expectedDuration: 4000, memoryUsage: 1536 },
      { name: 'data-transformation', type: 'data-processing', expectedDuration: 1500, memoryUsage: 256 },
      { name: 'api-calls', type: 'network', expectedDuration: 1000, memoryUsage: 128 },
      { name: 'file-operations', type: 'io', expectedDuration: 800, memoryUsage: 64 },
      { name: 'database-queries', type: 'database', expectedDuration: 1200, memoryUsage: 192 }
    ];
    
    const operationResults = [];
    
    // Execute operations with performance monitoring
    for (const operation of agentOperations) {
      console.log(\`Executing \${operation.name}...\`);
      
      // Start performance monitoring
      performanceMonitor.start();
      const beforeMemory = memoryMonitor.measure();
      
      // Simulate operation execution
      await new Promise(resolve => setTimeout(resolve, operation.expectedDuration / 10));
      
      // Stop performance monitoring
      const executionTime = performanceMonitor.stop();
      const afterMemory = memoryMonitor.measure();
      const memoryDelta = afterMemory - beforeMemory;
      
      // Calculate performance metrics
      const efficiency = operation.expectedDuration / (executionTime * 10);
      const memoryEfficiency = operation.memoryUsage / Math.max(memoryDelta, 1);
      const performanceScore = (efficiency * 0.6) + (memoryEfficiency * 0.4);
      
      operationResults.push({
        ...operation,
        actualDuration: executionTime * 10,
        memoryDelta,
        efficiency,
        memoryEfficiency,
        performanceScore,
        status: performanceScore > 0.8 ? 'excellent' : performanceScore > 0.6 ? 'good' : 'needs-optimization'
      });
    }
    
    // Analyze performance patterns
    const performanceAnalysis = {
      totalOperations: operationResults.length,
      averageEfficiency: operationResults.reduce((sum, r) => sum + r.efficiency, 0) / operationResults.length,
      averageMemoryEfficiency: operationResults.reduce((sum, r) => sum + r.memoryEfficiency, 0) / operationResults.length,
      averagePerformanceScore: operationResults.reduce((sum, r) => sum + r.performanceScore, 0) / operationResults.length,
      excellentOperations: operationResults.filter(r => r.status === 'excellent').length,
      goodOperations: operationResults.filter(r => r.status === 'good').length,
      needsOptimization: operationResults.filter(r => r.status === 'needs-optimization').length
    };
    
    // Group by operation type
    const typeAnalysis = {};
    operationResults.forEach(result => {
      if (!typeAnalysis[result.type]) {
        typeAnalysis[result.type] = {
          count: 0,
          totalEfficiency: 0,
          totalMemoryEfficiency: 0,
          totalPerformanceScore: 0
        };
      }
      typeAnalysis[result.type].count++;
      typeAnalysis[result.type].totalEfficiency += result.efficiency;
      typeAnalysis[result.type].totalMemoryEfficiency += result.memoryEfficiency;
      typeAnalysis[result.type].totalPerformanceScore += result.performanceScore;
    });
    
    // Calculate averages for each type
    Object.keys(typeAnalysis).forEach(type => {
      const analysis = typeAnalysis[type];
      analysis.averageEfficiency = analysis.totalEfficiency / analysis.count;
      analysis.averageMemoryEfficiency = analysis.totalMemoryEfficiency / analysis.count;
      analysis.averagePerformanceScore = analysis.totalPerformanceScore / analysis.count;
    });
    
    console.log('Performance monitoring analysis:');
    console.log('Total operations:', performanceAnalysis.totalOperations);
    console.log('Average efficiency:', performanceAnalysis.averageEfficiency.toFixed(2));
    console.log('Average memory efficiency:', performanceAnalysis.averageMemoryEfficiency.toFixed(2));
    console.log('Average performance score:', performanceAnalysis.averagePerformanceScore.toFixed(2));
    console.log('Excellent operations:', performanceAnalysis.excellentOperations);
    console.log('Operations needing optimization:', performanceAnalysis.needsOptimization);
    
    return {
      performanceAnalysis,
      typeAnalysis,
      operationResults,
      monitoringStrategy: 'Comprehensive performance and memory tracking',
      optimizationRecommendations: {
        cpuIntensive: typeAnalysis['cpu-intensive']?.averagePerformanceScore < 0.7,
        mlInference: typeAnalysis['ml-inference']?.averagePerformanceScore < 0.7,
        nlp: typeAnalysis['nlp']?.averagePerformanceScore < 0.7,
        computerVision: typeAnalysis['computer-vision']?.averagePerformanceScore < 0.7
      }
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  // Scenario 5: Advanced Geometry Operations for AI Agent Spatial Reasoning
  console.log("5. Advanced Geometry: AI Agent Spatial Reasoning and Path Planning");
  const result5 = await cm.executeCode(`
    const { PointOps, CircleOps, RectangleOps } = algorithms;
    
    // Define complex spatial scenarios for AI agent reasoning
    const spatialScenario = {
      agents: [
        { id: 'agent-1', position: { x: 100, y: 100 }, radius: 25, type: 'mobile' },
        { id: 'agent-2', position: { x: 300, y: 200 }, radius: 30, type: 'stationary' },
        { id: 'agent-3', position: { x: 500, y: 150 }, radius: 20, type: 'mobile' }
      ],
      obstacles: [
        { id: 'wall-1', x: 200, y: 100, width: 20, height: 200, type: 'rectangle' },
        { id: 'pillar-1', x: 400, y: 300, radius: 40, type: 'circle' },
        { id: 'desk-1', x: 150, y: 300, width: 100, height: 60, type: 'rectangle' }
      ],
      targets: [
        { id: 'target-1', position: { x: 600, y: 100 }, radius: 15, priority: 'high' },
        { id: 'target-2', position: { x: 250, y: 400 }, radius: 20, priority: 'medium' },
        { id: 'target-3', position: { x: 450, y: 50 }, radius: 10, priority: 'low' }
      ]
    };
    
    // Calculate distances and paths for mobile agents
    const pathAnalysis = spatialScenario.agents
      .filter(agent => agent.type === 'mobile')
      .map(agent => {
        const paths = spatialScenario.targets.map(target => {
          // Calculate direct distance
          const directDistance = PointOps.distance(agent.position, target.position);
          
          // Check for obstacle intersections
          const obstacleIntersections = spatialScenario.obstacles.map(obstacle => {
            if (obstacle.type === 'circle') {
              // Check if line from agent to target intersects with circle
              const circleCenter = { x: obstacle.x, y: obstacle.y };
              const distanceToCenter = PointOps.distance(agent.position, circleCenter);
              const intersects = distanceToCenter < (agent.radius + obstacle.radius);
              return { obstacle, intersects, distance: distanceToCenter };
            } else if (obstacle.type === 'rectangle') {
              // Check if line from agent to target intersects with rectangle
              const rectCenter = { x: obstacle.x + obstacle.width/2, y: obstacle.y + obstacle.height/2 };
              const distanceToCenter = PointOps.distance(agent.position, rectCenter);
              const intersects = distanceToCenter < (agent.radius + Math.max(obstacle.width, obstacle.height)/2);
              return { obstacle, intersects, distance: distanceToCenter };
            }
            return { obstacle, intersects: false, distance: Infinity };
          });
          
          const blockingObstacles = obstacleIntersections.filter(obs => obs.intersects);
          
          // Calculate alternative path if blocked
          let alternativeDistance = directDistance;
          if (blockingObstacles.length > 0) {
            // Simple pathfinding: go around the closest obstacle
            const closestObstacle = blockingObstacles.reduce((closest, current) => 
              current.distance < closest.distance ? current : closest
            );
            
            if (closestObstacle.obstacle.type === 'circle') {
              // Go around circle
              const circleRadius = closestObstacle.obstacle.radius + agent.radius + 10; // Safety margin
              const angle = Math.atan2(
                target.position.y - agent.position.y,
                target.position.x - agent.position.x
              );
              const detourPoint = {
                x: closestObstacle.obstacle.x + Math.cos(angle + Math.PI/2) * circleRadius,
                y: closestObstacle.obstacle.y + Math.sin(angle + Math.PI/2) * circleRadius
              };
              alternativeDistance = PointOps.distance(agent.position, detourPoint) + 
                                 PointOps.distance(detourPoint, target.position);
            }
          }
          
          return {
            target: target.id,
            priority: target.priority,
            directDistance,
            alternativeDistance,
            blocked: blockingObstacles.length > 0,
            blockingObstacles: blockingObstacles.length,
            pathEfficiency: directDistance / alternativeDistance
          };
        });
        
        // Sort paths by priority and efficiency
        const sortedPaths = paths.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.alternativeDistance - b.alternativeDistance;
        });
        
        return {
          agent: agent.id,
          position: agent.position,
          radius: agent.radius,
          paths: sortedPaths,
          bestPath: sortedPaths[0],
          totalBlockedPaths: paths.filter(p => p.blocked).length
        };
      });
    
    // Calculate spatial coverage and efficiency
    const spatialMetrics = {
      totalAgents: spatialScenario.agents.length,
      mobileAgents: spatialScenario.agents.filter(a => a.type === 'mobile').length,
      totalObstacles: spatialScenario.obstacles.length,
      totalTargets: spatialScenario.targets.length,
      averagePathEfficiency: 0,
      totalBlockedPaths: 0,
      coverageArea: 0
    };
    
    // Calculate coverage area (simplified)
    const allPositions = [
      ...spatialScenario.agents.map(a => a.position),
      ...spatialScenario.targets.map(t => t.position)
    ];
    
    let minX = Math.min(...allPositions.map(p => p.x));
    let maxX = Math.max(...allPositions.map(p => p.x));
    let minY = Math.min(...allPositions.map(p => p.y));
    let maxY = Math.max(...allPositions.map(p => p.y));
    
    spatialMetrics.coverageArea = (maxX - minX) * (maxY - minY);
    
    // Calculate path efficiency
    let totalEfficiency = 0;
    let totalPaths = 0;
    
    pathAnalysis.forEach(agent => {
      agent.paths.forEach(path => {
        totalEfficiency += path.pathEfficiency;
        totalPaths++;
        if (path.blocked) spatialMetrics.totalBlockedPaths++;
      });
    });
    
    spatialMetrics.averagePathEfficiency = totalEfficiency / totalPaths;
    
    console.log('Spatial reasoning analysis:');
    console.log('Total agents:', spatialMetrics.totalAgents);
    console.log('Mobile agents:', spatialMetrics.mobileAgents);
    console.log('Total obstacles:', spatialMetrics.totalObstacles);
    console.log('Total targets:', spatialMetrics.totalTargets);
    console.log('Average path efficiency:', spatialMetrics.averagePathEfficiency.toFixed(2));
    console.log('Total blocked paths:', spatialMetrics.totalBlockedPaths);
    console.log('Coverage area:', spatialMetrics.coverageArea.toFixed(0), 'square units');
    
    return {
      spatialMetrics,
      pathAnalysis,
      spatialReasoning: {
        obstacleAvoidance: spatialMetrics.totalBlockedPaths > 0,
        pathOptimization: spatialMetrics.averagePathEfficiency < 0.8,
        coverageOptimization: spatialMetrics.coverageArea > 100000
      },
      geometryOperations: {
        distanceCalculations: totalPaths * 2,
        intersectionTests: spatialMetrics.totalBlockedPaths,
        pathOptimization: pathAnalysis.length
      }
    };
  `);
  console.log("Result:", result5.returned);
  console.log("Logs:", result5.logs);
  console.log();

  console.log("=== Advanced Algorithm Uses Complete ===");

  // Cleanup MCP client
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the advanced algorithm demonstration
demonstrateAdvancedAlgorithmUses().catch(error => {
  console.error("Advanced algorithm demo failed:", error);
  process.exit(1);
});
