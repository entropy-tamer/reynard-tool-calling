/**
 * @file Agent Startup Sequence Demo
 *
 * Demonstrates the complete agent startup sequence with native TypeScript tools
 * for CodeMode execution. This includes agent naming, temporal
 * awareness, location detection, and health validation.
 */

import { codemode } from "../codemode";

async function main() {
  console.log("🦊 Starting Agent Startup Sequence");
  console.log("===================================");

  const cm = await codemode({
    projectRoot: process.cwd(),
    timeoutMs: 10000,
  });

  // Health check
  console.log("\n📊 Health Check:");
  const health = await cm.healthCheck();
  console.log("Health:", health);

  // Complete startup sequence - generate name, assign it, get context
  console.log("\n✨ Generating Agent Identity...");
  const result = await cm.executeCode(`
    // Step 1: Choose your spirit (randomly selected from available specialists)
    const specialists = ['fox', 'wolf', 'otter', 'eagle', 'lion'];
    const spirit = specialists[Math.floor(Math.random() * specialists.length)];
    
    // Step 2: Generate your name based on your spirit
    const nameResult = await tools.agent.NamingTools.generateAgentName({
      specialist: spirit,
      style: 'foundation'
    });
    
    // Step 3: Assign your name (makes it persistent!)
    await tools.agent.NamingTools.assignAgentName({
      agentId: 'current-session',
      name: nameResult.data.name
    });

    // Step 4: Get temporal context
    const timeResult = await tools.agent.TimeTools.getCurrentTime();
    
    // Step 5: Get location context
    const locationResult = await tools.agent.LocationTools.getCurrentLocation();

    // Return everything for your introduction
    return {
      name: nameResult.data.name,
      spirit: spirit,
      style: nameResult.data.style,
      time: timeResult.data.local,
      iso: timeResult.data.iso,
      location: locationResult.data.city,
      country: locationResult.data.country,
      timezone: timeResult.data.timezone
    };
  `);

  // Display results
  console.log("\n🎉 Agent Identity Established!");
  console.log("=================================");
  console.log(`🦊 Agent Name: ${result.returned.name}`);
  console.log(`🎭 Spirit: ${result.returned.spirit}`);
  console.log(`📝 Style: ${result.returned.style}`);
  console.log(`⏰ Time: ${result.returned.time}`);
  console.log(`🌍 Location: ${result.returned.location}, ${result.returned.country}`);
  console.log(`🌐 Timezone: ${result.returned.timezone}`);
  
  console.log("\n✅ Agent Startup Sequence Complete!");
  console.log("All tools are working with native TypeScript implementation.");
  console.log("\n💡 Use this information to introduce yourself with personality!");

  // Clean up and exit
  cm.cleanup();
  process.exit(0);
}

main().catch(error => {
  console.error("Demo failed:", error);
  process.exit(1);
});
