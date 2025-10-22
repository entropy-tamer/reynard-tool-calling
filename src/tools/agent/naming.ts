/**
 * @file Agent Naming Tools
 * 
 * Native TypeScript implementation of agent naming tools.
 * These tools integrate with the backend ECS system for agent naming.
 */

import { ToolResult } from '../types';

/**
 * Agent naming and identity tools
 */
export class NamingTools {
  static async generateAgentName(args: {
    specialist: string;
    style: string;
  }): Promise<ToolResult> {
    try {
      const { specialist, style } = args;

      // Generate name using local algorithm (no backend dependency for basic functionality)
      const name = this.generateNameLocally(specialist, style);
      
      return {
        success: true,
        data: { name, specialist, style },
        logs: [`Generated agent name: ${name}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate agent name'
      };
    }
  }

  static async assignAgentName(args: {
    agentId: string;
    name: string;
  }): Promise<ToolResult> {
    try {
      const { agentId, name } = args;

      // Store in local agent names file
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const agentNamesFile = path.join(process.cwd(), 'agent-names.json');
      
      let agentNames: Record<string, any> = {};
      try {
        const data = await fs.readFile(agentNamesFile, 'utf8');
        agentNames = JSON.parse(data);
      } catch {
        // File doesn't exist, start with empty object
      }

      agentNames[agentId] = {
        name,
        assignedAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      await fs.writeFile(agentNamesFile, JSON.stringify(agentNames, null, 2));

      return {
        success: true,
        data: { agentId, name, assigned: true },
        logs: [`Assigned name '${name}' to agent ${agentId}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign agent name'
      };
    }
  }

  static async getAgentName(args: {
    agentId: string;
  }): Promise<ToolResult> {
    try {
      const { agentId } = args;

      const fs = await import('fs/promises');
      const path = await import('path');
      
      const agentNamesFile = path.join(process.cwd(), 'agent-names.json');
      
      try {
        const data = await fs.readFile(agentNamesFile, 'utf8');
        const agentNames = JSON.parse(data);
        
        const agentData = agentNames[agentId];
        if (!agentData) {
          return {
            success: false,
            error: `No name found for agent ${agentId}`
          };
        }

        return {
          success: true,
          data: agentData,
          logs: [`Agent ${agentId} name: ${agentData.name}`]
        };
      } catch {
        return {
          success: false,
          error: `Agent names file not found or invalid`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get agent name'
      };
    }
  }

  static async listAgentNames(): Promise<ToolResult> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const agentNamesFile = path.join(process.cwd(), 'agent-names.json');
      
      try {
        const data = await fs.readFile(agentNamesFile, 'utf8');
        const agentNames = JSON.parse(data);
        
        return {
          success: true,
          data: agentNames,
          logs: [`Found ${Object.keys(agentNames).length} assigned agent names`]
        };
      } catch {
        return {
          success: true,
          data: {},
          logs: ['No agent names file found']
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list agent names'
      };
    }
  }

  private static generateNameLocally(specialist: string, style: string): string {
    // Local name generation algorithm
    const specialists = {
      'fox': ['Strategic', 'Cunning', 'Clever', 'Wise', 'Swift'],
      'wolf': ['Pack', 'Guardian', 'Alpha', 'Loyal', 'Fierce'],
      'otter': ['Playful', 'Joyful', 'Curious', 'Energetic', 'Cheerful'],
      'eagle': ['Soaring', 'Visionary', 'Noble', 'Majestic', 'Proud'],
      'lion': ['Bold', 'Regal', 'Courageous', 'Powerful', 'Royal']
    };

    const styles = {
      'foundation': ['Prime', 'Core', 'Base', 'Foundation', 'Essential'],
      'exo': ['Guard', 'Sentinel', 'Defender', 'Protector', 'Shield'],
      'hybrid': ['Quantum', 'Nexus', 'Fusion', 'Synthesis', 'Harmony'],
      'cyberpunk': ['Cyber', 'Neo', 'Matrix', 'Digital', 'Virtual'],
      'mythological': ['Atlas', 'Apollo', 'Athena', 'Zeus', 'Hera'],
      'scientific': ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
    };

    const specialistNames = specialists[specialist as keyof typeof specialists] || ['Generic'];
    const styleNames = styles[style as keyof typeof styles] || ['Standard'];
    
    const specialistName = specialistNames[Math.floor(Math.random() * specialistNames.length)];
    const styleName = styleNames[Math.floor(Math.random() * styleNames.length)];
    const number = Math.floor(Math.random() * 100) + 1;

    return `${specialistName}-${styleName}-${number}`;
  }
}
