/**
 * @file MDS Tools
 *
 * Tools for working with Multidimensional Scaling (MDS) algorithm.
 */

import { MDS } from "@entropy-tamer/reynard-algorithms";
import type { MDSConfig, MDSResult, MDSOptions } from "@entropy-tamer/reynard-algorithms";
import { createScatterPlot, createBarChart } from "./visualization-utils";

/**
 * MDS analysis result
 */
export interface MDSAnalysis {
  numSamples: number;
  dimensions: number;
  stress?: number;
  iterations?: number;
  eigenvalues?: number[];
  executionTime: number;
  quality?: "excellent" | "good" | "fair" | "poor";
}

/**
 * MDS visualization result
 */
export interface MDSVisualization {
  scatterPlot: string;
  stressChart?: string;
  analysis: MDSAnalysis;
}

/**
 * Multidimensional Scaling tools
 */
export class MDSTools {
  /**
   * Fit MDS to distance matrix and transform it
   */
  static fitTransform(args: {
    distanceMatrix: number[][];
    options?: MDSOptions;
  }): MDSResult {
    const { distanceMatrix, options } = args;
    const mds = new MDS(options);
    return mds.fitTransform(distanceMatrix);
  }

  /**
   * Visualize 2D MDS embedding
   */
  static visualize2D(args: {
    result: MDSResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (result.embedding.length === 0) {
      return title ? `${title}\n(No data to visualize)` : "(No data to visualize)";
    }

    // Extract first two dimensions
    const points2D = result.embedding.map((row) => {
      if (row.length >= 2) {
        return [row[0], row[1]];
      } else if (row.length === 1) {
        return [row[0], 0];
      } else {
        return [0, 0];
      }
    });

    const plotTitle = title || "MDS 2D Embedding";
    return createScatterPlot(points2D, width, height, plotTitle);
  }

  /**
   * Visualize stress convergence (for metric MDS)
   */
  static visualizeStress(args: {
    result: MDSResult;
    stressHistory?: number[];
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, stressHistory, width = 80, height = 24, title } = args;

    if (!result.stress && (!stressHistory || stressHistory.length === 0)) {
      return title
        ? `${title}\n(No stress data available - use metric MDS with iterations)`
        : "(No stress data available)";
    }

    const values = stressHistory || (result.stress ? [result.stress] : []);
    if (values.length === 0) {
      return title ? `${title}\n(No stress data)` : "(No stress data)";
    }

    const labels = values.map((_, i) => `Iter ${i + 1}`);
    const plotTitle = title || "MDS Stress Convergence";
    return createBarChart(values, labels, width, height, plotTitle);
  }

  /**
   * Analyze MDS results
   */
  static analyze(args: { result: MDSResult }): MDSAnalysis {
    const { result } = args;

    if (result.embedding.length === 0) {
      return {
        numSamples: 0,
        dimensions: 0,
        executionTime: result.executionTime,
      };
    }

    const numSamples = result.embedding.length;
    const dimensions = result.embedding[0]?.length || 0;

    // Determine quality based on stress (lower is better)
    let quality: "excellent" | "good" | "fair" | "poor" | undefined;
    if (result.stress !== undefined) {
      if (result.stress < 0.05) {
        quality = "excellent";
      } else if (result.stress < 0.1) {
        quality = "good";
      } else if (result.stress < 0.2) {
        quality = "fair";
      } else {
        quality = "poor";
      }
    }

    return {
      numSamples,
      dimensions,
      stress: result.stress,
      iterations: result.iterations,
      eigenvalues: result.eigenvalues,
      executionTime: result.executionTime,
      quality,
    };
  }

  /**
   * Get comprehensive visualization with analysis
   */
  static visualize(args: {
    result: MDSResult;
    stressHistory?: number[];
    width?: number;
    height?: number;
    title?: string;
  }): MDSVisualization {
    const { result, stressHistory, width = 80, height = 24, title } = args;

    const scatterPlot = MDSTools.visualize2D({ result, width, height, title });
    const stressChart =
      result.stress || stressHistory
        ? MDSTools.visualizeStress({
            result,
            stressHistory,
            width,
            height,
            title: title ? `${title} - Stress` : undefined,
          })
        : undefined;
    const analysis = MDSTools.analyze({ result });

    return {
      scatterPlot,
      stressChart,
      analysis,
    };
  }
}

