/**
 * @file Development Formatting Tools
 * 
 * Native TypeScript implementation of code formatting tools.
 */

import { registerTool } from '../registry';
import { ToolResult } from '../types';

/**
 * Code formatting tools
 */
export class FormattingTools {
  @registerTool({
    name: 'format_frontend',
    category: 'development',
    description: 'Format frontend code with Prettier',
    enabled: true
  })
  static async formatFrontend(args: {
    checkOnly?: boolean;
    files?: string[];
    config?: string;
  }): Promise<ToolResult> {
    try {
      const { checkOnly = false, files = [], config } = args;
      const { spawn } = await import('child_process');

      const args_array = [
        ...(checkOnly ? ['--check'] : []),
        ...(config ? ['--config', config] : []),
        ...(files.length > 0 ? files : ['.'])
      ];

      return new Promise((resolve) => {
        const child = spawn('npx', ['prettier', ...args_array], {
          cwd: process.cwd(),
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          const success = code === 0;
          resolve({
            success,
            data: {
              exitCode: code,
              stdout,
              stderr,
              checkOnly
            },
            logs: [`Prettier ${checkOnly ? 'checked' : 'formatted'} code with exit code ${code}`]
          });
        });

        child.on('error', (error) => {
          resolve({
            success: false,
            error: `Failed to run Prettier: ${error.message}`
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run Prettier'
      };
    }
  }

  @registerTool({
    name: 'format_python',
    category: 'development',
    description: 'Format Python code with Black and isort',
    enabled: true
  })
  static async formatPython(args: {
    checkOnly?: boolean;
    files?: string[];
  }): Promise<ToolResult> {
    try {
      const { checkOnly = false, files = [] } = args;
      const { spawn } = await import('child_process');

      const results: any[] = [];
      const tools = ['black', 'isort'];

      for (const tool of tools) {
        const args_array = [
          ...(checkOnly ? ['--check'] : []),
          ...(files.length > 0 ? files : ['.'])
        ];

        const result = await new Promise<ToolResult>((resolve) => {
          const child = spawn(tool, args_array, {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
          });

          let stdout = '';
          let stderr = '';

          child.stdout.on('data', (data) => {
            stdout += data.toString();
          });

          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('close', (code) => {
            resolve({
              success: code === 0,
              data: {
                tool,
                exitCode: code,
                stdout,
                stderr
              }
            });
          });

          child.on('error', (error) => {
            resolve({
              success: false,
              error: `Failed to run ${tool}: ${error.message}`
            });
          });
        });

        results.push(result);
      }

      const allSuccess = results.every(r => r.success);
      return {
        success: allSuccess,
        data: { results },
        logs: [`Python formatting ${checkOnly ? 'check' : 'format'} completed`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to format Python code'
      };
    }
  }
}
