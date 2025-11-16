/**
 * @file FFT Tools
 *
 * Comprehensive FFT analysis tools for audio files, images, and signals.
 * Leverages the FFT algorithms from @entropy-tamer/reynard-algorithms.
 */

import { FFTFactory, Radix2FFT, type FFTConfig, type FFTResult } from "@entropy-tamer/reynard-algorithms";
import { createScatterPlot, createBarChart, createHeatmap } from "./visualization-utils";
import { readFile } from "fs/promises";
import { resolve, extname } from "path";

/**
 * Audio file metadata
 */
export interface AudioFileInfo {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  duration: number;
  samples: Float32Array;
  format: string;
}

/**
 * Image file metadata
 */
export interface ImageFileInfo {
  width: number;
  height: number;
  pixels: number[][]; // Grayscale pixel values (0-255)
  format: string;
}

/**
 * FFT analysis result
 */
export interface FFTAnalysis {
  result: FFTResult;
  dominantFrequencies: Array<{ frequency: number; magnitude: number }>;
  peakFrequencies: number[];
  totalPower: number;
  executionTime: number;
}

/**
 * Spectrogram data
 */
export interface SpectrogramData {
  timeBins: number[];
  frequencyBins: number[];
  magnitude: number[][]; // [time][frequency]
  sampleRate: number;
}

/**
 * Peak detection result
 */
export interface PeakDetectionResult {
  peaks: Array<{ frequency: number; magnitude: number; index: number }>;
  count: number;
}

/**
 * Audio file reading utilities
 */
export class AudioFileReader {
  /**
   * Read WAV file and extract audio samples
   */
  static async readWAV(filePath: string): Promise<AudioFileInfo> {
    const resolvedPath = resolve(filePath);
    const buffer = await readFile(resolvedPath);

    // Parse WAV header
    const riff = buffer.toString("ascii", 0, 4);
    if (riff !== "RIFF") {
      throw new Error("Invalid WAV file: missing RIFF header");
    }

    const wave = buffer.toString("ascii", 8, 12);
    if (wave !== "WAVE") {
      throw new Error("Invalid WAV file: missing WAVE header");
    }

    // Find fmt chunk
    let fmtOffset = 12;
    let fmtChunkFound = false;

    while (fmtOffset < buffer.length - 8) {
      const chunkId = buffer.toString("ascii", fmtOffset, fmtOffset + 4);
      const chunkSize = buffer.readUInt32LE(fmtOffset + 4);

      if (chunkId === "fmt ") {
        fmtChunkFound = true;
        break;
      }

      fmtOffset += 8 + chunkSize;
    }

    if (!fmtChunkFound) {
      throw new Error("Invalid WAV file: missing fmt chunk");
    }

    // Read format information
    const audioFormat = buffer.readUInt16LE(fmtOffset + 8);
    const numChannels = buffer.readUInt16LE(fmtOffset + 10);
    const sampleRate = buffer.readUInt32LE(fmtOffset + 12);
    const byteRate = buffer.readUInt32LE(fmtOffset + 16);
    const blockAlign = buffer.readUInt16LE(fmtOffset + 20);
    const bitsPerSample = buffer.readUInt16LE(fmtOffset + 22);

    // Find data chunk
    let dataOffset = fmtOffset + 8 + buffer.readUInt32LE(fmtOffset + 4);
    let dataChunkFound = false;
    let dataSize = 0;

    while (dataOffset < buffer.length - 8) {
      const chunkId = buffer.toString("ascii", dataOffset, dataOffset + 4);
      const chunkSize = buffer.readUInt32LE(dataOffset + 4);

      if (chunkId === "data") {
        dataChunkFound = true;
        dataSize = chunkSize;
        break;
      }

      dataOffset += 8 + chunkSize;
    }

    if (!dataChunkFound) {
      throw new Error("Invalid WAV file: missing data chunk");
    }

    const dataStart = dataOffset + 8;
    const numSamples = dataSize / (bitsPerSample / 8) / numChannels;
    const duration = numSamples / sampleRate;

    // Read audio samples
    const samples = new Float32Array(numSamples);
    const bytesPerSample = bitsPerSample / 8;

    for (let i = 0; i < numSamples; i++) {
      let sample = 0;

      if (bitsPerSample === 8) {
        sample = (buffer.readUInt8(dataStart + i * numChannels * bytesPerSample) - 128) / 128;
      } else if (bitsPerSample === 16) {
        sample = buffer.readInt16LE(dataStart + i * numChannels * bytesPerSample) / 32768;
      } else if (bitsPerSample === 24) {
        const byte1 = buffer.readUInt8(dataStart + i * numChannels * bytesPerSample);
        const byte2 = buffer.readUInt8(dataStart + i * numChannels * bytesPerSample + 1);
        const byte3 = buffer.readUInt8(dataStart + i * numChannels * bytesPerSample + 2);
        const int24 = (byte3 << 16) | (byte2 << 8) | byte1;
        sample = (int24 > 0x7fffff ? int24 - 0x1000000 : int24) / 8388608;
      } else if (bitsPerSample === 32) {
        sample = buffer.readInt32LE(dataStart + i * numChannels * bytesPerSample) / 2147483648;
      } else {
        throw new Error(`Unsupported bit depth: ${bitsPerSample}`);
      }

      // For stereo, use left channel or average
      if (numChannels > 1) {
        let sum = sample;
        for (let c = 1; c < numChannels; c++) {
          let channelSample = 0;
          if (bitsPerSample === 8) {
            channelSample = (buffer.readUInt8(dataStart + (i * numChannels + c) * bytesPerSample) - 128) / 128;
          } else if (bitsPerSample === 16) {
            channelSample = buffer.readInt16LE(dataStart + (i * numChannels + c) * bytesPerSample) / 32768;
          }
          sum += channelSample;
        }
        samples[i] = sum / numChannels;
      } else {
        samples[i] = sample;
      }
    }

    return {
      sampleRate,
      channels: numChannels,
      bitDepth: bitsPerSample,
      duration,
      samples,
      format: "WAV",
    };
  }

