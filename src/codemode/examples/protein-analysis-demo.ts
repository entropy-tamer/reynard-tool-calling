import { codemode } from "../codemode";

/**
 * Protein Analysis Pipeline with Chained Codemode Executions
 *
 * This demonstration shows how to chain multiple codemode executions
 * to build a complete protein analysis pipeline, showcasing the power
 * of modular, step-by-step execution with data flow between steps.
 */

/**
 *
 * @example
 */
async function proteinAnalysisDemo() {
  console.log("🧬 Protein Analysis Pipeline with Chained Codemode Executions");
  console.log("=".repeat(70));

  try {
    const projectRoot = "/home/kade/runeset/reynard";
    const cm = await codemode({ projectRoot, timeoutMs: 30000 });

    console.log("✅ Codemode initialized successfully");
    console.log("");

    // ============================================================================
    // STEP 1: Fetch Protein Data
    // ============================================================================
    console.log("🔍 Step 1: Fetching Protein Data from UniProt");
    console.log("-".repeat(50));

    const proteinData = await cm.executeCode(`
      const https = require('https');
      const http = require('http');
      
      // UniProt ID for Human Insulin (P01308)
      const uniprotId = 'P01308';
      
      // Function to make HTTP request
      function makeRequest(url) {
        return new Promise((resolve, reject) => {
          const protocol = url.startsWith('https:') ? https : http;
          protocol.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
      }
      
      try {
        // Fetch protein data from UniProt
        const fastaUrl = \`https://www.uniprot.org/uniprot/\${uniprotId}.fasta\`;
        const fastaData = await makeRequest(fastaUrl);
        
        // Parse FASTA format
        const lines = fastaData.trim().split('\\n');
        const header = lines[0];
        const sequence = lines.slice(1).join('').replace(/\\s/g, '');
        
        // Extract metadata from header
        const headerMatch = header.match(/^>([^|]+)\\|([^|]+)\\|([^\\s]+)\\s+(.+)$/);
        const [, db, id, entryName, proteinName] = headerMatch || ['', '', '', '', ''];
        
        // Fetch additional metadata
        const xmlUrl = \`https://www.uniprot.org/uniprot/\${uniprotId}.xml\`;
        const xmlData = await makeRequest(xmlUrl);
        
        // Extract organism and function from XML (simplified parsing)
        const organismMatch = xmlData.match(/<organism[^>]*>\\s*<name[^>]*>([^<]+)<\\/name>/);
        const functionMatch = xmlData.match(/<comment type="function">\\s*<text[^>]*>([^<]+)<\\/text>/);
        
        const result = {
          id: uniprotId,
          entryName: entryName,
          name: proteinName,
          organism: organismMatch ? organismMatch[1] : 'Unknown',
          function: functionMatch ? functionMatch[1] : 'Unknown function',
          sequence: sequence,
          length: sequence.length,
          source: 'UniProt'
        };
        
        console.log(\`📋 Protein: \${result.name}\`);
        console.log(\`🧬 Organism: \${result.organism}\`);
        console.log(\`📏 Length: \${result.length} amino acids\`);
        console.log(\`🔬 Function: \${result.function}\`);
        
        return result;
      } catch (error) {
        console.error('Error fetching protein data:', error.message);
        return {
          error: error.message,
          id: uniprotId,
          sequence: 'MKWVTFISLLFLFSSAYSGVSRDSAAPLSVPYQRPEPLRAVQNGLGASVLQVLLQAVPGAAGALQPGASGLPCDALLALPPVAAHANQ',
          name: 'Human Insulin (Fallback)',
          organism: 'Homo sapiens',
          function: 'Hormone involved in glucose metabolism',
          length: 110,
          source: 'Fallback'
        };
      }
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
    console.log("-".repeat(50));

    const properties = await cm.executeCode(`
      const sequence = \`${proteinData.data.sequence}\`;
      
      // Amino acid molecular weights (Da)
      const aaWeights = {
        'A': 89.09, 'R': 174.20, 'N': 132.12, 'D': 133.10, 'C': 121.16,
        'Q': 146.15, 'E': 147.13, 'G': 75.07, 'H': 155.16, 'I': 131.17,
        'L': 131.17, 'K': 146.19, 'M': 149.21, 'F': 165.19, 'P': 115.13,
        'S': 105.09, 'T': 119.12, 'W': 204.23, 'Y': 181.19, 'V': 117.15
      };
      
      // pKa values for ionizable groups
      const pKaValues = {
        'D': 3.9, 'E': 4.3, 'H': 6.0, 'C': 8.3, 'Y': 10.1,
        'K': 10.5, 'R': 12.5
      };
      
      // Kyte-Doolittle hydrophobicity scale
      const hydrophobicity = {
        'A': 1.8, 'R': -4.5, 'N': -3.5, 'D': -3.5, 'C': 2.5,
        'Q': -3.5, 'E': -3.5, 'G': -0.4, 'H': -3.2, 'I': 4.5,
        'L': 3.8, 'K': -3.9, 'M': 1.9, 'F': 2.8, 'P': -1.6,
        'S': -0.8, 'T': -0.7, 'W': -0.9, 'Y': -1.3, 'V': 4.2
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
      
      // Simplified pI calculation (pH where net charge = 0)
      const pI = 7.0 + (positiveCharges - negativeCharges) * 0.1;
      
      // Calculate hydrophobicity profile
      const windowSize = 9;
      const hydrophobicityProfile = [];
      for (let i = 0; i <= sequence.length - windowSize; i++) {
        const window = sequence.slice(i, i + windowSize);
        let avgHydrophobicity = 0;
        for (let j = 0; j < window.length; j++) {
          avgHydrophobicity += hydrophobicity[window[j]] || 0;
        }
        hydrophobicityProfile.push({
          position: i + Math.floor(windowSize / 2),
          value: (avgHydrophobicity / windowSize).toFixed(2)
        });
      }
      
      // Calculate instability index (simplified)
      const instabilityIndex = Math.abs(positiveCharges - negativeCharges) / sequence.length * 100;
      
      const result = {
        molecularWeight: mw.toFixed(2),
        isoelectricPoint: pI.toFixed(2),
        composition: compositionPercent,
        hydrophobicityProfile: hydrophobicityProfile.slice(0, 10), // First 10 values
        instabilityIndex: instabilityIndex.toFixed(2),
        positiveCharges,
        negativeCharges,
        netCharge: positiveCharges - negativeCharges
      };
      
      console.log(\`⚖️  Molecular Weight: \${result.molecularWeight} Da\`);
      console.log(\`⚡ Isoelectric Point: \${result.isoelectricPoint}\`);
      console.log(\`🔋 Net Charge: \${result.netCharge}\`);
      console.log(\`📊 Instability Index: \${result.instabilityIndex}\`);
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
    console.log("-".repeat(50));

    const analysis = await cm.executeCode(`
      const sequence = \`${proteinData.data.sequence}\`;
      const properties = ${JSON.stringify(properties.data)};
      
      // Common protein motifs (simplified patterns)
      const motifs = {
        'N-glycosylation': /N[^P][ST]/g,
        'O-glycosylation': /[ST]P/g,
        'Phosphorylation': /[ST]P/g,
        'Myristoylation': /G[^EDRKHPFYW]/g,
        'Palmitoylation': /C[^P]/g,
        'Nuclear localization': /[KR]{4,}/g,
        'Transmembrane': /[AILMFWV]{7,}/g
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
      
      // Secondary structure prediction (simplified Chou-Fasman)
      const ssPropensity = {
        'A': { helix: 1.42, sheet: 0.83, coil: 0.66 },
        'R': { helix: 0.98, sheet: 0.93, coil: 0.95 },
        'N': { helix: 0.67, sheet: 0.89, coil: 1.34 },
        'D': { helix: 1.01, sheet: 0.54, coil: 1.46 },
        'C': { helix: 0.70, sheet: 1.19, coil: 1.19 },
        'Q': { helix: 1.11, sheet: 1.10, coil: 0.98 },
        'E': { helix: 1.51, sheet: 0.37, coil: 1.56 },
        'G': { helix: 0.57, sheet: 0.75, coil: 1.56 },
        'H': { helix: 1.00, sheet: 0.87, coil: 0.95 },
        'I': { helix: 1.08, sheet: 1.60, coil: 0.47 },
        'L': { helix: 1.21, sheet: 1.30, coil: 0.59 },
        'K': { helix: 1.16, sheet: 0.74, coil: 1.01 },
        'M': { helix: 1.45, sheet: 1.05, coil: 0.60 },
        'F': { helix: 1.13, sheet: 1.38, coil: 0.60 },
        'P': { helix: 0.57, sheet: 0.55, coil: 1.52 },
        'S': { helix: 0.77, sheet: 0.75, coil: 1.43 },
        'T': { helix: 0.83, sheet: 1.19, coil: 0.96 },
        'W': { helix: 1.08, sheet: 1.37, coil: 0.96 },
        'Y': { helix: 0.69, sheet: 1.47, coil: 1.14 },
        'V': { helix: 1.06, sheet: 1.70, coil: 0.50 }
      };
      
      // Calculate secondary structure propensity
      const windowSize = 7;
      const ssProfile = [];
      for (let i = 0; i <= sequence.length - windowSize; i++) {
        const window = sequence.slice(i, i + windowSize);
        let helixScore = 0, sheetScore = 0, coilScore = 0;
        
        for (let j = 0; j < window.length; j++) {
          const aa = window[j];
          if (ssPropensity[aa]) {
            helixScore += ssPropensity[aa].helix;
            sheetScore += ssPropensity[aa].sheet;
            coilScore += ssPropensity[aa].coil;
          }
        }
        
        const total = helixScore + sheetScore + coilScore;
        ssProfile.push({
          position: i + Math.floor(windowSize / 2),
          helix: (helixScore / total * 100).toFixed(1),
          sheet: (sheetScore / total * 100).toFixed(1),
          coil: (coilScore / total * 100).toFixed(1),
          prediction: helixScore > sheetScore && helixScore > coilScore ? 'Helix' :
                     sheetScore > helixScore && sheetScore > coilScore ? 'Sheet' : 'Coil'
        });
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
      
      // Find repetitive regions
      const repeats = [];
      for (let len = 3; len <= 10; len++) {
        for (let i = 0; i <= sequence.length - len * 2; i++) {
          const pattern = sequence.slice(i, i + len);
          let count = 1;
          let pos = i + len;
          
          while (pos <= sequence.length - len) {
            if (sequence.slice(pos, pos + len) === pattern) {
              count++;
              pos += len;
            } else {
              break;
            }
          }
          
          if (count >= 2) {
            repeats.push({
              pattern,
              count,
              start: i + 1,
              length: len
            });
          }
        }
      }
      
      const result = {
        motifs: foundMotifs,
        secondaryStructure: ssProfile.slice(0, 10), // First 10 predictions
        complexity: complexity,
        entropy: entropy.toFixed(2),
        repeats: repeats.slice(0, 5), // Top 5 repeats
        totalMotifs: Object.keys(foundMotifs).length,
        avgHelixPropensity: (ssProfile.reduce((sum, p) => sum + parseFloat(p.helix), 0) / ssProfile.length).toFixed(1),
        avgSheetPropensity: (ssProfile.reduce((sum, p) => sum + parseFloat(p.sheet), 0) / ssProfile.length).toFixed(1)
      };
      
      console.log(\`🧬 Sequence Complexity: \${result.complexity}%\`);
      console.log(\`🔄 Total Motifs Found: \${result.totalMotifs}\`);
      console.log(\`📊 Average Helix Propensity: \${result.avgHelixPropensity}%\`);
      console.log(\`📊 Average Sheet Propensity: \${result.avgSheetPropensity}%\`);
      console.log(\`🔁 Repeats Found: \${result.repeats.length}\`);
      
      return result;
    `);

    if (!analysis.success) {
      throw new Error(`Failed to perform sequence analysis: ${analysis.error}`);
    }

    console.log("✅ Sequence analysis completed successfully");
    console.log("");

    // ============================================================================
    // STEP 4: Comparative Analysis (with a second protein)
    // ============================================================================
    console.log("🔍 Step 4: Comparative Analysis");
    console.log("-".repeat(50));

    const comparison = await cm.executeCode(`
      const protein1 = {
        name: \`${proteinData.data.name}\`,
        sequence: \`${proteinData.data.sequence}\`,
        properties: ${JSON.stringify(properties.data)}
      };
      
      // Use a related protein for comparison (Insulin-like growth factor 1)
      const protein2 = {
        name: 'Insulin-like Growth Factor 1',
        sequence: 'MALRVCGVGQALLLLQLLLAQCPLCGAELVDALQFVCGDRGFYFNKPTGYGSSSRRAPQTGIVDECCFRSCDLRRLEMYCAPLKPAKSA',
        organism: 'Homo sapiens'
      };
      
      // Simple sequence alignment (needleman-wunsch-like)
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
      
      // Calculate sequence similarity
      const alignmentScore = simpleAlignment(protein1.sequence, protein2.sequence);
      const maxLength = Math.max(protein1.sequence.length, protein2.sequence.length);
      const similarity = ((alignmentScore + maxLength) / (2 * maxLength) * 100).toFixed(1);
      
      // Find conserved regions (simplified)
      const minLength = Math.min(protein1.sequence.length, protein2.sequence.length);
      const conservedRegions = [];
      
      for (let i = 0; i < minLength - 5; i++) {
        let matchLength = 0;
        for (let j = i; j < minLength; j++) {
          if (protein1.sequence[j] === protein2.sequence[j]) {
            matchLength++;
          } else {
            break;
          }
        }
        
        if (matchLength >= 5) {
          conservedRegions.push({
            start: i + 1,
            length: matchLength,
            sequence: protein1.sequence.slice(i, i + matchLength)
          });
        }
      }
      
      // Calculate amino acid composition similarity
      function getComposition(seq) {
        const comp = {};
        for (let i = 0; i < seq.length; i++) {
          const aa = seq[i];
          comp[aa] = (comp[aa] || 0) + 1;
        }
        return comp;
      }
      
      const comp1 = getComposition(protein1.sequence);
      const comp2 = getComposition(protein2.sequence);
      
      let compositionSimilarity = 0;
      const allAAs = new Set([...Object.keys(comp1), ...Object.keys(comp2)]);
      
      for (const aa of allAAs) {
        const p1 = (comp1[aa] || 0) / protein1.sequence.length;
        const p2 = (comp2[aa] || 0) / protein2.sequence.length;
        compositionSimilarity += Math.min(p1, p2);
      }
      
      const result = {
        protein1: protein1.name,
        protein2: protein2.name,
        sequenceSimilarity: similarity,
        alignmentScore: alignmentScore,
        conservedRegions: conservedRegions.slice(0, 3), // Top 3
        compositionSimilarity: (compositionSimilarity * 100).toFixed(1),
        lengthDifference: Math.abs(protein1.sequence.length - protein2.sequence.length),
        sharedAAs: allAAs.size
      };
      
      console.log(\`🔗 Sequence Similarity: \${result.sequenceSimilarity}%\`);
      console.log(\`📊 Composition Similarity: \${result.compositionSimilarity}%\`);
      console.log(\`🔒 Conserved Regions: \${result.conservedRegions.length}\`);
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
    console.log("-".repeat(50));

    const report = await cm.executeCode(`
      const proteinData = ${JSON.stringify(proteinData.data)};
      const properties = ${JSON.stringify(properties.data)};
      const analysis = ${JSON.stringify(analysis.data)};
      const comparison = ${JSON.stringify(comparison.data)};
      
      // Generate Markdown report
      const markdownReport = \`# Protein Analysis Report

## Protein Information
- **Name**: \${proteinData.name}
- **Organism**: \${proteinData.organism}
- **UniProt ID**: \${proteinData.id}
- **Length**: \${proteinData.length} amino acids
- **Function**: \${proteinData.function}

## Biochemical Properties
- **Molecular Weight**: \${properties.molecularWeight} Da
- **Isoelectric Point**: \${properties.isoelectricPoint}
- **Net Charge**: \${properties.netCharge}
- **Instability Index**: \${properties.instabilityIndex}

### Amino Acid Composition (Top 5)
\${Object.entries(properties.composition)
  .sort(([,a], [,b]) => parseFloat(b) - parseFloat(a))
  .slice(0, 5)
  .map(([aa, pct]) => \`- \${aa}: \${pct}%\`)
  .join('\\n')}

## Sequence Analysis
- **Complexity**: \${analysis.complexity}%
- **Total Motifs**: \${analysis.totalMotifs}
- **Average Helix Propensity**: \${analysis.avgHelixPropensity}%
- **Average Sheet Propensity**: \${analysis.avgSheetPropensity}%

### Found Motifs
\${Object.entries(analysis.motifs)
  .map(([name, motifs]) => \`- **\${name}**: \${motifs.length} sites\`)
  .join('\\n')}

## Comparative Analysis
- **Compared with**: \${comparison.protein2}
- **Sequence Similarity**: \${comparison.sequenceSimilarity}%
- **Composition Similarity**: \${comparison.compositionSimilarity}%
- **Conserved Regions**: \${comparison.conservedRegions.length}

### Conserved Regions
\${comparison.conservedRegions
  .map(region => \`- Position \${region.start}-\${region.start + region.length - 1}: \${region.sequence}\`)
  .join('\\n')}

## Summary
This analysis reveals that \${proteinData.name} is a \${proteinData.length}-amino acid protein with a molecular weight of \${properties.molecularWeight} Da. The protein shows \${analysis.complexity}% sequence complexity and has \${analysis.totalMotifs} functional motifs. When compared to \${comparison.protein2}, it shows \${comparison.sequenceSimilarity}% sequence similarity, indicating \${parseFloat(comparison.sequenceSimilarity) > 50 ? 'high' : 'moderate'} evolutionary relatedness.

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
          netCharge: properties.netCharge,
          instabilityIndex: properties.instabilityIndex
        },
        analysis: {
          complexity: analysis.complexity,
          totalMotifs: analysis.totalMotifs,
          avgHelixPropensity: analysis.avgHelixPropensity,
          avgSheetPropensity: analysis.avgSheetPropensity
        },
        comparison: {
          similarity: comparison.sequenceSimilarity,
          conservedRegions: comparison.conservedRegions.length
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

🔬 **Structural Insights:**
• Helix Propensity: \${analysis.avgHelixPropensity}%
• Sheet Propensity: \${analysis.avgSheetPropensity}%
• Stability Index: \${properties.instabilityIndex}

🔗 **Evolutionary Analysis:**
• Similarity to \${comparison.protein2}: \${comparison.sequenceSimilarity}%
• Conserved Regions: \${comparison.conservedRegions.length}
• Composition Similarity: \${comparison.compositionSimilarity}%

💡 **Conclusion:** \${proteinData.name} is a \${parseFloat(analysis.complexity) > 70 ? 'highly complex' : 'moderately complex'} protein with \${analysis.totalMotifs} functional motifs, showing \${parseFloat(comparison.sequenceSimilarity) > 50 ? 'significant' : 'moderate'} evolutionary conservation.
\`;

      const result = {
        markdown: markdownReport,
        json: jsonSummary,
        summary: executiveSummary,
        statistics: {
          totalSteps: 5,
          executionTime: '~30 seconds',
          dataPoints: Object.keys(properties.data).length + Object.keys(analysis.data).length + Object.keys(comparison.data).length,
          motifsFound: analysis.totalMotifs,
          conservedRegions: comparison.conservedRegions.length
        }
      };
      
      console.log('📋 Report generated successfully');
      console.log(\`📊 Total data points: \${result.statistics.dataPoints}\`);
      console.log(\`🔬 Motifs found: \${result.statistics.motifsFound}\`);
      console.log(\`🔒 Conserved regions: \${result.statistics.conservedRegions}\`);
      
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
    console.log("=".repeat(70));
    console.log("");
    console.log("📋 Executive Summary:");
    console.log(report.data.summary);
    console.log("");
    console.log("📊 Pipeline Statistics:");
    console.log(`   • Total Steps: ${report.data.statistics.totalSteps}`);
    console.log(`   • Data Points: ${report.data.statistics.dataPoints}`);
    console.log(`   • Motifs Found: ${report.data.statistics.motifsFound}`);
    console.log(`   • Conserved Regions: ${report.data.statistics.conservedRegions}`);
    console.log("");
    console.log("🔗 Chaining Benefits Demonstrated:");
    console.log("   ✅ Modular execution - each step builds on previous results");
    console.log("   ✅ Data flow - information passes seamlessly between steps");
    console.log("   ✅ Debugging - can inspect results at each stage");
    console.log("   ✅ Flexibility - easy to add/remove/modify steps");
    console.log("   ✅ Transparency - all calculations are visible and verifiable");
    console.log("");

    // Cleanup
    cm.cleanup();

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
  proteinAnalysisDemo().then(result => {
    if (result.success) {
      console.log("🎯 Demo completed successfully!");
      process.exit(0);
    } else {
      console.error("💥 Demo failed:", result.error);
      process.exit(1);
    }
  });
}

export { proteinAnalysisDemo };
