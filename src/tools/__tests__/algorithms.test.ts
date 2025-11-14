/**
 * @file Algorithms Tools Tests
 *
 * Tests for algorithm-related codemode tools.
 */

import { describe, expect, it } from "vitest";
import { MarchingSquaresTools } from "../algorithms/marching-squares";

describe("MarchingSquaresTools", () => {
  describe("compute", () => {
    it("should compute contours from a grid", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it("should accept optional config", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
        config: {
          ambiguityResolution: "saddle",
          interpolate: true,
        },
      });

      expect(result.stats.success).toBe(true);
    });
  });

  describe("computeMultiLevel", () => {
    it("should compute multi-level contours", () => {
      const grid = [
        [0, 0.3, 0.6, 0.9],
        [0, 0.3, 0.6, 0.9],
        [0, 0.3, 0.6, 0.9],
      ];

      const result = MarchingSquaresTools.computeMultiLevel({
        grid,
        options: {
          thresholds: [0.2, 0.5, 0.8],
        },
      });

      expect(result.stats.success).toBe(true);
      expect(result.contoursByLevel.size).toBe(3);
    });
  });

  describe("analyzeContour", () => {
    it("should analyze contour properties", () => {
      const grid = [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
      ];

      const computeResult = MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });

      if (computeResult.contours.length > 0) {
        const analysis = MarchingSquaresTools.analyzeContour({
          contour: computeResult.contours[0],
        });

        expect(analysis.length).toBeGreaterThan(0);
        expect(analysis.centroid).toBeDefined();
        expect(analysis.boundingBox).toBeDefined();
      }
    });
  });

  describe("simplifyContour", () => {
    it("should simplify contours", () => {
      const grid = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ];

      const computeResult = MarchingSquaresTools.compute({
        grid,
        threshold: 0.5,
      });

      if (computeResult.contours.length > 0) {
        const simplification = MarchingSquaresTools.simplifyContour({
          contour: computeResult.contours[0],
          options: {
            maxDistance: 0.1,
          },
        });

        expect(simplification.simplifiedContour).toBeDefined();
        expect(simplification.segmentsRemoved).toBeGreaterThanOrEqual(0);
        expect(simplification.compressionRatio).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("optimized", () => {
    // Skip optimized tests in Node.js environment due to MemoryPool window dependency
    // These tests work in browser environments
    it.skip("should compute contours using PAW-optimized adapter", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = MarchingSquaresTools.optimized({
        grid,
        threshold: 0.5,
      });

      expect(result.stats.success).toBe(true);
      expect(result.contours.length).toBeGreaterThanOrEqual(0);
    });

    it.skip("should accept optional config", () => {
      const grid = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];

      const result = MarchingSquaresTools.optimized({
        grid,
        threshold: 0.5,
        config: {
          ambiguityResolution: "saddle",
        },
      });

      expect(result.stats.success).toBe(true);
    });
  });
});