  /**
   * Read audio file (supports WAV, attempts others)
   */
  static async readAudio(filePath: string): Promise<AudioFileInfo> {
    const ext = extname(filePath).toLowerCase();

    if (ext === ".wav") {
      return AudioFileReader.readWAV(filePath);
    }

    // For other formats, note limitation
    throw new Error(
      `Unsupported audio format: ${ext}. Only WAV files are currently supported. For MP3/other formats, use external decoding libraries.`
    );
  }
}

/**
 * Image file reading utilities
 */
export class ImageFileReader {
  /**
   * Read image file and convert to grayscale
   * Note: This is a basic implementation. For production, use sharp or jimp.
   */
  static async readImage(filePath: string): Promise<ImageFileInfo> {
    const resolvedPath = resolve(filePath);
    const ext = extname(filePath).toLowerCase();

    // For now, we'll implement basic PNG/BMP reading
    // In production, use a library like sharp
    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".bmp") {
      // Basic implementation - would need actual image parsing
      // For now, throw informative error
      throw new Error(
        `Image reading requires an image processing library. Please install 'sharp' or 'jimp' for full image support. Format: ${ext}`
      );
    }

    throw new Error(`Unsupported image format: ${ext}`);
  }

  /**
   * Convert RGB image data to grayscale
   */
  static rgbToGrayscale(rgbData: Uint8Array, width: number, height: number): number[][] {
    const grayscale: number[][] = [];

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 3;
        const r = rgbData[idx] || 0;
        const g = rgbData[idx + 1] || 0;
        const b = rgbData[idx + 2] || 0;
        // Luminance formula
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        row.push(gray);
      }
      grayscale.push(row);
    }

    return grayscale;
  }
}

