/**
 * @file Agent Time Tools
 * 
 * Native TypeScript implementation of time-related agent tools.
 */

import { ToolResult } from '../types';

/**
 * Get current time and date information
 */
export class TimeTools {
  static async getCurrentTime(): Promise<ToolResult> {
    try {
      const now = new Date();
      const timeInfo = {
        timestamp: now.getTime(),
        iso: now.toISOString(),
        local: now.toString(),
        utc: now.toUTCString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours(),
        minute: now.getMinutes(),
        second: now.getSeconds(),
        millisecond: now.getMilliseconds(),
        weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
        monthName: now.toLocaleDateString('en-US', { month: 'long' })
      };

      return {
        success: true,
        data: timeInfo,
        logs: [`Current time: ${timeInfo.iso}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get current time'
      };
    }
  }

  static async getTimezoneInfo(): Promise<ToolResult> {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const now = new Date();
      
      const timezoneInfo = {
        timezone,
        offset: now.getTimezoneOffset(),
        offsetHours: Math.abs(now.getTimezoneOffset()) / 60,
        isDST: this.isDST(now),
        utcOffset: `UTC${now.getTimezoneOffset() <= 0 ? '+' : ''}${-now.getTimezoneOffset() / 60}`,
        localTime: now.toLocaleString(),
        utcTime: now.toUTCString()
      };

      return {
        success: true,
        data: timezoneInfo,
        logs: [`Timezone: ${timezone}, Offset: ${timezoneInfo.utcOffset}`]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get timezone info'
      };
    }
  }

  private static isDST(date: Date): boolean {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    return date.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }
}
