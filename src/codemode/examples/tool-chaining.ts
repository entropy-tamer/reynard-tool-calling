import { codemode } from "../codemode";

async function demonstrateToolChaining() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 15000 });

  console.log("=== MCP Code Mode Tool Chaining Demo ===\n");

  // Example 1: Simple tool call
  console.log("1. Simple tool call - getting current time:");
  const result1 = await cm.executeCode(`
    const time = await mcp.get_current_time();
    console.log('Current time response:', JSON.stringify(time, null, 2));
    return time;
  `);
  console.log("Result:", result1.returned);
  console.log("Logs:", result1.logs);
  console.log();

  // Example 2: Tool chaining - get time and location
  console.log("2. Tool chaining - get time and location:");
  const result2 = await cm.executeCode(`
    console.log('Fetching current time...');
    const time = await mcp.get_current_time();
    console.log('Time response:', JSON.stringify(time, null, 2));
    
    console.log('Fetching location...');
    const location = await mcp.get_current_location();
    console.log('Location response:', JSON.stringify(location, null, 2));
    
    // Extract text content from MCP responses
    const timeText = time.content?.[0]?.text || 'No time data';
    const locationText = location.content?.[0]?.text || 'No location data';
    
    const summary = {
      timeResponse: time,
      locationResponse: location,
      extractedTime: timeText,
      extractedLocation: locationText
    };
    
    console.log('Summary:', JSON.stringify(summary, null, 2));
    return summary;
  `);
  console.log("Result:", result2.returned);
  console.log("Logs:", result2.logs);
  console.log();

  // Example 3: Error handling
  console.log("3. Error handling example:");
  const result3 = await cm.executeCode(`
    try {
      console.log('Attempting to call a non-existent tool...');
      await mcp.non_existent_tool({});
    } catch (error) {
      console.log('Caught error:', error.message);
      return { error: error.message, handled: true };
    }
  `);
  console.log("Result:", result3.returned);
  console.log("Logs:", result3.logs);
  console.log();

  // Example 4: Complex workflow - agent naming
  console.log("4. Complex workflow - agent naming:");
  const result4 = await cm.executeCode(`
    console.log('Starting agent naming workflow...');
    
    // Generate a name
    const nameResult = await mcp.generate_agent_name({
      specialist: 'fox',
      style: 'foundation'
    });
    console.log('Generated name response:', JSON.stringify(nameResult, null, 2));
    
    // Extract the generated name
    const generatedName = nameResult.content?.[0]?.text || 'No name generated';
    console.log('Extracted name:', generatedName);
    
    // Assign the name
    const assignResult = await mcp.assign_agent_name({
      agent_id: 'demo-agent',
      name: generatedName
    });
    console.log('Assignment result:', JSON.stringify(assignResult, null, 2));
    
    // Get the assigned name
    const getResult = await mcp.get_agent_name({
      agent_id: 'demo-agent'
    });
    console.log('Retrieved name response:', JSON.stringify(getResult, null, 2));
    
    return {
      generatedResponse: nameResult,
      generatedName: generatedName,
      assignedResponse: assignResult,
      retrievedResponse: getResult
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  console.log("=== Demo Complete ===");
  
  // Cleanup MCP client
  cm.cleanup();
  
  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the demo
demonstrateToolChaining().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
