/**
 * @file ASCII Visualization Utilities
 *
 * Shared utilities for creating ASCII art visualizations of ML algorithm results.
 * Provides scatter plots, bar charts, heatmaps, and other visualization functions.
 */

/**
 * Normalize 2D points to fit within ASCII grid bounds
 */
export interface NormalizedPoints {
  points: Array<{ x: number; y: number }>;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Normalize points to fit within ASCII grid bounds
 *
 * @param points - Array of 2D points to normalize
 * @param width - Width of the ASCII grid (default: 80)
 * @param height - Height of the ASCII grid (default: 24)
 * @param padding - Padding around the plot (default: 2)
 * @returns Normalized points with bounds information
 * @example
 * ```ts
 * const normalized = normalizePoints([[1, 2], [3, 4]], 80, 24, 2);
 * ```
 */
export function normalizePoints(
  points: number[][],
  width: number = 80,
  height: number = 24,
  padding: number = 2
): NormalizedPoints {
  if (points.length === 0) {
    return {
      points: [],
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width,
      height,
    };
  }

  // Find bounds
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    if (point.length >= 2 && point[0] !== undefined && point[1] !== undefined) {
      minX = Math.min(minX, point[0]!);
      maxX = Math.max(maxX, point[0]!);
      minY = Math.min(minY, point[1]!);
      maxY = Math.max(maxY, point[1]!);
    }
  }

  // Handle edge case where all points are the same
  if (minX === maxX) {
    minX -= 1;
    maxX += 1;
  }
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }

  // Calculate scale with padding
  const plotWidth = width - 2 * padding;
  const plotHeight = height - 2 * padding;
  const scaleX = plotWidth / (maxX - minX);
  const scaleY = plotHeight / (maxY - minY);

  // Normalize points
  const normalized = points.map((point) => {
    if (point.length < 2 || point[0] === undefined || point[1] === undefined) {
      return { x: 0, y: 0 };
    }
    const x = Math.round((point[0]! - minX) * scaleX) + padding;
    const y = Math.round((point[1]! - minY) * scaleY) + padding;
    return {
      x: Math.max(0, Math.min(width - 1, x)),
      y: Math.max(0, Math.min(height - 1, y)),
    };
  });

  return {
    points: normalized,
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
  };
}

/**
 * Create ASCII scatter plot from 2D points
 *
 * @param points - Array of 2D points to plot
 * @param width - Width of the plot (default: 80)
 * @param height - Height of the plot (default: 24)
 * @param title - Optional title for the plot
 * @returns ASCII art string representation of the scatter plot
 * @example
 * ```ts
 * const plot = createScatterPlot([[1, 2], [3, 4]], 80, 24, "My Plot");
 * ```
 */
export function createScatterPlot(
  points: number[][],
  width: number = 80,
  height: number = 24,
  title?: string
): string {
  if (points.length === 0) {
    return title ? `${title}\n(No data points)` : "(No data points)";
  }

  const normalized = normalizePoints(points, width, height);
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(" "));

  // Count density at each position
  const density: number[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(0));

  for (const point of normalized.points) {
    if (
      point.x >= 0 &&
      point.x < width &&
      point.y >= 0 &&
      point.y < height &&
      point.y !== undefined &&
      point.x !== undefined
    ) {
      const y = point.y;
      const x = point.x;
      if (density[y] && density[y][x] !== undefined) {
        density[y]![x]!++;
      }
    }
  }

  // Map density to characters
  const densityChars = [".", ":", ";", "o", "O", "@", "#"];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const count = density[y]?.[x];
      if (count !== undefined && count > 0) {
        const charIndex = Math.min(count - 1, densityChars.length - 1);
        const char = densityChars[charIndex];
        if (grid[y] && grid[y][x] !== undefined && char !== undefined) {
          grid[y]![x]! = char;
        }
      }
    }
  }

  // Add axes
  const midY = Math.floor(height / 2);
  const midX = Math.floor(width / 2);
  for (let x = 0; x < width; x++) {
    if (grid[midY] && grid[midY][x] === " ") {
      grid[midY]![x]! = "-";
    }
  }
  for (let y = 0; y < height; y++) {
    const row = grid[y];
    if (row && row[midX] === " ") {
      row[midX]! = "|";
    }
  }
  if (grid[midY] && grid[midY][midX] !== undefined) {
    grid[midY]![midX]! = "+";
  }

  // Convert to string
  const lines = grid.map((row) => (row ? row.join("") : ""));
  let output = "";
  if (title) {
    output += `${title}\n`;
  }
  output += lines.join("\n");
  const minX = normalized.minX ?? 0;
  const maxX = normalized.maxX ?? 0;
  const minY = normalized.minY ?? 0;
  const maxY = normalized.maxY ?? 0;
  output += `\nRange: X [${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`;
  output += `\nPoints: ${points.length}`;

  return output;
}

/**
 * Create ASCII bar chart
 *
 * @param values - Array of values to display as bars
 * @param labels - Optional array of labels for each bar
 * @param width - Width of the chart (default: 80)
 * @param height - Height of the chart (default: 24)
 * @param title - Optional title for the chart
 * @returns ASCII art string representation of the bar chart
 * @example
 * ```ts
 * const chart = createBarChart([1, 2, 3], ["A", "B", "C"], 80, 24, "My Chart");
 * ```
 */
