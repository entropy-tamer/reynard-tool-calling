/**
 * @file Algorithms Tools Registration
 *
 * Registers all algorithm-related tools with the registry.
 */

import { MarchingSquaresTools } from "../algorithms/marching-squares";
import { PCATools } from "../algorithms/pca";
import { MDSTools } from "../algorithms/mds";
import { IsomapTools } from "../algorithms/isomap";
import { FFTTools } from "../algorithms/fft";
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
      handler: createHandler(
        (args: {
          grid: number[][];
          threshold?: number;
          config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
        }) => MarchingSquaresTools.compute(args)
      ),
    },
    {
      config: {
        name: "marching_squares_compute_multi_level",
        description: "Compute multi-level contours for different threshold values",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          grid: number[][];
          options: Partial<import("@reynard/algorithms").MultiLevelContourOptions>;
          config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
        }) => MarchingSquaresTools.computeMultiLevel(args)
      ),
    },
    {
      config: {
        name: "marching_squares_analyze_contour",
        description: "Analyze a contour and compute various properties (length, area, centroid, bounding box)",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          contour: import("@reynard/algorithms").Contour;
          options?: Partial<import("@reynard/algorithms").ContourAnalysisOptions>;
          config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
        }) => MarchingSquaresTools.analyzeContour(args)
      ),
    },
    {
      config: {
        name: "marching_squares_simplify_contour",
        description: "Simplify a contour by removing unnecessary segments using Douglas-Peucker algorithm",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          contour: import("@reynard/algorithms").Contour;
          options?: Partial<import("@reynard/algorithms").ContourSimplificationOptions>;
          config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
        }) => MarchingSquaresTools.simplifyContour(args)
      ),
    },
    {
      config: {
        name: "marching_squares_optimized",
        description: "Compute contours using PAW-optimized adapter with automatic algorithm selection",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          grid: number[][];
          threshold?: number;
          config?: Partial<import("@reynard/algorithms").MarchingSquaresConfig>;
        }) => MarchingSquaresTools.optimized(args)
      ),
    },
    // PCA Tools
    {
      config: {
        name: "pca_fit_transform",
        description: "Fit PCA to data and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler(
        (args: { data: number[][]; options?: import("@entropy-tamer/reynard-algorithms").PCAOptions }) =>
          PCATools.fitTransform(args)
      ),
    },
    {
      config: {
        name: "pca_fit_transform_with_instance",
        description: "Fit PCA to data and store instance for later use",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          instanceId: string;
          data: number[][];
          options?: import("@entropy-tamer/reynard-algorithms").PCAOptions;
        }) => PCATools.fitTransformWithInstance(args)
      ),
    },
    {
      config: {
        name: "pca_transform",
        description: "Transform new data using a fitted PCA instance",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          instanceId: string;
          data: number[][];
          options?: import("@entropy-tamer/reynard-algorithms").PCAOptions;
        }) => PCATools.transform(args)
      ),
    },
    {
      config: {
        name: "pca_inverse_transform",
        description: "Reconstruct original data from transformed PCA data",
        enabled: true,
      },
      handler: createHandler((args: { instanceId: string; transformed: number[][] }) =>
        PCATools.inverseTransform(args)
      ),
    },
    {
      config: {
        name: "pca_visualize_2d",
        description: "Generate ASCII scatter plot of 2D PCA projection",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").PCAResult;
          width?: number;
          height?: number;
          title?: string;
        }) => PCATools.visualize2D(args)
      ),
    },
    {
      config: {
        name: "pca_visualize_variance",
        description: "Generate ASCII bar chart of explained variance",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").PCAResult;
          width?: number;
          height?: number;
          title?: string;
        }) => PCATools.visualizeVariance(args)
      ),
    },
    {
      config: {
        name: "pca_analyze",
        description: "Analyze PCA results and compute statistics",
        enabled: true,
      },
      handler: createHandler((args: { result: import("@entropy-tamer/reynard-algorithms").PCAResult }) =>
        PCATools.analyze(args)
      ),
    },
    {
      config: {
        name: "pca_visualize",
        description: "Get comprehensive PCA visualization with analysis",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").PCAResult;
          width?: number;
          height?: number;
          title?: string;
        }) => PCATools.visualize(args)
      ),
    },
    // MDS Tools
    {
      config: {
        name: "mds_fit_transform",
        description: "Fit MDS to distance matrix and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler(
        (args: { distanceMatrix: number[][]; options?: import("@entropy-tamer/reynard-algorithms").MDSOptions }) =>
          MDSTools.fitTransform(args)
      ),
    },
    {
      config: {
        name: "mds_visualize_2d",
        description: "Generate ASCII scatter plot of 2D MDS embedding",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").MDSResult;
          width?: number;
          height?: number;
          title?: string;
        }) => MDSTools.visualize2D(args)
      ),
    },
    {
      config: {
        name: "mds_visualize_stress",
        description: "Generate ASCII visualization of stress convergence",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").MDSResult;
          stressHistory?: number[];
          width?: number;
          height?: number;
          title?: string;
        }) => MDSTools.visualizeStress(args)
      ),
    },
    {
      config: {
        name: "mds_analyze",
        description: "Analyze MDS results and compute quality metrics",
        enabled: true,
      },
      handler: createHandler((args: { result: import("@entropy-tamer/reynard-algorithms").MDSResult }) =>
        MDSTools.analyze(args)
      ),
    },
    {
      config: {
        name: "mds_visualize",
        description: "Get comprehensive MDS visualization with analysis",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").MDSResult;
          stressHistory?: number[];
          width?: number;
          height?: number;
          title?: string;
        }) => MDSTools.visualize(args)
      ),
    },
    // Isomap Tools
    {
      config: {
        name: "isomap_fit_transform",
        description: "Fit Isomap to data and transform it to lower dimensions",
        enabled: true,
      },
      handler: createHandler(
        (args: { data: number[][]; options?: import("@entropy-tamer/reynard-algorithms").IsomapOptions }) =>
          IsomapTools.fitTransform(args)
      ),
    },
    {
      config: {
        name: "isomap_visualize_2d",
        description: "Generate ASCII scatter plot of 2D Isomap embedding",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
          width?: number;
          height?: number;
          title?: string;
        }) => IsomapTools.visualize2D(args)
      ),
    },
    {
      config: {
        name: "isomap_visualize_graph",
        description: "Generate ASCII visualization of k-NN graph structure",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
          width?: number;
          height?: number;
          title?: string;
        }) => IsomapTools.visualizeGraph(args)
      ),
    },
    {
      config: {
        name: "isomap_visualize_distances",
        description: "Generate ASCII heatmap of geodesic distance matrix",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
          width?: number;
          height?: number;
          title?: string;
        }) => IsomapTools.visualizeDistances(args)
      ),
    },
    {
      config: {
        name: "isomap_analyze",
        description: "Analyze Isomap results and compute graph metrics",
        enabled: true,
      },
      handler: createHandler((args: { result: import("@entropy-tamer/reynard-algorithms").IsomapResult }) =>
        IsomapTools.analyze(args)
      ),
    },
    {
      config: {
        name: "isomap_visualize",
        description: "Get comprehensive Isomap visualization with analysis",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").IsomapResult;
          width?: number;
          height?: number;
          title?: string;
          includeGraph?: boolean;
          includeDistances?: boolean;
        }) => IsomapTools.visualize(args)
      ),
    },
    // FFT Tools - Audio Analysis
    {
      config: {
        name: "fft_analyze_audio",
        description: "Analyze audio file with FFT and return frequency spectrum",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          filePath: string;
          windowSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.analyzeAudio(args)
      ),
    },
    {
      config: {
        name: "fft_audio_spectrum",
        description: "Get frequency spectrum of audio file with ASCII visualization",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          filePath: string;
          windowSize?: number;
          width?: number;
          height?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.audioSpectrum(args)
      ),
    },
    {
      config: {
        name: "fft_audio_spectrogram",
        description: "Generate time-frequency spectrogram from audio file",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          filePath: string;
          windowSize?: number;
          hopSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.audioSpectrogram(args)
      ),
    },
    {
      config: {
        name: "fft_audio_peaks",
        description: "Detect dominant frequency peaks in audio file",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          filePath: string;
          windowSize?: number;
          minMagnitude?: number;
          minDistance?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.audioPeaks(args)
      ),
    },
    {
      config: {
        name: "fft_audio_compare",
        description: "Compare frequency content of two audio files",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          filePath1: string;
          filePath2: string;
          windowSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.audioCompare(args)
      ),
    },
    // FFT Tools - Image Analysis
    {
      config: {
        name: "fft_analyze_image",
        description: "Analyze image file with 2D FFT (requires image library)",
        enabled: true,
      },
      handler: createHandler(
        (args: { filePath: string; config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig> }) =>
          FFTTools.analyzeImage(args)
      ),
    },
    // FFT Tools - Signal Processing
    {
      config: {
        name: "fft_analyze_signal",
        description: "Analyze arbitrary signal data with FFT",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          signal: number[];
          sampleRate?: number;
          windowSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.analyzeSignal(args)
      ),
    },
    {
      config: {
        name: "fft_filter_frequencies",
        description: "Filter specific frequency ranges from signal using FFT",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          signal: number[];
          lowCut?: number;
          highCut?: number;
          sampleRate?: number;
          windowSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.filterFrequencies(args)
      ),
    },
    {
      config: {
        name: "fft_denoise",
        description: "Remove noise from signal using frequency domain filtering",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          signal: number[];
          noiseThreshold?: number;
          sampleRate?: number;
          windowSize?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.denoise(args)
      ),
    },
    {
      config: {
        name: "fft_convolve",
        description: "Convolve two signals using FFT (fast convolution)",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          signal1: number[];
          signal2: number[];
          sampleRate?: number;
          config?: Partial<import("@entropy-tamer/reynard-algorithms").FFTConfig>;
        }) => FFTTools.convolve(args)
      ),
    },
    // FFT Tools - Visualization
    {
      config: {
        name: "fft_plot_spectrum",
        description: "Generate ASCII plot of frequency spectrum",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").FFTResult;
          width?: number;
          height?: number;
          title?: string;
        }) => FFTTools.plotSpectrum(args)
      ),
    },
    {
      config: {
        name: "fft_plot_spectrogram",
        description: "Generate ASCII heatmap of time-frequency spectrogram",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          spectrogram: import("../algorithms/fft").SpectrogramData;
          width?: number;
          height?: number;
          title?: string;
        }) => FFTTools.plotSpectrogram(args)
      ),
    },
    {
      config: {
        name: "fft_plot_waveform",
        description: "Plot time domain signal with optional frequency overlay",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          signal: number[];
          result?: import("@entropy-tamer/reynard-algorithms").FFTResult;
          sampleRate?: number;
          width?: number;
          height?: number;
          title?: string;
        }) => FFTTools.plotWaveform(args)
      ),
    },
    // FFT Tools - Analysis & Utilities
    {
      config: {
        name: "fft_find_peaks",
        description: "Find frequency peaks in FFT result",
        enabled: true,
      },
      handler: createHandler(
        (args: {
          result: import("@entropy-tamer/reynard-algorithms").FFTResult;
          minMagnitude?: number;
          minDistance?: number;
        }) => FFTTools.findPeaks(args)
      ),
    },
    {
      config: {
        name: "fft_bandpower",
        description: "Calculate power in specific frequency band",
        enabled: true,
      },
      handler: createHandler(
        (args: { result: import("@entropy-tamer/reynard-algorithms").FFTResult; lowFreq: number; highFreq: number }) =>
          FFTTools.bandpower(args)
      ),
    },
    {
      config: {
        name: "fft_centroid",
        description: "Calculate spectral centroid (brightness measure)",
        enabled: true,
      },
      handler: createHandler((args: { result: import("@entropy-tamer/reynard-algorithms").FFTResult }) =>
        FFTTools.centroid(args)
      ),
    },
    {
      config: {
        name: "fft_rolloff",
        description: "Calculate spectral rolloff frequency",
        enabled: true,
      },
      handler: createHandler(
        (args: { result: import("@entropy-tamer/reynard-algorithms").FFTResult; percentile?: number }) =>
          FFTTools.rolloff(args)
      ),
    },
    {
      config: {
        name: "fft_zero_crossing_rate",
        description: "Calculate zero crossing rate of signal",
        enabled: true,
      },
      handler: createHandler((args: { signal: number[] }) => FFTTools.zeroCrossingRate(args)),
    },
    {
      config: {
        name: "fft_mfcc",
        description: "Extract MFCC (Mel-frequency cepstral coefficients) features",
        enabled: true,
      },
      handler: createHandler(
        (args: { result: import("@entropy-tamer/reynard-algorithms").FFTResult; numCoefficients?: number }) =>
          FFTTools.mfcc(args)
      ),
    },
  ]);
}
