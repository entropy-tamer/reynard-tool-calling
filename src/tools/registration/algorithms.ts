/**
 * @file Algorithms Tools Registration
 *
 * Registers all algorithm-related tools with the registry.
 */

import { MarchingSquaresTools } from "../algorithms/marching-squares";
import { PCATools } from "../algorithms/pca";
import { MDSTools } from "../algorithms/mds";
import { IsomapTools } from "../algorithms/isomap";
import { registerToolCategory, createHandler } from "./utils";

/**
 * Register all algorithm tools
 */
export function registerAlgorithmTools(): void {
  registerToolCategory("algorithms", [
    {
      config: {
        name: "marching_squares_compute",
        description: "Compute contours from a 2D scalar field using the Marching Squares algorithm",
        enabled: true,
      },
      handler: createHandler((args: {
        grid: number[][];
        threshold?: number;
        config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
      }) => MarchingSquaresTools.compute(args)),
    },
    {
      config: {
        name: "marching_squares_compute_multi_level",
        description: "Compute multi-level contours for different threshold values",
        enabled: true,
      },
      handler: createHandler((args: {
        grid: number[][];
        options: Partial<import("@reynard/algorithms").MultiLevelContourOptions>;
        config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
      }) => MarchingSquaresTools.computeMultiLevel(args)),
    },
    {
      config: {
        name: "marching_squares_analyze_contour",
        description: "Analyze a contour and compute various properties (length, area, centroid, bounding box)",
        enabled: true,
      },
      handler: createHandler((args: {
        contour: import("@reynard/algorithms").Contour;
        options?: Partial<import("@reynard/algorithms").ContourAnalysisOptions>;
        config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
      }) => MarchingSquaresTools.analyzeContour(args)),
    },
    {
      config: {
        name: "marching_squares_simplify_contour",
        description: "Simplify a contour by removing unnecessary segments using Douglas-Peucker algorithm",
        enabled: true,
      },
      handler: createHandler((args: {
        contour: import("@reynard/algorithms").Contour;
        options?: Partial<import("@reynard/algorithms").ContourSimplificationOptions>;
        config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
      }) => MarchingSquaresTools.simplifyContour(args)),
    },
    {
      config: {
        name: "marching_squares_optimized",
        description: "Compute contours using PAW-optimized adapter with automatic algorithm selection",
        enabled: true,
      },
      handler: createHandler((args: {
        grid: number[][];
        threshold?: number;
        config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
      }) => MarchingSquaresTools.optimized(args)),
    },
    // PCA Tools
    {
      config: {
        name: "pca_fit_transform",
        description: "Fit PCA to data and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler((args: {
        data: number[][];
        options?: import("@entropy-tamer/reynard-algorithms").PCAOptions;
      }) => PCATools.fitTransform(args)),
    },
    {
      config: {
        name: "pca_fit_transform_with_instance",
        description: "Fit PCA to data and store instance for later use",
        enabled: true,
      },
      handler: createHandler((args: {
        instanceId: string;
        data: number[][];
        options?: import("@entropy-tamer/reynard-algorithms").PCAOptions;
      }) => PCATools.fitTransformWithInstance(args)),
    },
    {
      config: {
        name: "pca_transform",
        description: "Transform new data using a fitted PCA instance",
        enabled: true,
      },
      handler: createHandler((args: {
        instanceId: string;
        data: number[][];
        options?: import("@entropy-tamer/reynard-algorithms").PCAOptions;
      }) => PCATools.transform(args)),
    },
    {
      config: {
        name: "pca_inverse_transform",
        description: "Reconstruct original data from transformed PCA data",
        enabled: true,
      },
      handler: createHandler((args: {
        instanceId: string;
        transformed: number[][];
      }) => PCATools.inverseTransform(args)),
    },
    {
      config: {
        name: "pca_visualize_2d",
        description: "Generate ASCII scatter plot of 2D PCA projection",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").PCAResult;
        width?: number;
        height?: number;
        title?: string;
      }) => PCATools.visualize2D(args)),
    },
    {
      config: {
        name: "pca_visualize_variance",
        description: "Generate ASCII bar chart of explained variance",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").PCAResult;
        width?: number;
        height?: number;
        title?: string;
      }) => PCATools.visualizeVariance(args)),
    },
    {
      config: {
        name: "pca_analyze",
        description: "Analyze PCA results and compute statistics",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").PCAResult;
      }) => PCATools.analyze(args)),
    },
    {
      config: {
        name: "pca_visualize",
        description: "Get comprehensive PCA visualization with analysis",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").PCAResult;
        width?: number;
        height?: number;
        title?: string;
      }) => PCATools.visualize(args)),
    },
    // MDS Tools
    {
      config: {
        name: "mds_fit_transform",
        description: "Fit MDS to distance matrix and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler((args: {
        distanceMatrix: number[][];
        options?: import("@entropy-tamer/reynard-algorithms").MDSOptions;
      }) => MDSTools.fitTransform(args)),
    },
    {
      config: {
        name: "mds_visualize_2d",
        description: "Generate ASCII scatter plot of 2D MDS embedding",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").MDSResult;
        width?: number;
        height?: number;
        title?: string;
      }) => MDSTools.visualize2D(args)),
    },
    {
      config: {
        name: "mds_visualize_stress",
        description: "Generate ASCII visualization of stress convergence",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").MDSResult;
        stressHistory?: number[];
        width?: number;
        height?: number;
        title?: string;
      }) => MDSTools.visualizeStress(args)),
    },
    {
      config: {
        name: "mds_analyze",
        description: "Analyze MDS results and compute quality metrics",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").MDSResult;
      }) => MDSTools.analyze(args)),
    },
    {
      config: {
        name: "mds_visualize",
        description: "Get comprehensive MDS visualization with analysis",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").MDSResult;
        stressHistory?: number[];
        width?: number;
        height?: number;
        title?: string;
      }) => MDSTools.visualize(args)),
    },
    // Isomap Tools
    {
      config: {
        name: "isomap_fit_transform",
        description: "Fit Isomap to data and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler((args: {
        data: number[][];
        options?: import("@entropy-tamer/reynard-algorithms").IsomapOptions;
      }) => IsomapTools.fitTransform(args)),
    },
    {
      config: {
        name: "isomap_visualize_2d",
        description: "Generate ASCII scatter plot of 2D Isomap embedding",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
        width?: number;
        height?: number;
        title?: string;
      }) => IsomapTools.visualize2D(args)),
    },
    {
      config: {
        name: "isomap_visualize_graph",
        description: "Generate ASCII visualization of k-NN graph structure",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
        width?: number;
        height?: number;
        title?: string;
      }) => IsomapTools.visualizeGraph(args)),
    },
    {
      config: {
        name: "isomap_visualize_distances",
        description: "Generate ASCII heatmap of geodesic distance matrix",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
        width?: number;
        height?: number;
        title?: string;
      }) => IsomapTools.visualizeDistances(args)),
    },
    {
      config: {
        name: "isomap_analyze",
        description: "Analyze Isomap results and compute graph metrics",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
      }) => IsomapTools.analyze(args)),
    },
    {
      config: {
        name: "isomap_visualize",
        description: "Get comprehensive Isomap visualization with analysis",
        enabled: true,
      },
      handler: createHandler((args: {
        result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
        width?: number;
        height?: number;
        title?: string;
        includeGraph?: boolean;
        includeDistances?: boolean;
      }) => IsomapTools.visualize(args)),
    },
  ]);
}

