import { codemode } from "../codemode";

async function demonstrateDevelopmentOptimization() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 20000 });

  console.log("=== Development Workflow Optimization with Algorithms ===\n");

  // Scenario 1: Build Dependency Optimization
  console.log("1. Build Dependency Optimization: Minimizing Build Times");
  const result1 = await cm.executeCode(`
    const { UnionFind, PerformanceTimer } = algorithms;
    
    // Simulate Reynard package build dependencies
    const packages = [
      { name: 'reynard-core', buildTime: 5000, dependencies: [] },
      { name: 'reynard-algorithms', buildTime: 3000, dependencies: ['reynard-core'] },
      { name: 'reynard-ui', buildTime: 8000, dependencies: ['reynard-core'] },
      { name: 'reynard-ai', buildTime: 12000, dependencies: ['reynard-core', 'reynard-algorithms'] },
      { name: 'reynard-testing', buildTime: 2000, dependencies: ['reynard-core'] },
      { name: 'reynard-docs', buildTime: 4000, dependencies: ['reynard-core', 'reynard-ui'] },
      { name: 'reynard-dev-tools', buildTime: 6000, dependencies: ['reynard-core', 'reynard-testing'] },
      { name: 'reynard-media', buildTime: 7000, dependencies: ['reynard-core', 'reynard-ui'] },
      { name: 'reynard-auth', buildTime: 3500, dependencies: ['reynard-core'] },
      { name: 'reynard-chat', buildTime: 4500, dependencies: ['reynard-core', 'reynard-auth'] }
    ];
    
    // Create dependency graph using Union-Find for cycle detection
    const packageIndex = {};
    packages.forEach((pkg, index) => {
      packageIndex[pkg.name] = index;
    });
    
    const uf = new UnionFind(packages.length);
    const dependencyGraph = {};
    const buildOrder = [];
    
    // Build dependency graph
    packages.forEach(pkg => {
      dependencyGraph[pkg.name] = {
        ...pkg,
        dependents: [],
        dependencies: pkg.dependencies,
        buildTime: pkg.buildTime,
        totalBuildTime: pkg.buildTime
      };
    });
    
    // Calculate total build time including dependencies
    const calculateTotalBuildTime = (pkgName) => {
      const pkg = dependencyGraph[pkgName];
      if (pkg.totalBuildTime !== pkg.buildTime) {
        return pkg.totalBuildTime; // Already calculated
      }
      
      let totalTime = pkg.buildTime;
      pkg.dependencies.forEach(dep => {
        totalTime += calculateTotalBuildTime(dep);
      });
      
      pkg.totalBuildTime = totalTime;
      return totalTime;
    };
    
    // Calculate total build times
    packages.forEach(pkg => {
      calculateTotalBuildTime(pkg.name);
    });
    
    // Sort by total build time (longest first for optimal parallelization)
    const sortedPackages = [...packages].sort((a, b) => {
      const aTotal = dependencyGraph[a.name].totalBuildTime;
      const bTotal = dependencyGraph[b.name].totalBuildTime;
      return bTotal - aTotal;
    });
    
    // Simulate optimal build scheduling
    const timer = new PerformanceTimer();
    const maxParallelBuilds = 4;
    const buildResults = [];
    let currentTime = 0;
    
    // Greedy scheduling algorithm
    const availableSlots = Array(maxParallelBuilds).fill(0);
    const buildQueue = [...sortedPackages];
    
    while (buildQueue.length > 0) {
      // Find available slot
      const nextSlot = availableSlots.indexOf(Math.min(...availableSlots));
      const nextBuild = buildQueue.shift();
      
      // Check if dependencies are ready
      const dependenciesReady = nextBuild.dependencies.every(dep => 
        buildResults.some(result => result.name === dep)
      );
      
      if (dependenciesReady) {
        const startTime = Math.max(availableSlots[nextSlot], currentTime);
        const endTime = startTime + nextBuild.buildTime;
        
        buildResults.push({
          name: nextBuild.name,
          startTime,
          endTime,
          buildTime: nextBuild.buildTime,
          totalBuildTime: dependencyGraph[nextBuild.name].totalBuildTime,
          slot: nextSlot
        });
        
        availableSlots[nextSlot] = endTime;
        currentTime = Math.max(currentTime, endTime);
      } else {
        // Put back in queue
        buildQueue.push(nextBuild);
      }
    }
    
    const totalBuildTime = Math.max(...buildResults.map(r => r.endTime));
    const sequentialBuildTime = packages.reduce((sum, pkg) => sum + pkg.buildTime, 0);
    const parallelizationEfficiency = sequentialBuildTime / totalBuildTime;
    
    console.log('Build optimization results:');
    console.log('Sequential build time:', sequentialBuildTime, 'ms');
    console.log('Optimized build time:', totalBuildTime, 'ms');
    console.log('Parallelization efficiency:', parallelizationEfficiency.toFixed(2));
    console.log('Build order:', buildResults.map(r => r.name).join(' → '));
    
    return {
      packages: packages.length,
      sequentialBuildTime,
      optimizedBuildTime: totalBuildTime,
      parallelizationEfficiency,
      buildResults,
      timeSavings: sequentialBuildTime - totalBuildTime,
      efficiencyGain: ((parallelizationEfficiency - 1) * 100).toFixed(1) + '%'
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Scenario 2: Code Quality Analysis and Optimization
  console.log("2. Code Quality Analysis: Identifying Optimization Opportunities");
  const result2 = await cm.executeCode(`
    const { SpatialHash, batchCollisionDetection, PerformanceTimer } = algorithms;
    
    // Simulate code analysis results across the Reynard ecosystem
    const codeFiles = [
      { path: 'packages/core/service.ts', lines: 450, complexity: 15, issues: 3, type: 'core' },
      { path: 'packages/ui/components.ts', lines: 320, complexity: 12, issues: 2, type: 'ui' },
      { path: 'packages/ai/model.ts', lines: 680, complexity: 25, issues: 5, type: 'ai' },
      { path: 'packages/algorithms/sort.ts', lines: 180, complexity: 8, issues: 1, type: 'algorithms' },
      { path: 'packages/core/utils.ts', lines: 290, complexity: 10, issues: 2, type: 'core' },
      { path: 'packages/auth/validation.ts', lines: 220, complexity: 14, issues: 4, type: 'auth' },
      { path: 'packages/ui/layout.ts', lines: 380, complexity: 18, issues: 3, type: 'ui' },
      { path: 'packages/data/processing.ts', lines: 520, complexity: 22, issues: 6, type: 'data' },
      { path: 'packages/media/image.ts', lines: 340, complexity: 16, issues: 3, type: 'media' },
      { path: 'packages/3d/renderer.ts', lines: 750, complexity: 28, issues: 7, type: '3d' }
    ];
    
    // Create spatial hash for clustering related files
    const spatialHash = new SpatialHash({
      cellSize: 100,
      worldBounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 }
    });
    
    // Map files to spatial coordinates based on complexity and lines
    const fileCoordinates = codeFiles.map((file, index) => {
      const x = file.complexity * 20; // Scale complexity
      const y = file.lines; // Use lines as Y coordinate
      
      return {
        ...file,
        x,
        y,
        width: 50,
        height: 50,
        index
      };
    });
    
    // Use batch collision detection to find related files
    const relatedFiles = batchCollisionDetection(fileCoordinates);
    
    // Analyze code quality metrics
    const qualityMetrics = {
      totalFiles: codeFiles.length,
      totalLines: codeFiles.reduce((sum, file) => sum + file.lines, 0),
      totalComplexity: codeFiles.reduce((sum, file) => sum + file.complexity, 0),
      totalIssues: codeFiles.reduce((sum, file) => sum + file.issues, 0),
      averageComplexity: 0,
      averageIssues: 0,
      highComplexityFiles: [],
      highIssueFiles: [],
      relatedFileClusters: relatedFiles.length
    };
    
    qualityMetrics.averageComplexity = qualityMetrics.totalComplexity / qualityMetrics.totalFiles;
    qualityMetrics.averageIssues = qualityMetrics.totalIssues / qualityMetrics.totalFiles;
    
    // Identify problematic files
    qualityMetrics.highComplexityFiles = codeFiles
      .filter(file => file.complexity > qualityMetrics.averageComplexity * 1.5)
      .sort((a, b) => b.complexity - a.complexity);
    
    qualityMetrics.highIssueFiles = codeFiles
      .filter(file => file.issues > qualityMetrics.averageIssues * 1.5)
      .sort((a, b) => b.issues - a.issues);
    
    // Calculate optimization priorities
    const optimizationPriorities = codeFiles.map(file => {
      const complexityScore = file.complexity / qualityMetrics.averageComplexity;
      const issueScore = file.issues / qualityMetrics.averageIssues;
      const sizeScore = file.lines / (qualityMetrics.totalLines / qualityMetrics.totalFiles);
      
      const priorityScore = (complexityScore * 0.4) + (issueScore * 0.4) + (sizeScore * 0.2);
      
      return {
        file: file.path,
        priorityScore,
        complexityScore,
        issueScore,
        sizeScore,
        recommendations: [
          complexityScore > 1.5 ? 'Refactor complex functions' : null,
          issueScore > 1.5 ? 'Fix code quality issues' : null,
          sizeScore > 1.5 ? 'Split large files' : null
        ].filter(Boolean)
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
    
    console.log('Code quality analysis:');
    console.log('Total files analyzed:', qualityMetrics.totalFiles);
    console.log('Average complexity:', qualityMetrics.averageComplexity.toFixed(2));
    console.log('Average issues per file:', qualityMetrics.averageIssues.toFixed(2));
    console.log('High complexity files:', qualityMetrics.highComplexityFiles.length);
    console.log('High issue files:', qualityMetrics.highIssueFiles.length);
    console.log('Related file clusters:', qualityMetrics.relatedFileClusters);
    
    return {
      qualityMetrics,
      optimizationPriorities: optimizationPriorities.slice(0, 5),
      relatedFileClusters: relatedFiles,
      recommendations: {
        refactoring: qualityMetrics.highComplexityFiles.length,
        bugFixes: qualityMetrics.highIssueFiles.length,
        fileSplitting: codeFiles.filter(f => f.lines > 500).length
      }
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Scenario 3: Test Suite Optimization
  console.log("3. Test Suite Optimization: Maximizing Coverage and Speed");
  const result3 = await cm.executeCode(`
    const { UnionFind, PerformanceTimer, MemoryMonitor } = algorithms;
    
    // Simulate test suite structure
    const testSuites = [
      { name: 'core-unit', files: 25, duration: 1200, coverage: 85, priority: 'high' },
      { name: 'ui-integration', files: 15, duration: 800, coverage: 70, priority: 'medium' },
      { name: 'ai-unit', files: 30, duration: 1500, coverage: 90, priority: 'high' },
      { name: 'algorithms-unit', files: 20, duration: 600, coverage: 95, priority: 'high' },
      { name: 'auth-integration', files: 12, duration: 400, coverage: 80, priority: 'medium' },
      { name: 'data-unit', files: 18, duration: 900, coverage: 75, priority: 'medium' },
      { name: 'media-integration', files: 10, duration: 300, coverage: 65, priority: 'low' },
      { name: '3d-unit', files: 22, duration: 1100, coverage: 88, priority: 'high' },
      { name: 'e2e-tests', files: 8, duration: 2000, coverage: 60, priority: 'low' },
      { name: 'performance-tests', files: 5, duration: 500, coverage: 50, priority: 'low' }
    ];
    
    // Create test dependency graph
    const testDependencies = [
      ['core-unit', 'algorithms-unit'],
      ['ui-integration', 'core-unit'],
      ['ai-unit', 'core-unit'],
      ['ai-unit', 'algorithms-unit'],
      ['auth-integration', 'core-unit'],
      ['data-unit', 'core-unit'],
      ['media-integration', 'ui-integration'],
      ['3d-unit', 'core-unit'],
      ['3d-unit', 'algorithms-unit'],
      ['e2e-tests', 'ui-integration'],
      ['e2e-tests', 'auth-integration']
    ];
    
    const timer = new PerformanceTimer();
    const memoryMonitor = new MemoryMonitor();
    
    // Build dependency graph using Union-Find
    const testIndex = {};
    testSuites.forEach((test, index) => {
      testIndex[test.name] = index;
    });
    
    const uf = new UnionFind(testSuites.length);
    const dependencyGraph = {};
    
    // Initialize dependency graph
    testSuites.forEach(test => {
      dependencyGraph[test.name] = {
        ...test,
        dependents: [],
        dependencies: [],
        totalDuration: test.duration,
        totalCoverage: test.coverage
      };
    });
    
    // Build dependency relationships
    testDependencies.forEach(([dependent, dependency]) => {
      dependencyGraph[dependent].dependencies.push(dependency);
      dependencyGraph[dependency].dependents.push(dependent);
    });
    
    // Calculate total duration including dependencies
    const calculateTotalDuration = (testName) => {
      const test = dependencyGraph[testName];
      if (test.totalDuration !== test.duration) {
        return test.totalDuration;
      }
      
      let totalDuration = test.duration;
      test.dependencies.forEach(dep => {
        totalDuration += calculateTotalDuration(dep);
      });
      
      test.totalDuration = totalDuration;
      return totalDuration;
    };
    
    // Calculate total durations
    testSuites.forEach(test => {
      calculateTotalDuration(test.name);
    });
    
    // Optimize test execution order
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    const optimizedOrder = [...testSuites].sort((a, b) => {
      const aPriority = priorityWeights[a.priority];
      const bPriority = priorityWeights[b.priority];
      const aCoverage = a.coverage;
      const bCoverage = b.coverage;
      const aDuration = dependencyGraph[a.name].totalDuration;
      const bDuration = dependencyGraph[b.name].totalDuration;
      
      // Sort by priority, then coverage, then duration
      if (aPriority !== bPriority) return bPriority - aPriority;
      if (aCoverage !== bCoverage) return bCoverage - aCoverage;
      return aDuration - bDuration;
    });
    
    // Simulate parallel test execution
    const maxParallelTests = 3;
    const executionResults = [];
    const availableSlots = Array(maxParallelTests).fill(0);
    let currentTime = 0;
    
    for (const test of optimizedOrder) {
      const nextSlot = availableSlots.indexOf(Math.min(...availableSlots));
      const startTime = Math.max(availableSlots[nextSlot], currentTime);
      const endTime = startTime + test.duration;
      
      executionResults.push({
        name: test.name,
        startTime,
        endTime,
        duration: test.duration,
        coverage: test.coverage,
        priority: test.priority,
        slot: nextSlot
      });
      
      availableSlots[nextSlot] = endTime;
      currentTime = Math.max(currentTime, endTime);
    }
    
    const totalExecutionTime = Math.max(...executionResults.map(r => r.endTime));
    const sequentialExecutionTime = testSuites.reduce((sum, test) => sum + test.duration, 0);
    const parallelizationEfficiency = sequentialExecutionTime / totalExecutionTime;
    
    // Calculate coverage metrics
    const totalCoverage = testSuites.reduce((sum, test) => sum + test.coverage, 0) / testSuites.length;
    const highCoverageTests = testSuites.filter(test => test.coverage > 85).length;
    const lowCoverageTests = testSuites.filter(test => test.coverage < 70).length;
    
    console.log('Test suite optimization:');
    console.log('Total test suites:', testSuites.length);
    console.log('Sequential execution time:', sequentialExecutionTime, 'ms');
    console.log('Optimized execution time:', totalExecutionTime, 'ms');
    console.log('Parallelization efficiency:', parallelizationEfficiency.toFixed(2));
    console.log('Average coverage:', totalCoverage.toFixed(1) + '%');
    console.log('High coverage tests:', highCoverageTests);
    console.log('Low coverage tests:', lowCoverageTests);
    
    return {
      testSuites: testSuites.length,
      sequentialExecutionTime,
      optimizedExecutionTime: totalExecutionTime,
      parallelizationEfficiency,
      totalCoverage,
      highCoverageTests,
      lowCoverageTests,
      executionResults,
      optimizationGain: ((parallelizationEfficiency - 1) * 100).toFixed(1) + '%'
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Scenario 4: Memory Usage Optimization
  console.log("4. Memory Usage Optimization: Efficient Resource Management");
  const result4 = await cm.executeCode(`
    const { MemoryMonitor, PerformanceTimer } = algorithms;
    
    // Simulate development processes with memory usage
    const developmentProcesses = [
      { name: 'TypeScript Compilation', memoryUsage: 512, duration: 5000, frequency: 'high' },
      { name: 'ESLint Analysis', memoryUsage: 256, duration: 2000, frequency: 'high' },
      { name: 'Prettier Formatting', memoryUsage: 128, duration: 1000, frequency: 'high' },
      { name: 'Test Execution', memoryUsage: 1024, duration: 8000, frequency: 'medium' },
      { name: 'Build Process', memoryUsage: 2048, duration: 15000, frequency: 'medium' },
      { name: 'Documentation Generation', memoryUsage: 384, duration: 3000, frequency: 'low' },
      { name: 'Coverage Analysis', memoryUsage: 768, duration: 4000, frequency: 'low' },
      { name: 'Security Scanning', memoryUsage: 512, duration: 6000, frequency: 'low' }
    ];
    
    const memoryMonitor = new MemoryMonitor();
    const timer = new PerformanceTimer();
    
    // Simulate memory-efficient process scheduling
    const maxMemoryUsage = 4096; // 4GB limit
    const processQueue = [...developmentProcesses];
    const scheduledProcesses = [];
    let currentMemoryUsage = 0;
    let currentTime = 0;
    
    // Sort processes by priority (frequency and memory efficiency)
    const frequencyWeights = { high: 3, medium: 2, low: 1 };
    processQueue.sort((a, b) => {
      const aPriority = frequencyWeights[a.frequency];
      const bPriority = frequencyWeights[b.frequency];
      const aEfficiency = a.duration / a.memoryUsage; // Time per MB
      const bEfficiency = b.duration / b.memoryUsage;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return aEfficiency - bEfficiency; // Lower is better (less time per MB)
    });
    
    // Schedule processes with memory constraints
    while (processQueue.length > 0) {
      const process = processQueue.shift();
      
      // Check if process can fit in memory
      if (currentMemoryUsage + process.memoryUsage <= maxMemoryUsage) {
        const startTime = currentTime;
        const endTime = startTime + process.duration;
        
        scheduledProcesses.push({
          ...process,
          startTime,
          endTime,
          memoryEfficiency: process.duration / process.memoryUsage
        });
        
        currentMemoryUsage += process.memoryUsage;
        currentTime = endTime;
        
        // Simulate memory cleanup after process completion
        currentMemoryUsage -= process.memoryUsage;
      } else {
        // Process doesn't fit, need to wait for memory to be freed
        const nextAvailableTime = Math.max(...scheduledProcesses.map(p => p.endTime));
        currentTime = nextAvailableTime;
        currentMemoryUsage = 0; // All processes completed
        
        // Retry scheduling this process
        processQueue.unshift(process);
      }
    }
    
    const totalExecutionTime = Math.max(...scheduledProcesses.map(p => p.endTime));
    const sequentialExecutionTime = developmentProcesses.reduce((sum, p) => sum + p.duration, 0);
    const memoryEfficiency = sequentialExecutionTime / totalExecutionTime;
    
    // Calculate memory optimization metrics
    const averageMemoryUsage = scheduledProcesses.reduce((sum, p) => sum + p.memoryUsage, 0) / scheduledProcesses.length;
    const peakMemoryUsage = Math.max(...scheduledProcesses.map(p => p.memoryUsage));
    const memoryUtilization = (averageMemoryUsage / maxMemoryUsage) * 100;
    
    console.log('Memory optimization results:');
    console.log('Total processes:', developmentProcesses.length);
    console.log('Sequential execution time:', sequentialExecutionTime, 'ms');
    console.log('Optimized execution time:', totalExecutionTime, 'ms');
    console.log('Memory efficiency:', memoryEfficiency.toFixed(2));
    console.log('Average memory usage:', averageMemoryUsage.toFixed(0), 'MB');
    console.log('Peak memory usage:', peakMemoryUsage, 'MB');
    console.log('Memory utilization:', memoryUtilization.toFixed(1) + '%');
    
    return {
      totalProcesses: developmentProcesses.length,
      sequentialExecutionTime,
      optimizedExecutionTime: totalExecutionTime,
      memoryEfficiency,
      averageMemoryUsage,
      peakMemoryUsage,
      memoryUtilization,
      scheduledProcesses,
      timeSavings: sequentialExecutionTime - totalExecutionTime,
      memorySavings: maxMemoryUsage - peakMemoryUsage
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  // Scenario 5: Agent Workload Distribution
  console.log("5. Agent Workload Distribution: Optimizing AI Agent Collaboration");
  const result5 = await cm.executeCode(`
    const { UnionFind, PerformanceTimer } = algorithms;
    
    // Simulate AI agent capabilities and tasks
    const agents = [
      { id: 'fox-agent', type: 'strategic', capacity: 10, specialties: ['architecture', 'optimization', 'planning'] },
      { id: 'otter-agent', type: 'quality', capacity: 8, specialties: ['testing', 'documentation', 'review'] },
      { id: 'wolf-agent', type: 'security', capacity: 6, specialties: ['security', 'performance', 'monitoring'] },
      { id: 'eagle-agent', type: 'vision', capacity: 7, specialties: ['analysis', 'research', 'strategy'] },
      { id: 'lion-agent', type: 'leadership', capacity: 9, specialties: ['coordination', 'management', 'decision'] }
    ];
    
    const tasks = [
      { id: 'task-1', type: 'architecture', priority: 1, estimatedTime: 5000, complexity: 'high', dependencies: [] },
      { id: 'task-2', type: 'testing', priority: 3, estimatedTime: 2000, complexity: 'medium', dependencies: ['task-1'] },
      { id: 'task-3', type: 'security', priority: 0, estimatedTime: 8000, complexity: 'high', dependencies: [] },
      { id: 'task-4', type: 'documentation', priority: 2, estimatedTime: 3000, complexity: 'low', dependencies: ['task-1'] },
      { id: 'task-5', type: 'optimization', priority: 1, estimatedTime: 4000, complexity: 'medium', dependencies: ['task-1'] },
      { id: 'task-6', type: 'performance', priority: 4, estimatedTime: 1000, complexity: 'low', dependencies: ['task-3'] },
      { id: 'task-7', type: 'analysis', priority: 0, estimatedTime: 6000, complexity: 'high', dependencies: [] },
      { id: 'task-8', type: 'review', priority: 2, estimatedTime: 2500, complexity: 'medium', dependencies: ['task-2'] },
      { id: 'task-9', type: 'coordination', priority: 1, estimatedTime: 3500, complexity: 'medium', dependencies: ['task-7'] },
      { id: 'task-10', type: 'monitoring', priority: 3, estimatedTime: 1500, complexity: 'low', dependencies: ['task-6'] }
    ];
    
    // Create task dependency graph
    const taskDependencies = [
      ['task-2', 'task-1'],
      ['task-4', 'task-1'],
      ['task-5', 'task-1'],
      ['task-6', 'task-3'],
      ['task-8', 'task-2'],
      ['task-9', 'task-7'],
      ['task-10', 'task-6']
    ];
    
    const timer = new PerformanceTimer();
    
    // Build dependency graph
    const taskIndex = {};
    tasks.forEach((task, index) => {
      taskIndex[task.id] = index;
    });
    
    const uf = new UnionFind(tasks.length);
    const dependencyGraph = {};
    
    // Initialize dependency graph
    tasks.forEach(task => {
      dependencyGraph[task.id] = {
        ...task,
        dependents: [],
        dependencies: [],
        totalTime: task.estimatedTime,
        assignedAgent: null,
        startTime: null,
        endTime: null
      };
    });
    
    // Build dependency relationships
    taskDependencies.forEach(([dependent, dependency]) => {
      dependencyGraph[dependent].dependencies.push(dependency);
      dependencyGraph[dependency].dependents.push(dependent);
    });
    
    // Calculate total time including dependencies
    const calculateTotalTime = (taskId) => {
      const task = dependencyGraph[taskId];
      if (task.totalTime !== task.estimatedTime) {
        return task.totalTime;
      }
      
      let totalTime = task.estimatedTime;
      task.dependencies.forEach(dep => {
        totalTime += calculateTotalTime(dep);
      });
      
      task.totalTime = totalTime;
      return totalTime;
    };
    
    // Calculate total times
    tasks.forEach(task => {
      calculateTotalTime(task.id);
    });
    
    // Create agent-task compatibility matrix
    const compatibilityMatrix = {};
    agents.forEach(agent => {
      compatibilityMatrix[agent.id] = {};
      tasks.forEach(task => {
        const isCompatible = agent.specialties.includes(task.type);
        const capacityScore = agent.capacity;
        const complexityMatch = task.complexity === 'high' ? agent.capacity >= 8 : 
                               task.complexity === 'medium' ? agent.capacity >= 6 : true;
        
        compatibilityMatrix[agent.id][task.id] = {
          compatible: isCompatible && complexityMatch,
          score: isCompatible ? capacityScore : 0,
          priority: task.priority
        };
      });
    });
    
    // Assign tasks to agents using optimized algorithm
    const assignments = [];
    const agentWorkloads = {};
    agents.forEach(agent => {
      agentWorkloads[agent.id] = { currentLoad: 0, tasks: [], totalTime: 0 };
    });
    
    // Sort tasks by priority and total time
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return dependencyGraph[a.id].totalTime - dependencyGraph[b.id].totalTime;
    });
    
    // Assign tasks with dependency resolution
    sortedTasks.forEach(task => {
      let bestAgent = null;
      let bestScore = -1;
      
      agents.forEach(agent => {
        const compatibility = compatibilityMatrix[agent.id][task.id];
        if (compatibility.compatible && agentWorkloads[agent.id].currentLoad < agent.capacity) {
          // Check if dependencies are satisfied
          const dependenciesSatisfied = task.dependencies.every(dep => 
            assignments.some(assignment => assignment.task === dep)
          );
          
          if (dependenciesSatisfied) {
            const score = compatibility.score - agentWorkloads[agent.id].currentLoad;
            if (score > bestScore) {
              bestScore = score;
              bestAgent = agent;
            }
          }
        }
      });
      
      if (bestAgent) {
        const startTime = agentWorkloads[bestAgent.id].totalTime;
        const endTime = startTime + task.estimatedTime;
        
        assignments.push({
          task: task.id,
          agent: bestAgent.id,
          taskType: task.type,
          priority: task.priority,
          estimatedTime: task.estimatedTime,
          startTime,
          endTime
        });
        
        agentWorkloads[bestAgent.id].currentLoad++;
        agentWorkloads[bestAgent.id].tasks.push(task.id);
        agentWorkloads[bestAgent.id].totalTime = endTime;
      }
    });
    
    // Calculate distribution metrics
    const totalTasks = tasks.length;
    const assignedTasks = assignments.length;
    const assignmentRate = assignedTasks / totalTasks;
    
    const agentUtilization = agents.map(agent => ({
      agent: agent.id,
      capacity: agent.capacity,
      currentLoad: agentWorkloads[agent.id].currentLoad,
      utilization: (agentWorkloads[agent.id].currentLoad / agent.capacity) * 100,
      totalTime: agentWorkloads[agent.id].totalTime,
      tasks: agentWorkloads[agent.id].tasks
    }));
    
    const averageUtilization = agentUtilization.reduce((sum, agent) => sum + agent.utilization, 0) / agents.length;
    const totalExecutionTime = Math.max(...agentUtilization.map(a => a.totalTime));
    
    console.log('Agent workload distribution:');
    console.log('Total tasks:', totalTasks);
    console.log('Assigned tasks:', assignedTasks);
    console.log('Assignment rate:', (assignmentRate * 100).toFixed(1) + '%');
    console.log('Average agent utilization:', averageUtilization.toFixed(1) + '%');
    console.log('Total execution time:', totalExecutionTime, 'ms');
    
    return {
      totalTasks,
      assignedTasks,
      assignmentRate,
      averageUtilization,
      totalExecutionTime,
      agentUtilization,
      assignments,
      unassignedTasks: totalTasks - assignedTasks,
      efficiency: (assignmentRate * averageUtilization / 100).toFixed(3)
    };
  `);
  console.log("Result:", result5.returned);
  console.log("Logs:", result5.logs);
  console.log();

  console.log("=== Development Workflow Optimization Complete ===");
  
  // Cleanup MCP client
  cm.cleanup();
  
  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the optimization demonstration
demonstrateDevelopmentOptimization().catch((error) => {
  console.error("Optimization demo failed:", error);
  process.exit(1);
});


