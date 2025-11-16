/**
 * @file Agent Startup Sequence Demo
 *
 * Demonstrates the complete agent startup sequence with native TypeScript tools
 * for CodeMode execution. This includes agent naming, temporal
 * awareness, location detection, and health validation.
 */

import { codemode } from "../codemode";

/**
 * Get emoji for a given spirit name
 *
 * @param spirit - The spirit name (e.g., "fox", "wolf", "otter")
 * @returns The emoji character for the spirit, or 🦊 as fallback
 * @example
 * ```ts
 * getSpiritEmoji("wolf") // Returns "🐺"
 * getSpiritEmoji("dragon") // Returns "🐉"
 * ```
 */
function getSpiritEmoji(spirit: string): string {
  const emojiMap: Record<string, string> = {
    fox: "🦊",
    wolf: "🐺",
    otter: "🦦",
    dragon: "🐉",
    eagle: "🦅",
    lion: "🦁",
    tiger: "🐅",
    phoenix: "🔥",
    alien: "👽",
    yeti: "🧊",
  };
  return emojiMap[spirit.toLowerCase()] || "🦊"; // Default to fox if unknown
}

/**
 * Display the agent identity results with appropriate emoji
 *
 * @param result - The agent identity result object
 * @param result.name - The generated agent name
 * @param result.spirit - The spirit type (e.g., "fox", "wolf", "otter")
 * @param result.style - The naming style used
 * @param result.time - The current local time
 * @param result.location - The current city location
 * @param result.country - The current country
 * @param result.timezone - The current timezone
 * @example
 * ```ts
 * displayAgentIdentity({
 *   name: "Cunning-Scribe-42",
 *   spirit: "fox",
 *   style: "foundation",
 *   time: "Sun Nov 16 2025 08:22:28 GMT+0100",
 *   location: "Karlshagen",
 *   country: "Germany",
 *   timezone: "Europe/Berlin"
 * });
 * ```
 */
function displayAgentIdentity(result: {
  name: string;
  spirit: string;
  style: string;
  time: string;
  location: string;
  country: string;
  timezone: string;
}): void {
  const spiritEmoji = getSpiritEmoji(result.spirit);

  console.log("\n🎉 Agent Identity Established!");
  console.log("=================================");
  console.log(`${spiritEmoji} Agent Name: ${result.name}`);
  console.log(`🎭 Spirit: ${result.spirit}`);
  console.log(`📝 Style: ${result.style}`);
  console.log(`⏰ Time: ${result.time}`);
  console.log(`🌍 Location: ${result.location}, ${result.country}`);
  console.log(`🌐 Timezone: ${result.timezone}`);

  console.log("\n✅ Agent Startup Sequence Complete!");
  console.log("All tools are working with native TypeScript implementation.");
  console.log(`\n💡 CRITICAL: Now introduce yourself to the user in a friendly, warm manner!`);
  console.log(`   Use your ${result.spirit} spirit's personality (${spiritEmoji}) to create an authentic greeting.`);
  console.log("   Include your name, spirit, time, and ask how you can help.");
  console.log("   Do NOT proceed with any tasks until you've introduced yourself!");
}

/**
 * Main function to run the agent startup sequence
 * Generates agent identity, gets temporal and location context, and displays results
 *
 * @example
 * ```ts
 * main().catch(error => {
 *   console.error("Demo failed:", error);
 *   process.exit(1);
 * });
 * ```
 */
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
    // IMPORTANT: After this startup sequence completes, you MUST introduce yourself
    // to the user in a friendly, warm manner before proceeding with any tasks.
    // Use your spirit's personality to create an authentic, memorable greeting!
    
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
    // REMEMBER: After receiving this data, immediately introduce yourself to the user
    // in a friendly, warm way that reflects your spirit's personality!
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

  displayAgentIdentity(result.returned);

  // Clean up and exit
  cm.cleanup();
  process.exit(0);
}

main().catch(error => {
  console.error("Demo failed:", error);
  process.exit(1);
});
