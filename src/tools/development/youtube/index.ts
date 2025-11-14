/**
 * @file YouTube Tools
 *
 * Native TypeScript implementation of YouTube-related tools.
 */

import { ToolResult } from "../../types";
import { spawn } from "child_process";
import { join } from "path";
import { handleProcess, extractSrtFile } from "./process-handler";

/**
 * YouTube tools for extracting closed captions
 */
export class YouTubeTools {
  /**
   * Extract closed captions from a YouTube video using yt-dlp
   * @param args - Configuration object
   * @param args.url - YouTube video URL (required)
   * @param args.outputDir - Output directory for SRT file (optional, defaults to current working directory)
   * @param args.proxy - Proxy URL for yt-dlp (optional)
   * @returns Promise resolving to ToolResult with extraction status and SRT file path
   * @example
   * await YouTubeTools.extractClosedCaptions({ url: 'https://www.youtube.com/watch?v=example' })
   */
  static async extractClosedCaptions(args: { url: string; outputDir?: string; proxy?: string }): Promise<ToolResult> {
    try {
      const { url, outputDir = process.cwd() } = args;

      if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
        return {
          success: false,
          error: "Invalid YouTube URL",
        };
      }

      // Check if yt-dlp is available
      const args_array = [
        "--skip-download",
        "--write-auto-subs",
        "--sub-lang",
        "en",
        "--convert-subs",
        "srt",
        "-o",
        join(outputDir, "%(title)s.%(ext)s"),
      ];

      // Add proxy if provided
      if (args.proxy) {
        args_array.push("--proxy", args.proxy);
      }

      args_array.push(url);

      const child = spawn("yt-dlp", args_array, {
        cwd: outputDir,
        stdio: ["pipe", "pipe", "pipe"],
      });

      const result = await handleProcess(child, 300000);
      const success = result.exitCode === 0;
      const srtFile = extractSrtFile(result.stdout);

      return {
        success,
        data: {
          exitCode: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
          srtFile: srtFile || null,
          outputDir,
        },
        logs: [
          `yt-dlp ${success ? "extracted" : "failed to extract"} closed captions with exit code ${result.exitCode}`,
        ],
        ...(success ? {} : { error: result.stderr || `yt-dlp exited with code ${result.exitCode}` }),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract closed captions",
      };
    }
  }
}