/**
 * FFT Tools class
 */
export class FFTTools {
  private static fftInstances: Map<string, Radix2FFT> = new Map();

  /**
   * Get or create FFT instance
   */
  private static getFFT(size: number, config?: Partial<FFTConfig>): Radix2FFT {
    const key = `${size}-${JSON.stringify(config)}`;
    let fft = FFTTools.fftInstances.get(key);

    if (!fft) {
      const fftConfig: FFTConfig = {
        size,
        algorithm: config?.algorithm,
        normalize: config?.normalize ?? false,
        sampleRate: config?.sampleRate ?? 44100,
        ...config,
      };
      fft = FFTFactory.createAuto(size, fftConfig) as Radix2FFT;
      FFTTools.fftInstances.set(key, fft);
    }

    return fft;
  }

  /**
   * Analyze audio file with FFT
   */
  static async analyzeAudio(args: {
    filePath: string;
    windowSize?: number;
    config?: Partial<FFTConfig>;
  }): Promise<FFTAnalysis> {
    const { filePath, windowSize, config } = args;

    // Read audio file
    const audioInfo = await AudioFileReader.readAudio(filePath);

    // Use window size or default to power-of-2 size
    let fftSize = windowSize || 1024;
    if (fftSize > audioInfo.samples.length) {
      fftSize = Math.pow(2, Math.floor(Math.log2(audioInfo.samples.length)));
    }

    // Ensure power of 2
    fftSize = Math.pow(2, Math.floor(Math.log2(fftSize)));

    // Extract window of samples
    const window = audioInfo.samples.slice(0, Math.min(fftSize, audioInfo.samples.length));
    const paddedWindow = new Float32Array(fftSize);
    paddedWindow.set(window);

    // Perform FFT
    const fft = FFTTools.getFFT(fftSize, {
      ...config,
      sampleRate: audioInfo.sampleRate,
    });

    const startTime = performance.now();
    const result = fft.forward(paddedWindow);
    const executionTime = performance.now() - startTime;

    // Find dominant frequencies
    const peaks = FFTTools.findPeaks({
      result,
      minMagnitude: 0.1,
      minDistance: 10,
    });

    const dominantFrequencies = peaks.peaks
      .slice(0, 10)
      .map(p => ({
        frequency: result.frequencies[p.index] || 0,
        magnitude: p.magnitude,
      }))
      .sort((a, b) => b.magnitude - a.magnitude);

    const totalPower = Array.from(result.power).reduce((sum, p) => sum + p, 0);

    return {
      result,
      dominantFrequencies,
      peakFrequencies: peaks.peaks.map(p => result.frequencies[p.index] || 0),
      totalPower,
      executionTime,
    };
  }

  /**
   * Get audio spectrum with visualization
   */
  static async audioSpectrum(args: {
    filePath: string;
    windowSize?: number;
    width?: number;
    height?: number;
    config?: Partial<FFTConfig>;
  }): Promise<{
    analysis: FFTAnalysis;
    plot: string;
  }> {
    const { filePath, windowSize, width = 80, height = 24, config } = args;

    const analysis = await FFTTools.analyzeAudio({ filePath, windowSize, config });

    // Create spectrum plot
    const plot = FFTTools.plotSpectrum({
      result: analysis.result,
      width,
      height,
      title: `Audio Spectrum: ${filePath}`,
    });

    return {
      analysis,
      plot,
    };
  }

