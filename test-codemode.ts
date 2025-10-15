import { codemode } from "./src/codemode/codemode";

/**
 *
 * @example
 */
async function main() {
  try {
    console.log("🦊 Testing codemode functionality...");

    const projectRoot = "/home/kade/runeset/reynard";
    const cm = await codemode({ projectRoot, timeoutMs: 10000 });

    console.log("✅ Codemode initialized successfully");

    // Test getting last 3 git commits
    const code = `
      const { execSync } = require('child_process');
      
      try {
        // Get last 3 git commits
        const gitLog = execSync('git log --oneline -3', { 
          encoding: 'utf8',
          cwd: '/home/kade/runeset/reynard'
        });
        
        const commits = gitLog.trim().split('\\n').map(line => {
          const [hash, ...messageParts] = line.split(' ');
          return {
            hash: hash.substring(0, 7),
            message: messageParts.join(' ')
          };
        });
        
        console.log('📝 Last 3 git commits:');
        commits.forEach((commit, index) => {
          console.log(\`\${index + 1}. [\${commit.hash}] \${commit.message}\`);
        });
        
        return {
          success: true,
          commits: commits,
          summary: \`Found \${commits.length} recent commits\`
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    `;

    console.log("🚀 Executing code to get git commits...");
    const result = await cm.executeCode(code);

    if (result.success) {
      console.log("✅ Code execution successful!");
      console.log("📊 Result:", result.data);
    } else {
      console.log("❌ Code execution failed:", result.error);
    }

    // Cleanup
    cm.cleanup();
    console.log("🧹 Cleanup completed");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

main();
