/**
 * @file Isomap Tools
 *
 * Tools for working with Isomap (Isometric Mapping) algorithm.
 */

import { Isomap } from "@entropy-tamer/reynard-algorithms";
import type {
  IsomapConfig,
  IsomapResult,
  IsomapOptions,
} from "@entropy-tamer/reynard-algorithms";
import { createScatterPlot, createHeatmap } from "./visualization-utils";

/**
 * Isomap analysis result
 */
export interface IsomapAnalysis {
  numSamples: number;
  dimensions: number;
  k: number;
  graphNodes: number;
  graphEdges: number;
  averageDegree: number;
  geodesicDistances: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  executionTime: number;
  error?: string;
}

/**
 * Isomap visualization result
 */
export interface IsomapVisualization {
  scatterPlot: string;
  graphVisualization?: string;
  distanceHeatmap?: string;
  analysis: IsomapAnalysis;
}

/**
 * Isomap tools
 */
export class IsomapTools {
  /**
   * Fit Isomap to data and transform it
   */
  static fitTransform(args: {
    data: number[][];
    options?: IsomapOptions;
  }): IsomapResult {
    const { data, options } = args;
    const isomap = new Isomap(options);
    return isomap.fitTransform(data);
  }

  /**
   * Visualize 2D Isomap embedding
   */
  static visualize2D(args: {
    result: IsomapResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (result.embedding.length === 0) {
      return title
        ? `${title}\n(No data to visualize)`
        : "(No data to visualize)";
    }

    if (result.error) {
      return title
        ? `${title}\nError: ${result.error}`
        : `Error: ${result.error}`;
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

    const plotTitle = title || "Isomap 2D Embedding";
    return createScatterPlot(points2D, width, height, plotTitle);
  }

  /**
   * Visualize k-NN graph structure
   */
  static visualizeGraph(args: {
    result: IsomapResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (!result.graph) {
      return title
        ? `${title}\n(No graph data available)`
        : "(No graph data available)";
    }

    if (result.error) {
      return title
        ? `${title}\nError: ${result.error}`
        : `Error: ${result.error}`;
    }

    // Create adjacency matrix visualization
    const n = result.graph.nodes;
    const adjacency: number[][] = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    for (const edge of result.graph.edges) {
      adjacency[edge.from][edge.to] = edge.weight;
      adjacency[edge.to][edge.from] = edge.weight; // Undirected graph
    }

    const plotTitle = title || "Isomap k-NN Graph (Adjacency Matrix)";
    return createHeatmap(adjacency, width, height, plotTitle);
  }

  /**
   * Visualize geodesic distance matrix
   */
  static visualizeDistances(args: {
    result: IsomapResult;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { result, width = 80, height = 24, title } = args;

    if (result.geodesicDistances.length === 0) {
      return title
        ? `${title}\n(No distance data available)`
        : "(No distance data available)";
    }

    if (result.error) {
      return title
        ? `${title}\nError: ${result.error}`
        : `Error: ${result.error}`;
    }

    const plotTitle = title || "Isomap Geodesic Distance Matrix";
    return createHeatmap(result.geodesicDistances, width, height, plotTitle);
  }

  /**
   * Analyze Isomap results
   */
  static analyze(args: { result: IsomapResult }): IsomapAnalysis {
    const { result } = args;

    if (result.embedding.length === 0) {
      return {
        numSamples: 0,
        dimensions: 0,
        k: 0,
        graphNodes: 0,
        graphEdges: 0,
        averageDegree: 0,
        geodesicDistances: {
          min: 0,
          max: 0,
          mean: 0,
          median: 0,
        },
        executionTime: result.executionTime,
        error: result.error,
      };
    }

    const numSamples = result.embedding.length;
    const dimensions = result.embedding[0]?.length || 0;

    // Analyze graph
    const graphNodes = result.graph?.nodes || 0;
    const graphEdges = result.graph?.edges.length || 0;
    const averageDegree =
      graphNodes > 0 ? (2 * graphEdges) / graphNodes : 0;

    // Analyze geodesic distances
    let minDist = Infinity;
    let maxDist = -Infinity;
    let sumDist = 0;
    let countDist = 0;
    const distances: number[] = [];

    for (let i = 0; i < result.geodesicDistances.length; i++) {
      for (let j = i + 1; j < result.geodesicDistances[i].length; j++) {
        const dist = result.geodesicDistances[i][j];
        if (isFinite(dist) && dist >= 0) {
          minDist = Math.min(minDist, dist);
          maxDist = Math.max(maxDist, dist);
          sumDist += dist;
          countDist++;
          distances.push(dist);
        }
      }
    }

    distances.sort((a, b) => a - b);
    const medianDist =
      distances.length > 0
        ? distances.length % 2 === 0
          ? (distances[distances.length / 2 - 1] +
              distances[distances.length / 2]) /
            2
          : distances[Math.floor(distances.length / 2)]
        : 0;

    const meanDist = countDist > 0 ? sumDist / countDist : 0;

    // Extract k from config if available (we don't have direct access, so estimate from graph)
    const k = graphNodes > 0 ? Math.round(averageDegree) : 0;

    return {
      numSamples,
      dimensions,
      k,
      graphNodes,
      graphEdges,
      averageDegree,
      geodesicDistances: {
        min: minDist === Infinity ? 0 : minDist,
        max: maxDist === -Infinity ? 0 : maxDist,
        mean: meanDist,
        median: medianDist,
      },
      executionTime: result.executionTime,
      error: result.error,
    };
  }

  /**
   * Get comprehensive visualization with analysis
   */
  static visualize(args: {
    result: IsomapResult;
    width?: number;
    height?: number;
    title?: string;
    includeGraph?: boolean;
    includeDistances?: boolean;
  }): IsomapVisualization {
    const {
      result,
      width = 80,
      height = 24,
      title,
      includeGraph = false,
      includeDistances = false,
    } = args;

    const scatterPlot = IsomapTools.visualize2D({
      result,
      width,
      height,
      title,
    });
    const graphVisualization = includeGraph
      ? IsomapTools.visualizeGraph({
          result,
          width,
          height,
          title: title ? `${title} - Graph` : undefined,
        })
      : undefined;
    const distanceHeatmap = includeDistances
      ? IsomapTools.visualizeDistances({
          result,
          width,
          height,
          title: title ? `${title} - Distances` : undefined,
        })
      : undefined;
    const analysis = IsomapTools.analyze({ result });

    return {
      scatterPlot,
      graphVisualization,
      distanceHeatmap,
      analysis,
    };
  }
}