  /**
   * Generate audio spectrogram
   */
  static async audioSpectrogram(args: {
    filePath: string;
    windowSize?: number;
    hopSize?: number;
    config?: Partial<FFTConfig>;
  }): Promise<SpectrogramData> {
    const { filePath, windowSize = 2048, hopSize, config } = args;

    const audioInfo = await AudioFileReader.readAudio(filePath);
    const hop = hopSize || Math.floor(windowSize / 4);

    // Ensure window size is power of 2
    const fftSize = Math.pow(2, Math.floor(Math.log2(windowSize)));

    const timeBins: number[] = [];
    const magnitude: number[][] = [];
    const fft = FFTTools.getFFT(fftSize, {
      ...config,
      sampleRate: audioInfo.sampleRate,
    });

    for (let start = 0; start < audioInfo.samples.length - fftSize; start += hop) {
      const window = audioInfo.samples.slice(start, start + fftSize);
      const paddedWindow = new Float32Array(fftSize);
      paddedWindow.set(window);

      const result = fft.forward(paddedWindow);
      magnitude.push(Array.from(result.magnitude));

      const time = start / audioInfo.sampleRate;
      timeBins.push(time);
    }

    // Get frequency bins from first FFT result
    const firstFFT = fft.forward(new Float32Array(fftSize));
    const frequencyBins = Array.from(firstFFT.frequencies);

    return {
      timeBins,
      frequencyBins,
      magnitude,
      sampleRate: audioInfo.sampleRate,
    };
  }

  /**
   * Detect peaks in audio
   */
  static async audioPeaks(args: {
    filePath: string;
    windowSize?: number;
    minMagnitude?: number;
    minDistance?: number;
    config?: Partial<FFTConfig>;
  }): Promise<PeakDetectionResult> {
    const { filePath, windowSize, minMagnitude = 0.1, minDistance = 10, config } = args;

    const analysis = await FFTTools.analyzeAudio({ filePath, windowSize, config });

    const peaks = FFTTools.findPeaks({
      result: analysis.result,
      minMagnitude,
      minDistance,
    });

    return peaks;
  }

  /**
   * Compare two audio files
   */
  static async audioCompare(args: {
    filePath1: string;
    filePath2: string;
    windowSize?: number;
    config?: Partial<FFTConfig>;
  }): Promise<{
    similarity: number;
    differences: Array<{ frequency: number; diff: number }>;
    analysis1: FFTAnalysis;
    analysis2: FFTAnalysis;
  }> {
    const { filePath1, filePath2, windowSize, config } = args;

    const analysis1 = await FFTTools.analyzeAudio({ filePath1, windowSize, config });
    const analysis2 = await FFTTools.analyzeAudio({ filePath2, windowSize, config });

    // Compare magnitude spectra
    const minSize = Math.min(analysis1.result.magnitude.length, analysis2.result.magnitude.length);
    let sumSquaredDiff = 0;
    let sumSquared1 = 0;
    const differences: Array<{ frequency: number; diff: number }> = [];

    for (let i = 0; i < minSize; i++) {
      const mag1 = analysis1.result.magnitude[i] || 0;
      const mag2 = analysis2.result.magnitude[i] || 0;
      const diff = Math.abs(mag1 - mag2);
      sumSquaredDiff += diff * diff;
      sumSquared1 += mag1 * mag1;

      if (diff > 0.01) {
        differences.push({
          frequency: analysis1.result.frequencies[i] || 0,
          diff,
        });
      }
    }

    const similarity = 1 - Math.sqrt(sumSquaredDiff / sumSquared1);
    differences.sort((a, b) => b.diff - a.diff);

    return {
      similarity: Math.max(0, Math.min(1, similarity)),
      differences: differences.slice(0, 20),
      analysis1,
      analysis2,
    };
  }

  /**
   * Analyze image with 2D FFT
   */
  static async analyzeImage(args: { filePath: string; config?: Partial<FFTConfig> }): Promise<{
    result: FFTResult;
    width: number;
    height: number;
    executionTime: number;
  }> {
    // Note: Full image reading requires image library
    // For now, return informative error
    throw new Error(
      "Image analysis requires an image processing library. Please install 'sharp' or 'jimp'. The image file path was: " +
        args.filePath
    );
  }

