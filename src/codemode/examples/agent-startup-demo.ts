import { codemode } from "../codemode";

async function demonstrateAgentStartup() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 15000 });

  console.log("=== Agent Startup Sequence Demo ===\n");

  // Example 1: Basic Agent Context Setup
  console.log("1. Basic Agent Context Setup");
  const result1 = await cm.executeCode(`
    // Get current time and location for agent context
    const timeResult = await tools.get_current_time();
    const locationResult = await tools.get_current_location();
    
    const currentTime = timeResult.content?.[0]?.text || 'Unknown time';
    const currentLocation = locationResult.content?.[0]?.text || 'Unknown location';
    
    console.log('Current time:', currentTime);
    console.log('Current location:', currentLocation);
    
    // Get available spirits for agent selection
    const spiritsResult = await tools.get_available_spirits();
    const availableSpirits = spiritsResult.content?.[0]?.text || 'No spirits available';
    
    console.log('Available spirits:', availableSpirits);
    
    return {
      currentTime,
      currentLocation,
      availableSpirits,
      agentContext: {
        timestamp: currentTime,
        location: currentLocation,
        spirits: availableSpirits
      }
    };
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Example 2: Agent Spirit and Class Selection
  console.log("2. Agent Spirit and Class Selection");
  const result2 = await cm.executeCode(`
    // Get available spirits and classes for agent configuration
    const spiritsResult = await tools.get_available_spirits();
    const classesResult = await tools.get_available_classes();
    
    const availableSpirits = spiritsResult.content?.[0]?.text || 'No spirits';
    const availableClasses = classesResult.content?.[0]?.text || 'No classes';
    
    console.log('Available spirits:', availableSpirits);
    console.log('Available classes:', availableClasses);
    
    // Get component statistics
    const statsResult = await tools.get_component_statistics();
    const componentStats = statsResult.content?.[0]?.text || 'No stats';
    
    console.log('Component statistics:', componentStats);
    
    return {
      availableSpirits,
      availableClasses,
      componentStats,
      agentConfiguration: {
        spirits: availableSpirits,
        classes: availableClasses,
        stats: componentStats
      }
    };
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Example 3: Agent Tool Configuration
  console.log("3. Agent Tool Configuration");
  const result3 = await cm.executeCode(`
    // Get tool configurations and status
    const toolConfigsResult = await tools.get_tool_configs();
    const toolStatusResult = await tools.get_tool_status();
    const toolMetadataResult = await tools.get_tool_metadata();
    
    const toolConfigs = toolConfigsResult.content?.[0]?.text || 'No configs';
    const toolStatus = toolStatusResult.content?.[0]?.text || 'No status';
    const toolMetadata = toolMetadataResult.content?.[0]?.text || 'No metadata';
    
    console.log('Tool configurations:', toolConfigs);
    console.log('Tool status:', toolStatus);
    console.log('Tool metadata:', toolMetadata);
    
    // List tools by category
    const toolsByCategoryResult = await tools.list_tools_by_category();
    const toolsByCategory = toolsByCategoryResult.content?.[0]?.text || 'No categories';
    
    console.log('Tools by category:', toolsByCategory);
    
    return {
      toolConfigs,
      toolStatus,
      toolMetadata,
      toolsByCategory,
      agentTools: {
        configs: toolConfigs,
        status: toolStatus,
        metadata: toolMetadata,
        categories: toolsByCategory
      }
    };
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Example 4: Agent Development Tools
  console.log("4. Agent Development Tools");
  const result4 = await cm.executeCode(`
    // Test development tools available to agents
    const devTools = {};
    
    // Test version information
    const versionsResult = await tools.get_versions();
    const pythonVersionResult = await tools.get_python_version();
    
    devTools.versions = versionsResult.content?.[0]?.text || 'No versions';
    devTools.pythonVersion = pythonVersionResult.content?.[0]?.text || 'No Python version';
    
    console.log('System versions:', devTools.versions);
    console.log('Python version:', devTools.pythonVersion);
    
    // Test VS Code integration
    const vscodeTasksResult = await tools.discover_vscode_tasks();
    const vscodeTasks = vscodeTasksResult.content?.[0]?.text || 'No VS Code tasks';
    
    console.log('VS Code tasks:', vscodeTasks);
    
    // Test desktop notification
    const notificationResult = await tools.send_desktop_notification({
      title: "Agent Startup Demo",
      message: "Agent development tools are working!"
    });
    
    console.log('Notification sent:', notificationResult.content?.[0]?.text || 'No notification result');
    
    return {
      devTools,
      vscodeTasks,
      notificationResult: notificationResult.content?.[0]?.text,
      agentCapabilities: {
        versionInfo: devTools.versions,
        pythonVersion: devTools.pythonVersion,
        vscodeIntegration: vscodeTasks,
        notifications: true
      }
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  // Example 5: Complete Agent Workflow
  console.log("5. Complete Agent Workflow");
  const result5 = await cm.executeCode(`
    // Complete agent initialization and setup workflow
    const workflowAgentId = "workflow-demo-agent";
    
    console.log('Starting complete agent workflow...');
    
    // Step 1: Get available spirits and select one
    const spiritsResult = await tools.get_available_spirits();
    const availableSpirits = spiritsResult.content?.[0]?.text || 'No spirits';
    console.log('Available spirits:', availableSpirits);
    
    // Step 2: Get current time for context
    const timeResult = await tools.get_current_time();
    const currentTime = timeResult.content?.[0]?.text || 'Unknown time';
    console.log('Current time:', currentTime);
    
    // Step 3: Get location for context
    const locationResult = await tools.get_current_location();
    const location = locationResult.content?.[0]?.text || 'Unknown location';
    console.log('Current location:', location);
    
    // Step 4: Get system information
    const versionsResult = await tools.get_versions();
    const systemVersions = versionsResult.content?.[0]?.text || 'No versions';
    console.log('System versions:', systemVersions);
    
    // Step 5: Test development capabilities
    const vscodeTasksResult = await tools.discover_vscode_tasks();
    const vscodeTasks = vscodeTasksResult.content?.[0]?.text || 'No VS Code tasks';
    console.log('VS Code tasks available:', vscodeTasks);
    
    // Step 6: Send startup notification
    const notificationResult = await tools.send_desktop_notification({
      title: "Agent Workflow Complete",
      message: \`Agent \${workflowAgentId} has completed startup workflow\`
    });
    
    console.log('Startup notification sent:', notificationResult.content?.[0]?.text || 'Notification failed');
    
    return {
      agentId: workflowAgentId,
      availableSpirits,
      time: currentTime,
      location: location,
      systemVersions,
      vscodeTasks,
      notificationResult: notificationResult.content?.[0]?.text,
      workflowSteps: [
        'spirit_discovery',
        'time_context',
        'location_context',
        'system_info',
        'development_tools',
        'startup_notification'
      ],
      agentReady: true
    };
  `);
  console.log("Result:", result5.returned);
  console.log("Logs:", result5.logs);
  console.log();

  console.log("=== Agent Startup Demo Complete ===");

  // Cleanup MCP client
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the demo
demonstrateAgentStartup().catch(error => {
  console.error("Demo failed:", error);
  process.exit(1);
});
