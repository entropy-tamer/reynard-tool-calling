/**
 * @file Marching Squares Tools
 *
 * Tools for working with the Marching Squares algorithm.
 */

import { MarchingSquares, OptimizedMarchingSquaresAdapter } from "@entropy-tamer/reynard-algorithms";
import type {
  MarchingSquaresConfig,
  MarchingSquaresResult,
  MultiLevelContourOptions,
  MultiLevelContourResult,
  Contour,
  ContourAnalysisOptions,
  ContourAnalysis,
  ContourSimplificationOptions,
  ContourSimplificationResult,
} from "@entropy-tamer/reynard-algorithms";

/**
 * Marching Squares algorithm tools
 */
export class MarchingSquaresTools {
  /**
   * Compute contours from a 2D scalar field
   * @param args
   * @example
   */
  static compute(args: {
    grid: number[][];
    threshold?: number;
    config?: Partial<MarchingSquaresConfig>;
  }): MarchingSquaresResult {
    const { grid, threshold, config } = args;
    const marchingSquares = new MarchingSquares(config);
    return marchingSquares.compute(grid, threshold);
  }

  /**
   * Compute multi-level contours for different threshold values
   * @param args
   * @example
   */
  static computeMultiLevel(args: {
    grid: number[][];
    options: Partial<MultiLevelContourOptions>;
    config?: Partial<MarchingSquaresConfig>;
  }): MultiLevelContourResult {
    const { grid, options, config } = args;
    const marchingSquares = new MarchingSquares(config);
    return marchingSquares.computeMultiLevel(grid, options);
  }

  /**
   * Analyze a contour and compute various properties
   * @param args
   * @example
   */
  static analyzeContour(args: {
    contour: Contour;
    options?: Partial<ContourAnalysisOptions>;
    config?: Partial<MarchingSquaresConfig>;
  }): ContourAnalysis {
    const { contour, options, config } = args;
    const marchingSquares = new MarchingSquares(config);
    return marchingSquares.analyzeContour(contour, options);
  }

  /**
   * Simplify a contour by removing unnecessary segments
   * @param args
   * @example
   */
  static simplifyContour(args: {
    contour: Contour;
    options?: Partial<ContourSimplificationOptions>;
    config?: Partial<MarchingSquaresConfig>;
  }): ContourSimplificationResult {
    const { contour, options, config } = args;
    const marchingSquares = new MarchingSquares(config);
    return marchingSquares.simplifyContour(contour, options);
  }

  /**
   * Compute contours using PAW-optimized adapter
   * @param args
   * @example
   */
  static optimized(args: {
    grid: number[][];
    threshold?: number;
    config?: Partial<MarchingSquaresConfig>;
  }): MarchingSquaresResult {
    const { grid, threshold, config } = args;
    const adapter = new OptimizedMarchingSquaresAdapter({
      enableAlgorithmSelection: true,
      enableMemoryPooling: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: "adaptive",
      marchingSquaresConfig: config,
    });
    return adapter.compute(grid, threshold);
  }
}

