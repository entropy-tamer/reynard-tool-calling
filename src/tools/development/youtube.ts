/**
 * @file YouTube Tools
 *
 * Native TypeScript implementation of YouTube-related tools.
 */

import { ToolResult } from "../types";
import { spawn } from "child_process";
import { join } from "path";

/**
 * YouTube tools for extracting closed captions
 */
export class YouTubeTools {
  /**
   * Extract closed captions from a YouTube video using yt-dlp
   */
  static async extractClosedCaptions(args: { url: string; outputDir?: string; proxy?: string }): Promise<ToolResult> {
    try {
      const { url, outputDir = process.cwd(), proxy } = args;

      if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
        return {
          success: false,
          error: "Invalid YouTube URL",
        };
      }

      // Check if yt-dlp is available
      return new Promise(resolve => {
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
        if (proxy) {
          args_array.push("--proxy", proxy);
        }

        args_array.push(url);

        const child = spawn("yt-dlp", args_array, {
          cwd: outputDir,
          stdio: ["pipe", "pipe", "pipe"],
        });

        let stdout = "";
        let stderr = "";

        // Add timeout to prevent hanging (5 minutes for video processing)
        const timeout = setTimeout(() => {
          child.kill("SIGTERM");
          resolve({
            success: false,
            error: "yt-dlp timed out after 5 minutes",
          });
        }, 300000);

        child.stdout.on("data", data => {
          stdout += data.toString();
        });

        child.stderr.on("data", data => {
          stderr += data.toString();
        });

        child.on("close", code => {
          clearTimeout(timeout);
          const success = code === 0;

          // Try to find the generated SRT file
          let srtFile = "";
          if (stdout) {
            const match = stdout.match(/\[download\] Writing video subtitles to: (.+\.srt)/);
            if (match) {
              srtFile = match[1];
            } else {
              // Try to extract filename from output or check for common patterns
              const lines = stdout.split("\n");
              for (const line of lines) {
                if (line.includes(".srt") || line.includes("Writing") || line.includes("Subtitle")) {
                  const fileMatch = line.match(/([^\s]+\.srt)/);
                  if (fileMatch) {
                    srtFile = fileMatch[1];
                    break;
                  }
                }
              }
            }
          }

          // Also check if file exists in output directory
          if (!srtFile && success) {
            const { readdirSync } = require("fs");
            try {
              const files = readdirSync(outputDir);
              const srtFiles = files.filter((f: string) => f.endsWith(".srt") && f.includes("en"));
              if (srtFiles.length > 0) {
                // Get the most recently modified one
                const { statSync } = require("fs");
                srtFiles.sort((a: string, b: string) => {
                  const statA = statSync(join(outputDir, a));
                  const statB = statSync(join(outputDir, b));
                  return statB.mtimeMs - statA.mtimeMs;
                });
                srtFile = join(outputDir, srtFiles[0]);
              }
            } catch (e) {
              // Ignore file system errors
            }
          }

          resolve({
            success,
            data: {
              exitCode: code,
              stdout,
              stderr,
              srtFile: srtFile || null,
              outputDir,
            },
            logs: [`yt-dlp ${success ? "extracted" : "failed to extract"} closed captions with exit code ${code}`],
            error: success ? undefined : stderr || `yt-dlp exited with code ${code}`,
          });
        });

        child.on("error", error => {
          clearTimeout(timeout);
          resolve({
            success: false,
            error: `Failed to run yt-dlp: ${error.message}. Make sure yt-dlp is installed.`,
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to extract closed captions",
      };
    }
  }
}