export function createBarChart(
  values: number[],
  labels?: string[],
  width: number = 80,
  height: number = 24,
  title?: string
): string {
  if (values.length === 0) {
    return title ? `${title}\n(No data)` : "(No data)";
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;

  if (range === 0) {
    return title ? `${title}\n(All values are equal: ${maxValue})` : `(All values are equal: ${maxValue})`;
  }

  // Calculate bar heights
  const barWidth = Math.floor((width - 2) / values.length);
  const plotHeight = height - 2;
  const bars: Array<{ height: number; value: number; label?: string }> = [];

  for (let i = 0; i < values.length; i++) {
    const normalized = (values[i] - minValue) / range;
    const barHeight = Math.max(1, Math.floor(normalized * plotHeight));
    bars.push({
      height: barHeight,
      value: values[i],
      label: labels?.[i],
    });
  }

  // Create grid
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(" "));

  // Draw bars
  for (let i = 0; i < bars.length; i++) {
    const bar = bars[i];
    if (!bar) continue;
    const startX = 1 + i * barWidth;
    const endX = Math.min(startX + barWidth - 1, width - 2);

    for (let x = startX; x <= endX; x++) {
      for (let h = 0; h < bar.height; h++) {
        const y = height - 2 - h;
        if (y >= 1 && y < height - 1 && grid[y] && grid[y][x] !== undefined) {
          // Use different characters based on bar height
          const charIndex = Math.floor((h / bar.height) * 4);
          const chars = ["░", "▒", "▓", "█"];
          grid[y]![x]! = chars[Math.min(charIndex, 3)]!;
        }
      }
    }
  }

  // Add bottom border
  const bottomRow = grid[height - 1];
  if (bottomRow) {
    for (let x = 0; x < width; x++) {
      if (bottomRow[x] !== undefined) {
        bottomRow[x]! = "─";
      }
    }
  }

  // Convert to string
  const lines = grid.map((row) => row.join(""));
  let output = "";
  if (title) {
    output += `${title}\n`;
  }
  output += lines.join("\n");
  output += `\nRange: [${minValue.toFixed(3)}, ${maxValue.toFixed(3)}]`;

  // Add labels if provided
  if (labels && labels.length > 0) {
    output += "\nLabels: ";
    for (let i = 0; i < Math.min(labels.length, 10); i++) {
      output += `${i + 1}=${labels[i]} `;
    }
    if (labels.length > 10) {
      output += "...";
    }
  }

  return output;
}

/**
 * Create ASCII heatmap from 2D matrix
 *
 * @param matrix - 2D matrix of values to visualize
 * @param width - Width of the heatmap (default: 80)
 * @param height - Height of the heatmap (default: 24)
 * @param title - Optional title for the heatmap
 * @returns ASCII art string representation of the heatmap
 * @example
 * ```ts
 * const heatmap = createHeatmap([[1, 2], [3, 4]], 80, 24, "My Heatmap");
 * ```
 */
export function createHeatmap(
  matrix: number[][],
  width: number = 80,
  height: number = 24,
  title?: string
): string {
  if (matrix.length === 0 || matrix[0].length === 0) {
    return title ? `${title}\n(No data)` : "(No data)";
  }

  const rows = matrix.length;
  const firstRow = matrix[0];
  if (!firstRow) {
    return title ? `${title}\n(No data)` : "(No data)";
  }
  const cols = firstRow.length;

  // Find min/max
  let min = Infinity;
  let max = -Infinity;
  for (const row of matrix) {
    if (row) {
      for (const val of row) {
        if (val !== undefined) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      }
    }
  }

  if (min === max) {
    return title ? `${title}\n(All values are equal: ${min})` : `(All values are equal: ${min})`;
  }

  // Scale to fit
  const scaleX = width / cols;
  const scaleY = height / rows;
  const grid: string[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(" "));

  // Map values to characters
  const heatChars = [" ", ".", ":", ";", "o", "O", "@", "#"];
  for (let r = 0; r < rows; r++) {
    const row = matrix[r];
    if (!row) continue;
    for (let c = 0; c < cols; c++) {
      const val = row[c];
      if (val === undefined) continue;
      const normalized = (val - min) / (max - min);
      const charIndex = Math.floor(normalized * (heatChars.length - 1));
      const char = heatChars[charIndex];
      if (!char) continue;

      // Scale to grid
      const startY = Math.floor(r * scaleY);
      const endY = Math.floor((r + 1) * scaleY);
      const startX = Math.floor(c * scaleX);
      const endX = Math.floor((c + 1) * scaleX);

      for (let y = startY; y < endY && y < height; y++) {
        const gridRow = grid[y];
        if (!gridRow) continue;
        for (let x = startX; x < endX && x < width; x++) {
          if (gridRow[x] !== undefined) {
            gridRow[x]! = char;
          }
        }
      }
    }
  }

  // Convert to string
  const lines = grid.map((row) => row.join(""));
  let output = "";
  if (title) {
    output += `${title}\n`;
  }
  output += lines.join("\n");
  output += `\nRange: [${min.toFixed(3)}, ${max.toFixed(3)}]`;
  output += `\nSize: ${rows}x${cols}`;

  return output;
}

/**
 * Create legend for visualizations
 *
 * @param items - Array of legend items with symbol and label
 * @returns Formatted legend string
 * @example
 * ```ts
 * const legend = createLegend([{ symbol: "●", label: "Data point" }]);
 * ```
 */
export function createLegend(items: Array<{ symbol: string; label: string }>): string {
  if (items.length === 0) {
    return "";
  }

  let output = "Legend:\n";
  for (const item of items) {
    output += `  ${item.symbol} = ${item.label}\n`;
  }
  return output.trim();
}

