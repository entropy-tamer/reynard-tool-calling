import { codemode } from "../codemode";

async function listAvailableTools() {
  const projectRoot = "/home/kade/runeset/reynard";
  const cm = await codemode({ projectRoot, timeoutMs: 10000 });

  console.log("=== Available Native Tools (Codemode) ===\n");

  const result = await cm.executeCode(`
    // List top-level tool categories from native tools
    const categories = Object.keys(tools);
    console.log('Tool categories:', categories);

    // Probe some known native tools
    const probes = {
      time: typeof tools.agent?.TimeTools?.getCurrentTime === 'function',
      location: typeof tools.agent?.LocationTools?.getCurrentLocation === 'function',
      naming: typeof tools.agent?.NamingTools?.generateAgentName === 'function',
      notify: typeof tools.agent?.NotificationTools?.sendDesktopNotification === 'function',
    };
    console.log('Probe:', probes);

    return { categories, probes };
  `);

  console.log("Result:", result.returned);
  console.log("Logs:", result.logs);

  // Cleanup
  cm.cleanup();

  // Force exit after cleanup
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// Run the tool listing
listAvailableTools().catch(error => {
  console.error("Tool listing failed:", error);
  process.exit(1);
});
