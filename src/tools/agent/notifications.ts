/**
 * @file Agent Notification Tools
 * 
 * Native TypeScript implementation of desktop notification tools.
 */

import { registerTool } from '../registry';
import { ToolResult } from '../types';

/**
 * Desktop notification tools
 */
export class NotificationTools {
  @registerTool({
    name: 'send_desktop_notification',
    category: 'agent',
    description: 'Send desktop notification using system notification service',
    enabled: true
  })
  static async sendDesktopNotification(args: {
    title: string;
    message: string;
    icon?: string;
    sound?: boolean;
    timeout?: number;
  }): Promise<ToolResult> {
    try {
      const { title, message, icon, sound = true, timeout = 5000 } = args;

      // Use Node.js child_process to call notify-send (Linux) or osascript (macOS)
      const { spawn } = await import('child_process');
      const { platform } = await import('os');

      let command: string;
      let commandArgs: string[];

      if (platform() === 'darwin') {
        // macOS
        command = 'osascript';
        commandArgs = [
          '-e',
          `display notification "${message}" with title "${title}"`
        ];
      } else if (platform() === 'linux') {
        // Linux
        command = 'notify-send';
        commandArgs = [title, message];
        
        if (icon) {
          commandArgs.push('--icon', icon);
        }
        
        if (timeout) {
          commandArgs.push('--expire-time', timeout.toString());
        }
      } else {
        // Windows or other
        return {
          success: false,
          error: `Desktop notifications not supported on ${platform()}`
        };
      }

      return new Promise((resolve) => {
        const child = spawn(command, commandArgs);
        
        child.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              data: { sent: true, title, message },
              logs: [`Desktop notification sent: ${title}`]
            });
          } else {
            resolve({
              success: false,
              error: `Notification command failed with code ${code}`
            });
          }
        });

        child.on('error', (error) => {
          resolve({
            success: false,
            error: `Failed to send notification: ${error.message}`
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send desktop notification'
      };
    }
  }

  @registerTool({
    name: 'send_system_alert',
    category: 'agent',
    description: 'Send system alert with sound and visual notification',
    enabled: true
  })
  static async sendSystemAlert(args: {
    title: string;
    message: string;
    urgency?: 'low' | 'normal' | 'critical';
  }): Promise<ToolResult> {
    try {
      const { title, message, urgency = 'normal' } = args;

      // Use the desktop notification with urgency settings
      const result = await this.sendDesktopNotification({
        title,
        message,
        sound: true,
        timeout: urgency === 'critical' ? 10000 : 5000
      });

      if (result.success) {
        // Add urgency-specific logging
        const urgencyLog = `System alert (${urgency}): ${title}`;
        return {
          ...result,
          logs: [...(result.logs || []), urgencyLog]
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send system alert'
      };
    }
  }
}
