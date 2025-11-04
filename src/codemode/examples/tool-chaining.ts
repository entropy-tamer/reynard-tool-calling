import { codemode } from "../codemode";

async function demonstrateToolChaining() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 15000 });

  console.log("=== Codemode Tool Chaining Demo (Native Tools) ===\n");

  // Example 1: Simple tool call
  console.log("1. Simple tool call - getting current time:");
  const result1 = await cm.executeCode(`
    const time = await tools.agent.TimeTools.getCurrentTime();
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
    const time = await tools.agent.TimeTools.getCurrentTime();
    console.log('Time response:', JSON.stringify(time, null, 2));
    
    console.log('Fetching location...');
    const location = await tools.agent.LocationTools.getCurrentLocation();
    console.log('Location response:', JSON.stringify(location, null, 2));
    
    const summary = {
      time,
      location
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
      // @ts-ignore - intentionally calling something that does not exist
      await tools.agent.TimeTools.nonExistentMethod({});
    } catch (error) {
      console.log('Caught error:', (error as Error).message);
      return { error: (error as Error).message, handled: true };
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
    const nameResult = await tools.agent.NamingTools.generateAgentName({
      specialist: 'fox',
      style: 'foundation'
    });
    console.log('Generated name response:', JSON.stringify(nameResult, null, 2));
    
    const generatedName = nameResult.data?.name || 'No name generated';
    console.log('Extracted name:', generatedName);
    
    // Assign the name
    const assignResult = await tools.agent.NamingTools.assignAgentName({
      agentId: 'demo-agent',
      name: generatedName
    });
    console.log('Assignment result:', JSON.stringify(assignResult, null, 2));
    
    // Get the assigned name
    const getResult = await tools.agent.NamingTools.getAgentName({
      agentId: 'demo-agent'
    });
    console.log('Retrieved name response:', JSON.stringify(getResult, null, 2));
    
    return {
      generatedResponse: nameResult,
      generatedName,
      assignedResponse: assignResult,
      retrievedResponse: getResult
    };
  `);
  console.log("Result:", result4.returned);
  console.log("Logs:", result4.logs);
  console.log();

  console.log("=== Demo Complete ===");

  // Cleanup
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the demo
demonstrateToolChaining().catch(error => {
  console.error("Demo failed:", error);
  process.exit(1);
});