  /**
   * Analyze signal data
   */
  static analyzeSignal(args: {
    signal: number[];
    sampleRate?: number;
    windowSize?: number;
    config?: Partial<FFTConfig>;
  }): FFTAnalysis {
    const { signal, sampleRate = 44100, windowSize, config } = args;

    let fftSize = windowSize || 1024;
    if (fftSize > signal.length) {
      fftSize = Math.pow(2, Math.floor(Math.log2(signal.length)));
    }

    fftSize = Math.pow(2, Math.floor(Math.log2(fftSize)));

    const window = signal.slice(0, Math.min(fftSize, signal.length));
    const paddedWindow = new Float32Array(fftSize);
    for (let i = 0; i < window.length; i++) {
      paddedWindow[i] = window[i] || 0;
    }

    const fft = FFTTools.getFFT(fftSize, {
      ...config,
      sampleRate,
    });

    const startTime = performance.now();
    const result = fft.forward(paddedWindow);
    const executionTime = performance.now() - startTime;

    const peaks = FFTTools.findPeaks({
      result,
      minMagnitude: 0.1,
      minDistance: 10,
    });

    const dominantFrequencies = peaks.peaks
      .slice(0, 10)
      .map(p => ({
        frequency: result.frequencies[p.index] || 0,
        magnitude: p.magnitude,
      }))
      .sort((a, b) => b.magnitude - a.magnitude);

    const totalPower = Array.from(result.power).reduce((sum, p) => sum + p, 0);

    return {
      result,
      dominantFrequencies,
      peakFrequencies: peaks.peaks.map(p => result.frequencies[p.index] || 0),
      totalPower,
      executionTime,
    };
  }

  /**
   * Filter frequencies from signal
   */
  static filterFrequencies(args: {
    signal: number[];
    lowCut?: number;
    highCut?: number;
    sampleRate?: number;
    windowSize?: number;
    config?: Partial<FFTConfig>;
  }): number[] {
    const { signal, lowCut, highCut, sampleRate = 44100, windowSize, config } = args;

    const analysis = FFTTools.analyzeSignal({
      signal,
      sampleRate,
      windowSize,
      config,
    });

    // Create filtered frequency domain
    const filteredReal = new Float32Array(analysis.result.real);
    const filteredImag = new Float32Array(analysis.result.imag);

    for (let i = 0; i < analysis.result.frequencies.length; i++) {
      const freq = analysis.result.frequencies[i] || 0;

      if (lowCut !== undefined && freq < lowCut) {
        filteredReal[i] = 0;
        filteredImag[i] = 0;
      }

      if (highCut !== undefined && freq > highCut) {
        filteredReal[i] = 0;
        filteredImag[i] = 0;
      }
    }

    // Inverse FFT
    const fft = FFTTools.getFFT(analysis.result.real.length, {
      ...config,
      sampleRate,
    });

    const inverseResult = fft.inverse(filteredReal, filteredImag);

    // Scale and return
    const scale = analysis.result.real.length;
    return Array.from(inverseResult.real).map(v => v / scale);
  }

  /**
   * Denoise signal using frequency domain filtering
   */
  static denoise(args: {
    signal: number[];
    noiseThreshold?: number;
    sampleRate?: number;
    windowSize?: number;
    config?: Partial<FFTConfig>;
  }): number[] {
    const { signal, noiseThreshold = 0.05, sampleRate = 44100, windowSize, config } = args;

    const analysis = FFTTools.analyzeSignal({
      signal,
      sampleRate,
      windowSize,
      config,
    });

    // Find maximum magnitude
    const maxMagnitude = Math.max(...Array.from(analysis.result.magnitude));

    // Filter out frequencies below threshold
    const filteredReal = new Float32Array(analysis.result.real);
    const filteredImag = new Float32Array(analysis.result.imag);

    for (let i = 0; i < analysis.result.magnitude.length; i++) {
      if ((analysis.result.magnitude[i] || 0) < maxMagnitude * noiseThreshold) {
        filteredReal[i] = 0;
        filteredImag[i] = 0;
      }
    }

    // Inverse FFT
    const fft = FFTTools.getFFT(analysis.result.real.length, {
      ...config,
      sampleRate,
    });

    const inverseResult = fft.inverse(filteredReal, filteredImag);

    const scale = analysis.result.real.length;
    return Array.from(inverseResult.real).map(v => v / scale);
  }

