/**
 * @file PCA Tools
 *
 * Tools for working with Principal Component Analysis (PCA) algorithm.
 */

import { PCA } from "@entropy-tamer/reynard-algorithms";
import type { PCAResult, PCAOptions } from "@entropy-tamer/reynard-algorithms";
import { createScatterPlot, createBarChart } from "./visualization-utils";

/**
 * PCA analysis result
 */
export interface PCAAnalysis {
  totalVariance: number;
  explainedVariance: number[];
  explainedVarianceRatio: number[];
  cumulativeVarianceRatio: number[];
  numComponents: number;
  originalDimensions: number;
  reductionRatio: number;
  executionTime: number;
}

/**
 * PCA visualization result
 */
export interface PCAVisualization {
  scatterPlot: string;
  varianceChart: string;
  analysis: PCAAnalysis;
}

/**
 * Principal Component Analysis tools
 */
export class PCATools {
  private static instances: Map<string, PCA> = new Map();

  /**
   * Fit PCA to data and transform it
   *
   * @param args - Arguments object
   * @param args.data - Input data (n x m), where n is samples and m is features
   * @param args.options - Optional PCA configuration options
   * @returns PCA result with transformed data
   * @example
   * ```ts
   * const result = PCATools.fitTransform({ data: [[1, 2], [3, 4]] });
   * ```
   */
  static fitTransform(args: {
    data: number[][];
    options?: PCAOptions;
  }): PCAResult {
    const { data, options } = args;
    const pca = new PCA(options);
    return pca.fitTransform(data);
  }

  /**
   * Transform new data using a fitted PCA instance
   *
   * @param args - Arguments object
   * @param args.instanceId - ID of the fitted PCA instance
   * @param args.data - New data to transform
   * @param args.options - Optional PCA configuration options (unused if instance exists)
   * @returns Transformed data
   * @example
   * ```ts
   * const transformed = PCATools.transform({ instanceId: "my-pca", data: [[1, 2]] });
   * ```
   */
  static transform(args: {
    instanceId: string;
    data: number[][];
    options?: PCAOptions;
  }): number[][] {
    const { instanceId, data, options } = args;
    let pca = PCATools.instances.get(instanceId);

    if (!pca) {
      // Create new instance if it doesn't exist
      pca = new PCA(options);
      // Fit it first with dummy data to initialize
      // Actually, we need to fit it first - this is a limitation
      throw new Error(
        `PCA instance '${instanceId}' not found. Use fitTransform first to create an instance.`
      );
    }

    return pca.transform(data);
  }

  /**
   * Transform new data using a previously fitted PCA
   * This version stores the fitted PCA for reuse
   *
   * @param args - Arguments object
   * @param args.instanceId - ID to store the fitted PCA instance
   * @param args.data - Input data to fit and transform
   * @param args.options - Optional PCA configuration options
   * @returns PCA result with transformed data
   * @example
   * ```ts
   * const result = PCATools.fitTransformWithInstance({ instanceId: "my-pca", data: [[1, 2]] });
   * ```
   */
  static fitTransformWithInstance(args: {
    instanceId: string;
    data: number[][];
    options?: PCAOptions;
  }): PCAResult {
    const { instanceId, data, options } = args;
    const pca = new PCA(options);
    const result = pca.fitTransform(data);
    PCATools.instances.set(instanceId, pca);
    return result;
  }

  /**
   * Inverse transform: reconstruct original data from transformed data
   *
   * @param args - Arguments object
   * @param args.instanceId - ID of the fitted PCA instance
   * @param args.transformed - Transformed data to reconstruct
   * @returns Reconstructed original data
   * @example
   * ```ts
   * const reconstructed = PCATools.inverseTransform({ instanceId: "my-pca", transformed: [[0.5, 0.3]] });
   * ```
   */
  static inverseTransform(args: {
    instanceId: string;
    transformed: number[][];
  }): number[][] {
    const { instanceId, transformed } = args;
    const pca = PCATools.instances.get(instanceId);

    if (!pca) {
      throw new Error(`PCA instance '${instanceId}' not found. Use fitTransformWithInstance first.`);
    }

    const components = pca.getComponents();
    // Access private fields via type assertion (PCA doesn't expose these publicly)
    interface PCAWithInternals {
      mean?: number[];
      scale?: number[];
    }
    const pcaInternal = pca as unknown as PCAWithInternals;
    const mean = pcaInternal.mean;
    const scale = pcaInternal.scale;

    if (!components || components.length === 0) {
      throw new Error("PCA components not available");
    }

    const numSamples = transformed.length;
    const numComponents = components.length;
    const firstComponent = components[0];
    if (!firstComponent) {
      throw new Error("PCA components are empty");
    }
    const numFeatures = firstComponent.length;

    // Reconstruct: X_reconstructed = Y * V^T
    const reconstructed: number[][] = Array(numSamples)
      .fill(0)
      .map(() => Array(numFeatures).fill(0));

    for (let i = 0; i < numSamples; i++) {
      const transformedRow = transformed[i];
      if (!transformedRow) continue;
      for (let j = 0; j < numFeatures; j++) {
        let sum = 0;
        for (let d = 0; d < numComponents; d++) {
          const comp = components[d];
          if (!comp) continue;
          const compVal = comp[j];
          const transVal = transformedRow[d];
          if (compVal !== undefined && transVal !== undefined) {
            sum += transVal * compVal;
          }
        }
        const reconRow = reconstructed[i];
        if (reconRow) {
          reconRow[j] = sum;
        }
      }
    }

    // Reverse scaling if it was applied
    if (scale) {
      for (let i = 0; i < numSamples; i++) {
        const reconRow = reconstructed[i];
        if (!reconRow) continue;
        for (let j = 0; j < numFeatures; j++) {
          const scaleVal = scale[j];
          if (scaleVal !== undefined && reconRow[j] !== undefined) {
            reconRow[j]! *= scaleVal;
          }
        }
      }
    }

    // Reverse centering if it was applied
    if (mean) {
      for (let i = 0; i < numSamples; i++) {
        const reconRow = reconstructed[i];
        if (!reconRow) continue;
        for (let j = 0; j < numFeatures; j++) {
          const meanVal = mean[j];
          if (meanVal !== undefined && reconRow[j] !== undefined) {
            reconRow[j]! += meanVal;
          }
        }
      }
    }

    return reconstructed;
  }

