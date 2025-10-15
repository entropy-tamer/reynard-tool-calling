import { createRequire } from "module";

/**
 * Simplified Protein Analysis Pipeline - Direct Execution
 *
 * This demonstration shows how to chain multiple codemode-style executions
 * to build a complete protein analysis pipeline without requiring the MCP server.
 * It showcases the power of modular, step-by-step execution with data flow between steps.
 */

// Simulate the codemode executeCode function directly
const executeCode = async (code: string) => {
  const startTime = Date.now();

  try {
    // Inject common Node.js modules directly into the execution context
    const require = createRequire(import.meta.url);
    const modules: Record<string, any> = {
      child_process: require("child_process"),
      fs: require("fs"),
      path: require("path"),
      os: require("os"),
      util: require("util"),
      crypto: require("crypto"),
      url: require("url"),
      querystring: require("querystring"),
      http: require("http"),
      https: require("https"),
      stream: require("stream"),
      events: require("events"),
      buffer: require("buffer"),
      process: require("process"),
    };

    // Create a function that has access to the context (like codemode does)
    const func = new Function(
      "console",
      "modules",
      `
        // Make modules available as require would
        const require = (id) => {
          if (modules[id]) return modules[id];
          throw new Error(\`Module '\${id}' not available in codemode execution context\`);
        };

        return (async () => {
          ${code}
        })()`
    );

    const result = await func(console, modules);
    const executionTime = Date.now() - startTime;

    return {
      success: true,
      data: result,
      logs: [],
      metrics: {
        duration: executionTime,
        memoryUsedMB: 0,
        cpuPercent: 0,
      },
      error: null,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    return {
      success: false,
      data: null,
      logs: [],
      metrics: {
        duration: executionTime,
        memoryUsedMB: 0,
        cpuPercent: 0,
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 *
 * @example
 */
async function proteinAnalysisSimple() {
  console.log("🧬 Protein Analysis Pipeline - Direct Execution Demo");
  console.log("=".repeat(60));

  try {
    console.log("✅ Direct execution environment initialized");
    console.log("");

    // ============================================================================
    // STEP 1: Fetch Protein Data
    // ============================================================================
    console.log("🔍 Step 1: Fetching Protein Data");
    console.log("-".repeat(40));

    const proteinData = await executeCode(`
      // Use a well-known protein sequence for demonstration
      const result = {
        id: 'P01308',
        name: 'Human Insulin',
        organism: 'Homo sapiens',
        function: 'Hormone involved in glucose metabolism',
        sequence: 'MKWVTFISLLFLFSSAYSGVSRDSAAPLSVPYQRPEPLRAVQNGLGASVLQVLLQAVPGAAGALQPGASGLPCDALLALPPVAAHANQ',
        length: 88,
        source: 'Demo'
      };
      
      console.log(\`📋 Protein: \${result.name}\`);
      console.log(\`🧬 Organism: \${result.organism}\`);
      console.log(\`📏 Length: \${result.length} amino acids\`);
      console.log(\`🔬 Function: \${result.function}\`);
      
      return result;
    `);

    if (!proteinData.success) {
      throw new Error(`Failed to fetch protein data: ${proteinData.error}`);
    }

    console.log("✅ Protein data fetched successfully");
    console.log("");

    // ============================================================================
    // STEP 2: Calculate Basic Properties
    // ============================================================================
    console.log("🧮 Step 2: Calculating Biochemical Properties");
    console.log("-".repeat(40));

    const properties = await executeCode(`
      const sequence = \`${proteinData.data.sequence}\`;
      
      // Amino acid molecular weights (Da)
      const aaWeights = {
        'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.16,
        'Q': 146.15, 'E': 147.13, 'G': 75.07, 'H': 155.16, 'I': 131.17,
        'L': 131.17, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
        'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
      };
      
      // Calculate molecular weight
      let mw = 18.015; // Water molecule weight
      for (let i = 0; i < sequence.length; i++) {
        const aa = sequence[i];
        if (aaWeights[aa]) {
          mw += aaWeights[aa];
        }
      }
      
      // Calculate amino acid composition
      const composition = {};
      for (let i = 0; i < sequence.length; i++) {
        const aa = sequence[i];
        composition[aa] = (composition[aa] || 0) + 1;
      }
      
      // Calculate percentages
      const compositionPercent = {};
      for (const aa in composition) {
        compositionPercent[aa] = (composition[aa] / sequence.length * 100).toFixed(2);
      }
      
      // Calculate isoelectric point (simplified)
      let positiveCharges = 0;
      let negativeCharges = 0;
      
      for (let i = 0; i < sequence.length; i++) {
        const aa = sequence[i];
        if (['K', 'R'].includes(aa)) positiveCharges++;
        if (['D', 'E'].includes(aa)) negativeCharges++;
      }
      
      const pI = 7.0 + (positiveCharges - negativeCharges) * 0.1;
      
      const result = {
        molecularWeight: mw.toFixed(2),
        isoelectricPoint: pI.toFixed(2),
        composition: compositionPercent,
        positiveCharges,
        negativeCharges,
        netCharge: positiveCharges - negativeCharges
      };
      
      console.log(\`⚖️  Molecular Weight: \${result.molecularWeight} Da\`);
      console.log(\`⚡ Isoelectric Point: \${result.isoelectricPoint}\`);
      console.log(\`🔋 Net Charge: \${result.netCharge}\`);
      console.log(\`🧪 Top 5 Amino Acids: \${Object.entries(result.composition)
        .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))
        .slice(0, 5)
        .map(([aa, pct]) => \`\${aa}(\${pct}%)\`)
        .join(', ')}\`);
      
      return result;
    `);

    if (!properties.success) {
      throw new Error(`Failed to calculate properties: ${properties.error}`);
    }

    console.log("✅ Biochemical properties calculated successfully");
    console.log("");

    // ============================================================================
    // STEP 3: Sequence Analysis
    // ============================================================================
    console.log("🔬 Step 3: Performing Sequence Analysis");
    console.log("-".repeat(40));

    const analysis = await executeCode(`
      const sequence = \`${proteinData.data.sequence}\`;
      
      // Common protein motifs (simplified patterns)
      const motifs = {
        'N-glycosylation': /N[^P][ST]/g,
        'O-glycosylation': /[ST]P/g,
        'Phosphorylation': /[ST]P/g,
        'Nuclear localization': /[KR]{4,}/g
      };
      
      // Find motifs in sequence
      const foundMotifs = {};
      for (const [name, pattern] of Object.entries(motifs)) {
        const matches = sequence.match(pattern);
        if (matches) {
          foundMotifs[name] = matches.map(match => {
            const index = sequence.indexOf(match);
            return { sequence: match, position: index + 1 };
          });
        }
      }
      
      // Calculate sequence complexity (Shannon entropy)
      const aaCounts = {};
      for (let i = 0; i < sequence.length; i++) {
        const aa = sequence[i];
        aaCounts[aa] = (aaCounts[aa] || 0) + 1;
      }
      
      let entropy = 0;
      for (const count of Object.values(aaCounts)) {
        const p = count / sequence.length;
        entropy -= p * Math.log2(p);
      }
      
      const maxEntropy = Math.log2(20); // 20 amino acids
      const complexity = (entropy / maxEntropy * 100).toFixed(1);
      
      const result = {
        motifs: foundMotifs,
        complexity: complexity,
        entropy: entropy.toFixed(2),
        totalMotifs: Object.keys(foundMotifs).length
      };
      
      console.log(\`🧬 Sequence Complexity: \${result.complexity}%\`);
      console.log(\`🔄 Total Motifs Found: \${result.totalMotifs}\`);
      
      return result;
    `);

    if (!analysis.success) {
      throw new Error(`Failed to perform sequence analysis: ${analysis.error}`);
    }

    console.log("✅ Sequence analysis completed successfully");
    console.log("");

    // ============================================================================
    // STEP 4: Comparative Analysis
    // ============================================================================
    console.log("🔍 Step 4: Comparative Analysis");
    console.log("-".repeat(40));

    const comparison = await executeCode(`
      const protein1 = {
        name: \`${proteinData.data.name}\`,
        sequence: \`${proteinData.data.sequence}\`
      };
      
      // Use a related protein for comparison
      const protein2 = {
        name: 'Insulin-like Growth Factor 1',
        sequence: 'MALRVCGVGQALLLLQLLLAQCPLCGAELVDALQFVCGDRGFYFNKPTGYGSSSRRAPQTGIVDECCFRSCDLRRLEMYCAPLKPAKSA'
      };
      
      // Simple sequence alignment
      function simpleAlignment(seq1, seq2) {
        const len1 = seq1.length;
        const len2 = seq2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));
        
        // Initialize
        for (let i = 0; i <= len1; i++) matrix[i][0] = -i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = -j;
        
        // Fill matrix
        for (let i = 1; i <= len1; i++) {
          for (let j = 1; j <= len2; j++) {
            const match = seq1[i-1] === seq2[j-1] ? 1 : -1;
            matrix[i][j] = Math.max(
              matrix[i-1][j-1] + match,
              matrix[i-1][j] - 1,
              matrix[i][j-1] - 1
            );
          }
        }
        
        return matrix[len1][len2];
      }
      
      const alignmentScore = simpleAlignment(protein1.sequence, protein2.sequence);
      const maxLength = Math.max(protein1.sequence.length, protein2.sequence.length);
      const similarity = ((alignmentScore + maxLength) / (2 * maxLength) * 100).toFixed(1);
      
      const result = {
        protein1: protein1.name,
        protein2: protein2.name,
        sequenceSimilarity: similarity,
        alignmentScore: alignmentScore,
        lengthDifference: Math.abs(protein1.sequence.length - protein2.sequence.length)
      };
      
      console.log(\`🔗 Sequence Similarity: \${result.sequenceSimilarity}%\`);
      console.log(\`📏 Length Difference: \${result.lengthDifference} amino acids\`);
      
      return result;
    `);

    if (!comparison.success) {
      throw new Error(`Failed to perform comparative analysis: ${comparison.error}`);
    }

    console.log("✅ Comparative analysis completed successfully");
    console.log("");

    // ============================================================================
    // STEP 5: Generate Comprehensive Report
    // ============================================================================
    console.log("📊 Step 5: Generating Comprehensive Report");
    console.log("-".repeat(40));

    const report = await executeCode(`
      const proteinData = ${JSON.stringify(proteinData.data)};
      const properties = ${JSON.stringify(properties.data)};
      const analysis = ${JSON.stringify(analysis.data)};
      const comparison = ${JSON.stringify(comparison.data)};
      
      // Generate Markdown report
      const markdownReport = \`# Protein Analysis Report

## Protein Information
- **Name**: \${proteinData.name}
- **Organism**: \${proteinData.organism}
- **Length**: \${proteinData.length} amino acids
- **Function**: \${proteinData.function}

## Biochemical Properties
- **Molecular Weight**: \${properties.molecularWeight} Da
- **Isoelectric Point**: \${properties.isoelectricPoint}
- **Net Charge**: \${properties.netCharge}

### Amino Acid Composition (Top 5)
\${Object.entries(properties.composition)
  .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))
  .slice(0, 5)
  .map(([aa, pct]) => \`- \${aa}: \${pct}%\`)
  .join('\\n')}

## Sequence Analysis
- **Complexity**: \${analysis.complexity}%
- **Total Motifs**: \${analysis.totalMotifs}

### Found Motifs
\${Object.entries(analysis.motifs)
  .map(([name, motifs]) => \`- **\${name}**: \${motifs.length} sites\`)
  .join('\\n')}

## Comparative Analysis
- **Compared with**: \${comparison.protein2}
- **Sequence Similarity**: \${comparison.sequenceSimilarity}%

## Summary
This analysis reveals that \${proteinData.name} is a \${proteinData.length}-amino acid protein with a molecular weight of \${properties.molecularWeight} Da. The protein shows \${analysis.complexity}% sequence complexity and has \${analysis.totalMotifs} functional motifs.

---
*Report generated by Codemode Protein Analysis Pipeline*
\`;

      // Generate JSON summary
      const jsonSummary = {
        metadata: {
          generated: new Date().toISOString(),
          pipeline: 'Codemode Protein Analysis',
          version: '1.0.0'
        },
        protein: {
          id: proteinData.id,
          name: proteinData.name,
          organism: proteinData.organism,
          length: proteinData.length
        },
        properties: {
          molecularWeight: properties.molecularWeight,
          isoelectricPoint: properties.isoelectricPoint,
          netCharge: properties.netCharge
        },
        analysis: {
          complexity: analysis.complexity,
          totalMotifs: analysis.totalMotifs
        },
        comparison: {
          similarity: comparison.sequenceSimilarity
        }
      };
      
      // Generate executive summary
      const executiveSummary = \`
🧬 **\${proteinData.name}** Analysis Summary

📊 **Key Metrics:**
• Length: \${proteinData.length} amino acids
• Molecular Weight: \${properties.molecularWeight} Da
• Complexity: \${analysis.complexity}%
• Functional Motifs: \${analysis.totalMotifs}

🔗 **Evolutionary Analysis:**
• Similarity to \${comparison.protein2}: \${comparison.sequenceSimilarity}%

💡 **Conclusion:** \${proteinData.name} is a \${parseFloat(analysis.complexity) > 70 ? 'highly complex' : 'moderately complex'} protein with \${analysis.totalMotifs} functional motifs.
\`;

      const result = {
        markdown: markdownReport,
        json: jsonSummary,
        summary: executiveSummary,
        statistics: {
          totalSteps: 5,
          executionTime: '~5 seconds',
          dataPoints: Object.keys(properties).length + Object.keys(analysis).length + Object.keys(comparison).length,
          motifsFound: analysis.totalMotifs
        }
      };
      
      console.log('📋 Report generated successfully');
      console.log(\`📊 Total data points: \${result.statistics.dataPoints}\`);
      console.log(\`🔬 Motifs found: \${result.statistics.motifsFound}\`);
      
      return result;
    `);

    if (!report.success) {
      throw new Error(`Failed to generate report: ${report.error}`);
    }

    console.log("✅ Comprehensive report generated successfully");
    console.log("");

    // ============================================================================
    // DISPLAY RESULTS
    // ============================================================================
    console.log("🎉 Protein Analysis Pipeline Complete!");
    console.log("=".repeat(60));
    console.log("");
    console.log("📋 Executive Summary:");
    console.log(report.data.summary);
    console.log("");
    console.log("📊 Pipeline Statistics:");
    console.log(`   • Total Steps: ${report.data.statistics.totalSteps}`);
    console.log(`   • Data Points: ${report.data.statistics.dataPoints}`);
    console.log(`   • Motifs Found: ${report.data.statistics.motifsFound}`);
    console.log("");
    console.log("🔗 Chaining Benefits Demonstrated:");
    console.log("   ✅ Modular execution - each step builds on previous results");
    console.log("   ✅ Data flow - information passes seamlessly between steps");
    console.log("   ✅ Debugging - can inspect results at each stage");
    console.log("   ✅ Flexibility - easy to add/remove/modify steps");
    console.log("   ✅ Transparency - all calculations are visible and verifiable");
    console.log("");

    return {
      success: true,
      proteinData: proteinData.data,
      properties: properties.data,
      analysis: analysis.data,
      comparison: comparison.data,
      report: report.data,
    };
  } catch (error: any) {
    console.error("❌ Protein analysis pipeline failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  proteinAnalysisSimple().then(result => {
    if (result.success) {
      console.log("🎯 Demo completed successfully!");
      process.exit(0);
    } else {
      console.error("💥 Demo failed:", result.error);
      process.exit(1);
    }
  });
}

export { proteinAnalysisSimple };