  /**
   * Convolve two signals using FFT
   */
  static convolve(args: {
    signal1: number[];
    signal2: number[];
    sampleRate?: number;
    config?: Partial<FFTConfig>;
  }): number[] {
    const { signal1, signal2, sampleRate = 44100, config } = args;

    // Pad signals to same length (power of 2)
    const maxLength = Math.max(signal1.length, signal2.length);
    const fftSize = Math.pow(2, Math.ceil(Math.log2(maxLength + signal2.length - 1)));

    const padded1 = new Float32Array(fftSize);
    const padded2 = new Float32Array(fftSize);

    for (let i = 0; i < signal1.length; i++) {
      padded1[i] = signal1[i] || 0;
    }
    for (let i = 0; i < signal2.length; i++) {
      padded2[i] = signal2[i] || 0;
    }

    // FFT of both signals
    const fft = FFTTools.getFFT(fftSize, { ...config, sampleRate });

    const fft1 = fft.forward(padded1);
    const fft2 = fft.forward(padded2);

    // Multiply in frequency domain
    const productReal = new Float32Array(fftSize);
    const productImag = new Float32Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      const r1 = fft1.real[i] || 0;
      const i1 = fft1.imag[i] || 0;
      const r2 = fft2.real[i] || 0;
      const i2 = fft2.imag[i] || 0;

      productReal[i] = r1 * r2 - i1 * i2;
      productImag[i] = r1 * i2 + i1 * r2;
    }

    // Inverse FFT
    const result = fft.inverse(productReal, productImag);

