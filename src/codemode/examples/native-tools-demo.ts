/**
 * @file Native Tools Demo
 * 
 * Demonstrates the new native TypeScript tool system
 * that replaces the Python MCP server.
 */

import { codemode } from '../codemode';

async function main() {
  console.log('🚀 Starting Native Tools Demo');
  console.log('================================');

  const cm = await codemode({
    projectRoot: process.cwd(),
    timeoutMs: 10000
  });

  // Test health check
  console.log('\n📊 Health Check:');
  const health = await cm.healthCheck();
  console.log('Health:', health);

  // Test agent tools
  console.log('\n🦊 Agent Tools:');
  const timeResult = await cm.executeCode(`
    const time = await tools.agent.TimeTools.getCurrentTime();
    console.log('Current time:', time.data.iso);
    return time;
  `);
  console.log('Time result:', timeResult.returned);

  // Test location tools
  console.log('\n🌍 Location Tools:');
  const locationResult = await cm.executeCode(`
    const location = await tools.agent.LocationTools.getCurrentLocation();
    console.log('Location:', location.data.city, location.data.country);
    return location;
  `);
  console.log('Location result:', locationResult.returned);

  // Test naming tools
  console.log('\n🏷️ Naming Tools:');
  const namingResult = await cm.executeCode(`
    const name = await tools.agent.NamingTools.generateAgentName({
      specialist: 'fox',
      style: 'foundation'
    });
    console.log('Generated name:', name.data.name);
    return name;
  `);
  console.log('Naming result:', namingResult.returned);

  // Test development tools
  console.log('\n🛠️ Development Tools:');
  const lintResult = await cm.executeCode(`
    const lint = await tools.development.LintingTools.lintFrontend({
      files: ['src'],
      fix: false
    });
    console.log('Lint result:', lint.success);
    return lint;
  `);
  console.log('Lint result:', lintResult.returned);

  console.log('\n✅ Native Tools Demo Complete!');
  console.log('All tools are working with native TypeScript implementation.');
}

main().catch(console.error);
