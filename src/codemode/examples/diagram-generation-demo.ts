#!/usr/bin/env tsx

/**
 * 🎨 Diagram Generation Demo
 *
 * Demonstrates the diagram generation capabilities available to AI agents:
 * - Package dependencies visualization
 * - Architecture overview diagrams
 * - Component relationship mapping
 * - File structure visualization
 */

import { codemode } from "../codemode.js";

async function main() {
  console.log("🎨 Diagram Generation Demo");
  console.log("=========================\n");

  const cm = await codemode({
    projectRoot: "/home/kade/runeset/reynard",
    timeoutMs: 20_000,
  });

  try {
    // Demo 1: Available Diagram Types
    console.log("📋 Demo 1: Available Diagram Types");
    console.log("----------------------------------");
    await cm.executeCode(`
      console.log("📋 Checking available diagram types...");
      
      if (typeof diagramGenerator !== 'undefined') {
        const generator = diagramGenerator.createDiagramGenerator();
        const availableTypes = generator.getAvailableDiagramTypes();
        
        console.log("✅ Available Diagram Types:");
        availableTypes.forEach((type, i) => {
          console.log(\`   \${i + 1}. \${type}\`);
        });
        
        console.log(\`\\n📊 Total diagram types available: \${availableTypes.length}\`);
      } else {
        console.log("❌ Diagram generator not available");
      }
    `);

    // Demo 2: Package Dependencies Diagram
    console.log("\n📦 Demo 2: Package Dependencies Diagram");
    console.log("--------------------------------------");
    await cm.executeCode(`
      console.log("📦 Generating package dependencies diagram...");
      
      if (typeof diagramGenerator !== 'undefined') {
        try {
          const generator = diagramGenerator.createDiagramGenerator('/home/kade/runeset/reynard');
          const diagram = await generator.generateDiagram('package-dependencies', {
            outputDir: '/tmp/diagrams',
            generateSvg: false,
            generatePng: false
          });
          
          console.log("✅ Package Dependencies Diagram Generated:");
          console.log(\`   - Type: \${diagram.metadata.type}\`);
          console.log(\`   - Title: \${diagram.metadata.title}\`);
          console.log(\`   - Nodes: \${diagram.metadata.nodeCount}\`);
          console.log(\`   - Edges: \${diagram.metadata.edgeCount}\`);
          console.log(\`   - Complexity Score: \${diagram.metadata.complexityScore}\`);
          console.log(\`   - Dependencies: \${diagram.metadata.dependencies.length}\`);
          console.log(\`   - Generated: \${diagram.metadata.generatedAt}\`);
          
          console.log("\\n📊 Sample Dependencies:");
          diagram.metadata.dependencies.slice(0, 5).forEach((dep, i) => {
            console.log(\`   \${i + 1}. \${dep}\`);
          });
          
          console.log("\\n🎨 Mermaid Content Preview:");
          console.log(diagram.mermaidContent.substring(0, 150) + "...");
          
        } catch (error) {
          console.log("❌ Error generating package dependencies diagram:", error.message);
        }
      } else {
        console.log("❌ Diagram generator not available");
      }
    `);

    // Demo 3: Architecture Overview Diagram
    console.log("\n🏗️ Demo 3: Architecture Overview Diagram");
    console.log("----------------------------------------");
    await cm.executeCode(`
      console.log("🏗️ Generating architecture overview diagram...");
      
      if (typeof diagramGenerator !== 'undefined') {
        try {
          const generator = diagramGenerator.createDiagramGenerator('/home/kade/runeset/reynard');
          const diagram = await generator.generateDiagram('architecture-overview', {
            outputDir: '/tmp/diagrams',
            generateSvg: false,
            generatePng: false
          });
          
          console.log("✅ Architecture Overview Diagram Generated:");
          console.log(\`   - Type: \${diagram.metadata.type}\`);
          console.log(\`   - Title: \${diagram.metadata.title}\`);
          console.log(\`   - Nodes: \${diagram.metadata.nodeCount}\`);
          console.log(\`   - Edges: \${diagram.metadata.edgeCount}\`);
          console.log(\`   - Generated: \${diagram.metadata.generatedAt}\`);
          
          console.log("\\n🎨 Mermaid Content Preview:");
          console.log(diagram.mermaidContent.substring(0, 150) + "...");
          
        } catch (error) {
          console.log("❌ Error generating architecture overview diagram:", error.message);
        }
      } else {
        console.log("❌ Diagram generator not available");
      }
    `);

    // Demo 4: Component Relationships Diagram
    console.log("\n🔗 Demo 4: Component Relationships Diagram");
    console.log("----------------------------------------");
    await cm.executeCode(`
      console.log("🔗 Generating component relationships diagram...");
      
      if (typeof diagramGenerator !== 'undefined') {
        try {
          const generator = diagramGenerator.createDiagramGenerator('/home/kade/runeset/reynard');
          const diagram = await generator.generateDiagram('component-relationships', {
            outputDir: '/tmp/diagrams',
            generateSvg: false,
            generatePng: false
          });
          
          console.log("✅ Component Relationships Diagram Generated:");
          console.log(\`   - Type: \${diagram.metadata.type}\`);
          console.log(\`   - Title: \${diagram.metadata.title}\`);
          console.log(\`   - Nodes: \${diagram.metadata.nodeCount}\`);
          console.log(\`   - Edges: \${diagram.metadata.edgeCount}\`);
          console.log(\`   - Generated: \${diagram.metadata.generatedAt}\`);
          
          console.log("\\n🎨 Mermaid Content Preview:");
          console.log(diagram.mermaidContent.substring(0, 150) + "...");
          
        } catch (error) {
          console.log("❌ Error generating component relationships diagram:", error.message);
        }
      } else {
        console.log("❌ Diagram generator not available");
      }
    `);

    // Demo 5: Generate All Diagrams
    console.log("\n📊 Demo 5: Generate All Diagrams");
    console.log("-------------------------------");
    await cm.executeCode(`
      console.log("📊 Generating all available diagrams...");
      
      if (typeof diagramGenerator !== 'undefined') {
        try {
          const generator = diagramGenerator.createDiagramGenerator('/home/kade/runeset/reynard');
          const allDiagrams = await generator.generateAll({
            outputDir: '/tmp/diagrams',
            generateSvg: false,
            generatePng: false,
            generateHighRes: false,
            theme: 'neutral',
            maxComplexity: 50,
            includeFilePaths: true,
            includeRelationships: true,
            includeMetadata: true
          });
          
          console.log("✅ All Diagrams Generated:");
          console.log(\`   - Total diagrams: \${Object.keys(allDiagrams.diagrams).length}\`);
          
          Object.entries(allDiagrams.diagrams).forEach(([type, diagram], i) => {
            console.log(\`   \${i + 1}. \${type}: \${diagram.metadata.nodeCount} nodes, \${diagram.metadata.edgeCount} edges\`);
          });
          
          console.log("\\n📈 Summary:");
          const totalNodes = Object.values(allDiagrams.diagrams).reduce((sum, d) => sum + d.metadata.nodeCount, 0);
          const totalEdges = Object.values(allDiagrams.diagrams).reduce((sum, d) => sum + d.metadata.edgeCount, 0);
          console.log(\`   - Total nodes across all diagrams: \${totalNodes}\`);
          console.log(\`   - Total edges across all diagrams: \${totalEdges}\`);
          
        } catch (error) {
          console.log("❌ Error generating all diagrams:", error.message);
        }
      } else {
        console.log("❌ Diagram generator not available");
      }
    `);

    console.log("\n🎉 Diagram Generation Demo Complete!");
    console.log("===================================");
    console.log("✅ Successfully demonstrated diagram generation capabilities:");
    console.log("   1. 📋 Available diagram types discovery");
    console.log("   2. 📦 Package dependencies visualization");
    console.log("   3. 🏗️ Architecture overview diagrams");
    console.log("   4. 🔗 Component relationships mapping");
    console.log("   5. 📊 Bulk diagram generation");
    console.log("🚀 AI agents can now generate comprehensive project visualizations!");
  } catch (error) {
    console.error("❌ Demo failed:", error instanceof Error ? error.message : String(error));
  } finally {
    cm.cleanup();
    setTimeout(() => process.exit(0), 100);
  }
}

// Add timeout to the entire demo
const timeout = setTimeout(() => {
  console.log("⏰ Diagram generation demo timeout reached, exiting...");
  process.exit(1);
}, 25_000); // 25 second total timeout

main()
  .catch(error => {
    console.error("❌ Diagram generation demo error:", error instanceof Error ? error.message : String(error));
    clearTimeout(timeout);
    process.exit(1);
  })
  .finally(() => {
    clearTimeout(timeout);
  });
