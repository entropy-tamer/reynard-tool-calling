/**
 * @file PNG Export Utilities
 *
 * Utilities for exporting ASCII visualizations to PNG images
 */

import { writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { mkdir } from "fs/promises";

/**
 * Convert ASCII art to PNG image
 * Uses a simple approach: creates a monospace bitmap
 *
 * @param asciiArt - ASCII art string to convert
 * @param outputPath - Path to save PNG file
 * @param options - Export options
 * @returns Promise that resolves when file is written
 */
export async function exportAsciiToPNG(
  asciiArt: string,
  outputPath: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    padding?: number;
    scale?: number;
  } = {}
): Promise<void> {
  const {
    fontSize = 12,
    fontFamily = "monospace",
    backgroundColor = "#000000",
    textColor = "#00ff00",
    padding = 20,
    scale = 2,
  } = options;

  // Try to use canvas if available, otherwise fall back to a simple text file
  try {
    // Dynamic import to avoid requiring canvas as a hard dependency
    const { createCanvas } = await import("canvas");
    const lines = asciiArt.split("\n");
    const maxWidth = Math.max(...lines.map(line => line.length));
    const numLines = lines.length;

    // Calculate canvas size
    const charWidth = fontSize * 0.6; // Approximate character width
    const charHeight = fontSize * 1.2; // Approximate character height
    const canvasWidth = Math.ceil(maxWidth * charWidth * scale) + padding * 2;
    const canvasHeight = Math.ceil(numLines * charHeight * scale) + padding * 2;

    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Set text style
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize * scale}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // Draw text
    lines.forEach((line, index) => {
      const y = padding + index * charHeight * scale;
      ctx.fillText(line, padding, y);
    });

    // Save to file
    const resolvedPath = resolve(outputPath);
    const dir = dirname(resolvedPath);
    await mkdir(dir, { recursive: true });

    const buffer = canvas.toBuffer("image/png");
    await writeFile(resolvedPath, buffer);
  } catch (error) {
    // Fallback: if canvas is not available, create a simple text file with .png extension
    // (not a real PNG, but at least we save the ASCII art)
    console.warn("Canvas library not available, saving as text file instead");
    const resolvedPath = resolve(outputPath.replace(/\.png$/, ".txt"));
    const dir = dirname(resolvedPath);
    await mkdir(dir, { recursive: true });
    await writeFile(resolvedPath, asciiArt);
    throw new Error(
      `PNG export requires 'canvas' package. Install with: pnpm add canvas. ASCII art saved to ${resolvedPath} instead.`
    );
  }
}

/**
 * Export multiple ASCII visualizations to PNG files
 *
 * @param visualizations - Array of {name, asciiArt} objects
 * @param outputDir - Directory to save PNG files
 * @param options - Export options
 * @returns Promise that resolves when all files are written
 */
export async function exportMultipleToPNG(
  visualizations: Array<{ name: string; asciiArt: string }>,
  outputDir: string,
  options: Parameters<typeof exportAsciiToPNG>[2] = {}
): Promise<string[]> {
  const outputPaths: string[] = [];

  for (const viz of visualizations) {
    const filename = `${viz.name.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    const outputPath = resolve(outputDir, filename);
    await exportAsciiToPNG(viz.asciiArt, outputPath, options);
    outputPaths.push(outputPath);
  }

  return outputPaths;
}