    // Extract valid portion and scale
    const outputLength = signal1.length + signal2.length - 1;
    const scale = fftSize;
    return Array.from(result.real)
      .slice(0, outputLength)
      .map(v => v / scale);
  }

  /**
   * Plot frequency spectrum
   */
  static plotSpectrum(args: { result: FFTResult; width?: number; height?: number; title?: string }): string {
    const { result, width = 80, height = 24, title } = args;

    // Create points for plot (frequency vs magnitude)
    const points: number[][] = [];
    const maxFreq = Math.min(20000, Math.max(...Array.from(result.frequencies))); // Limit to 20kHz for readability

    for (let i = 0; i < result.frequencies.length; i++) {
      const freq = result.frequencies[i] || 0;
      if (freq <= maxFreq) {
        points.push([freq, result.magnitude[i] || 0]);
      }
    }

    return createScatterPlot(points, width, height, title || "Frequency Spectrum");
  }

  /**
   * Plot spectrogram
   */
  static plotSpectrogram(args: {
    spectrogram: SpectrogramData;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { spectrogram, width = 80, height = 24, title } = args;

    return createHeatmap(spectrogram.magnitude, width, height, title || "Spectrogram");
  }

  /**
   * Plot waveform with frequency overlay
   */
  static plotWaveform(args: {
    signal: number[];
    result?: FFTResult;
    sampleRate?: number;
    width?: number;
    height?: number;
    title?: string;
  }): string {
    const { signal, result, sampleRate = 44100, width = 80, height = 24, title } = args;

    // Create time domain plot
    const timePoints: number[][] = [];
    const dt = 1 / sampleRate;

    for (let i = 0; i < signal.length; i++) {
      timePoints.push([i * dt, signal[i] || 0]);
    }

    let plot = createScatterPlot(timePoints, width, height, title || "Waveform");

    if (result) {
      plot += "\n\nFrequency Spectrum:\n";
      plot += FFTTools.plotSpectrum({ result, width, height });
    }

    return plot;
  }

  /**
   * Find peaks in FFT result
   */
  static findPeaks(args: { result: FFTResult; minMagnitude?: number; minDistance?: number }): PeakDetectionResult {
    const { result, minMagnitude = 0.1, minDistance = 10 } = args;

    const peaks: Array<{ frequency: number; magnitude: number; index: number }> = [];
    const magnitudes = Array.from(result.magnitude);

    for (let i = 1; i < magnitudes.length - 1; i++) {
      const mag = magnitudes[i] || 0;
      const prevMag = magnitudes[i - 1] || 0;
      const nextMag = magnitudes[i + 1] || 0;

      if (mag > minMagnitude && mag > prevMag && mag > nextMag) {
        // Check distance from existing peaks
        const tooClose = peaks.some(p => Math.abs(p.index - i) < minDistance);

        if (!tooClose) {
          peaks.push({
            frequency: result.frequencies[i] || 0,
            magnitude: mag,
            index: i,
          });
        }
      }
    }

    peaks.sort((a, b) => b.magnitude - a.magnitude);

    return {
      peaks,
      count: peaks.length,
    };
  }

  /**
   * Calculate power in frequency band
   */
  static bandpower(args: { result: FFTResult; lowFreq: number; highFreq: number }): number {
    const { result, lowFreq, highFreq } = args;

    let power = 0;

    for (let i = 0; i < result.frequencies.length; i++) {
      const freq = result.frequencies[i] || 0;
      if (freq >= lowFreq && freq <= highFreq) {
        power += result.power[i] || 0;
      }
    }

    return power;
  }

  /**
   * Calculate spectral centroid
   */
  static centroid(args: { result: FFTResult }): number {
    const { result } = args;

    let weightedSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < result.frequencies.length; i++) {
      const freq = result.frequencies[i] || 0;
      const mag = result.magnitude[i] || 0;
      weightedSum += freq * mag;
      magnitudeSum += mag;
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  /**
   * Calculate spectral rolloff
   */
  static rolloff(args: { result: FFTResult; percentile?: number }): number {
    const { result, percentile = 0.85 } = args;

    const totalPower = Array.from(result.power).reduce((sum, p) => sum + p, 0);
    const targetPower = totalPower * percentile;

    let cumulativePower = 0;

    for (let i = 0; i < result.power.length; i++) {
      cumulativePower += result.power[i] || 0;
      if (cumulativePower >= targetPower) {
        return result.frequencies[i] || 0;
      }
    }

    return result.frequencies[result.frequencies.length - 1] || 0;
  }

  /**
   * Calculate zero crossing rate
   */
  static zeroCrossingRate(args: { signal: number[] }): number {
    const { signal } = args;

    if (signal.length < 2) return 0;

    let crossings = 0;

    for (let i = 1; i < signal.length; i++) {
      const prev = signal[i - 1] || 0;
      const curr = signal[i] || 0;

      if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
        crossings++;
      }
    }

    return crossings / (signal.length - 1);
  }

  /**
   * Extract MFCC features (simplified version)
   */
  static mfcc(args: { result: FFTResult; numCoefficients?: number }): number[] {
    const { result, numCoefficients = 13 } = args;

    // Simplified MFCC - in production, use proper mel filter bank
    const coefficients: number[] = [];

    // Use log magnitude spectrum
    const logMagnitude = Array.from(result.magnitude).map(m => Math.log10(m + 1e-10));

    // Simple DCT-like transformation
    for (let c = 0; c < numCoefficients; c++) {
      let sum = 0;
      for (let i = 0; i < logMagnitude.length; i++) {
        sum += logMagnitude[i] * Math.cos((Math.PI * c * (i + 0.5)) / logMagnitude.length);
      }
      coefficients.push(sum);
    }

    return coefficients;
  }
}