  /**
   * Visualize 2D PCA projection
   *
   * @param args - Arguments object
   * @param args.result - PCA result to visualize
   * @param args.width - Width of the plot (default: 80)
   * @param args.height - Height of the plot (default: 24)
   * @param args.title - Optional title for the plot
   * @returns ASCII scatter plot string
   * @example
   * ```ts
   * const plot = PCATools.visualize2D({ result: pcaResult });
   * ```
   */
  static visualize2D(args: {
    result: PCAResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (result.transformed.length === 0) {
      return title ? `${title}\n(No data to visualize)` : "(No data to visualize)";
    }

    // Extract first two components
    const points2D = result.transformed.map((row) => {
      if (row.length >= 2 && row[0] !== undefined && row[1] !== undefined) {
        return [row[0]!, row[1]!];
      } else if (row.length === 1 && row[0] !== undefined) {
        return [row[0]!, 0];
      } else {
        return [0, 0];
      }
    });

    const plotTitle = title ?? "PCA 2D Projection (PC1 vs PC2)";
    return createScatterPlot(points2D, width, height, plotTitle);
  }

  /**
   * Visualize explained variance
   *
   * @param args - Arguments object
   * @param args.result - PCA result to visualize
   * @param args.width - Width of the chart (default: 80)
   * @param args.height - Height of the chart (default: 24)
   * @param args.title - Optional title for the chart
   * @returns ASCII bar chart string
   * @example
   * ```ts
   * const chart = PCATools.visualizeVariance({ result: pcaResult });
   * ```
   */
  static visualizeVariance(args: {
    result: PCAResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (result.explainedVarianceRatio.length === 0) {
      return title ? `${title}\n(No variance data)` : "(No variance data)";
    }

    const labels = result.explainedVarianceRatio.map(
      (_, i) => `PC${i + 1}`
    );
    const plotTitle = title ?? "Explained Variance Ratio";
    return createBarChart(
      result.explainedVarianceRatio,
      labels,
      width,
      height,
      plotTitle
    );
  }

  /**
   * Analyze PCA results
   *
   * @param args - Arguments object
   * @param args.result - PCA result to analyze
   * @returns Analysis with statistics
   * @example
   * ```ts
   * const analysis = PCATools.analyze({ result: pcaResult });
   * ```
   */
  static analyze(args: { result: PCAResult }): PCAAnalysis {
    const { result } = args;

    if (result.explainedVariance.length === 0) {
      return {
        totalVariance: 0,
        explainedVariance: [],
        explainedVarianceRatio: [],
        cumulativeVarianceRatio: [],
        numComponents: 0,
        originalDimensions: 0,
        reductionRatio: 0,
        executionTime: result.executionTime,
      };
    }

    const totalVariance = result.explainedVariance.reduce(
      (sum, v) => sum + v,
      0
    );
    const cumulativeVarianceRatio: number[] = [];
    let cumulative = 0;

    for (const ratio of result.explainedVarianceRatio) {
      cumulative += ratio;
      cumulativeVarianceRatio.push(cumulative);
    }

    const firstComponent = result.components.length > 0
      ? result.components[0]
      : undefined;
    const originalDimensions = firstComponent?.length ?? 0;
    const numComponents = result.components.length;
    const reductionRatio =
      originalDimensions > 0
        ? numComponents / originalDimensions
        : 0;

    return {
      totalVariance,
      explainedVariance: result.explainedVariance,
      explainedVarianceRatio: result.explainedVarianceRatio,
      cumulativeVarianceRatio,
      numComponents,
      originalDimensions,
      reductionRatio,
      executionTime: result.executionTime,
    };
  }

  /**
   * Get comprehensive visualization with analysis
   *
   * @param args - Arguments object
   * @param args.result - PCA result to visualize
   * @param args.width - Width of the plots (default: 80)
   * @param args.height - Height of the plots (default: 24)
   * @param args.title - Optional title for the plots
   * @returns Comprehensive visualization with scatter plot, variance chart, and analysis
   * @example
   * ```ts
   * const viz = PCATools.visualize({ result: pcaResult });
   * ```
   */
  static visualize(args: {
    result: PCAResult;
    width?: number;
    height?: number;
    title?: string;
  }): PCAVisualization {
    const { result, width = 80, height = 24, title } = args;

    const scatterPlot = PCATools.visualize2D({ result, width, height, title });
    const varianceTitle = title ? `${title} - Variance` : undefined;
    const varianceChart = PCATools.visualizeVariance({
      result,
      width,
      height,
      ...(varianceTitle !== undefined ? { title: varianceTitle } : {}),
    });
    const analysis = PCATools.analyze({ result });

    return {
      scatterPlot,
      varianceChart,
      analysis,
    };
  }
}

