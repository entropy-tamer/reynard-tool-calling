import { codemode } from "../codemode";

async function listAvailableTools() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 10000 });

  console.log("=== Available MCP Tools ===\n");

  const result = await cm.executeCode(`
    // List all available MCP tools
    console.log('Available MCP tools:');
    
    // Get the tools from the mcp object
    const toolNames = Object.keys(mcp);
    console.log('Tool names:', toolNames);
    
    // Try to call a few common tools to see what's available
    const testResults = {};
    
    // Test some common tool patterns
    const commonToolNames = [
      'agent_startup_sequence',
      'generate_agent_name', 
      'assign_agent_name',
      'get_agent_name',
      'list_agent_names',
      'roll_agent_spirit',
      'get_current_time',
      'get_current_location',
      'send_desktop_notification',
      'lint_frontend',
      'format_frontend',
      'lint_python',
      'format_python',
      'validate_comprehensive',
      'scan_security',
      'run_all_linting',
      'get_versions',
      'get_python_version',
      'get_node_version',
      'get_typescript_version',
      'search_files',
      'list_files',
      'semantic_search',
      'search_code_patterns',
      'open_image',
      'search_images',
      'get_image_info',
      'validate_mermaid_diagram',
      'render_mermaid_to_svg',
      'render_mermaid_to_png',
      'discover_vscode_tasks',
      'validate_vscode_task',
      'execute_vscode_task',
      'get_vscode_task_info'
    ];
    
    for (const toolName of commonToolNames) {
      if (mcp[toolName]) {
        console.log(\`✓ \${toolName} - available\`);
        testResults[toolName] = 'available';
      } else {
        console.log(\`✗ \${toolName} - not available\`);
        testResults[toolName] = 'not available';
      }
    }
    
    return {
      totalTools: toolNames.length,
      toolNames: toolNames,
      testResults: testResults,
      availableTools: Object.keys(testResults).filter(tool => testResults[tool] === 'available')
    };
  `);

  console.log("Result:", result.returned);
  console.log("Logs:", result.logs);
  
  // Cleanup MCP client
  cm.cleanup();
  
  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the tool listing
listAvailableTools().catch((error) => {
  console.error("Tool listing failed:", error);
  process.exit(1);
});
