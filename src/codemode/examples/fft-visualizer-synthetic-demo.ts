/**
 * @file FFT Visualizer Demo (Synthetic Signals)
 *
 * Interactive FFT visualizations with terminal plots using synthetic signals
 * No audio file required - perfect for testing!
 *
 * Usage:
 * ```bash
 * pnpm fft-visualizer                    # Terminal output only
 * pnpm fft-visualizer --png              # Terminal + PNG export
 * pnpm fft-visualizer --txt              # Terminal + TXT export
 * pnpm fft-visualizer --png --txt        # Terminal + PNG + TXT export
 * ```
 */

/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */

import { codemode } from "../codemode.js";
import { resolve } from "path";

/**
 * Parse command line arguments
 *
 * @returns Object with png and txt flags
 * @example
 * ```ts
 * const { png, txt } = parseArgs();
 * ```
 */
function parseArgs(): { png: boolean; txt: boolean } {
  const args = process.argv.slice(2);
  return {
    png: args.includes("--png"),
    txt: args.includes("--txt"),
  };
}

/**
 * Main function to run FFT visualizer demos with synthetic signals
 *
 * @example
 * ```ts
 * await main();
 * ```
 */
async function main() {
  const { png, txt } = parseArgs();
  const cm = await codemode({ projectRoot: process.cwd() });

  console.log("🎵 FFT Visualizer Demo (Synthetic Signals)\n");
  console.log("=".repeat(80));
  console.log();

  const outputDir = resolve("/home/kade/Desktop/fft");

  try {
    // Demo 1: Pure Tone Analysis (440 Hz A4)
    console.log("📊 Demo 1: Pure Tone Analysis (440 Hz A4)");
    console.log("-".repeat(80));
    const toneAnalysis = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate 440 Hz sine wave
      const sampleRate = 44100;
      const duration = 0.5; // 500ms
      const frequency = 440; // A4 note
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        signal.push(Math.sin(2 * Math.PI * frequency * t));
      }
      
      const result = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 4096
      });
      
      const plot = FFTTools.plotSpectrum({
        result: result.result,
        width: 100,
        height: 30,
        title: "Pure Tone: 440 Hz (A4)"
      });
      
      return { result, plot };
    `);

    if (!toneAnalysis?.returned) {
      console.error("❌ Failed to get tone analysis result");
      console.error("Result:", JSON.stringify(toneAnalysis, null, 2));
      throw new Error("Tone analysis failed");
    }

    console.log(toneAnalysis.returned.plot);
    console.log();
    console.log("📈 Analysis Summary:");
    console.log("  • Expected Frequency: 440 Hz");
    console.log("  • Detected Frequency:", toneAnalysis.returned.result.peakFrequencies[0]?.toFixed(2) || "N/A", "Hz");
    console.log("  • Total Power:", toneAnalysis.returned.result.totalPower.toFixed(2));
    console.log("  • Execution Time:", toneAnalysis.returned.result.executionTime.toFixed(2), "ms");
    console.log("  • Top 5 Dominant Frequencies:");
    toneAnalysis.returned.result.dominantFrequencies.slice(0, 5).forEach((f: { frequency: number; magnitude: number }, i: number) => {
      console.log(`    ${i + 1}. ${f.frequency.toFixed(2)} Hz (magnitude: ${f.magnitude.toFixed(3)})`);
    });
    console.log();

    // Demo 2: Multi-Tone Signal (Chord)
    console.log("🎼 Demo 2: Multi-Tone Signal (C Major Chord)");
    console.log("-".repeat(80));
    const chordAnalysis = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate C Major chord: C4 (261.63), E4 (329.63), G4 (392.00)
      const sampleRate = 44100;
      const duration = 0.5;
      const frequencies = [261.63, 329.63, 392.00];
      const amplitudes = [1.0, 0.8, 0.6];
      
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        let value = 0;
        frequencies.forEach((freq, idx) => {
          value += amplitudes[idx] * Math.sin(2 * Math.PI * freq * t);
        });
        signal.push(value);
      }
      
      const result = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 4096
      });
      
      const plot = FFTTools.plotSpectrum({
        result: result.result,
        width: 100,
        height: 30,
        title: "C Major Chord (261.63, 329.63, 392.00 Hz)"
      });
      
      return { result, plot, frequencies, amplitudes };
    `);
    console.log(chordAnalysis.returned.plot);
    console.log();
    console.log("🎵 Chord Components:");
    chordAnalysis.returned.frequencies.forEach((freq: number, idx: number) => {
      const detected = chordAnalysis.returned.result.peakFrequencies.find((f: number) => Math.abs(f - freq) < 5);
      console.log(
        `  • ${freq.toFixed(2)} Hz (amplitude: ${chordAnalysis.returned.amplitudes[idx]}) - ${detected ? "✅ Detected" : "❌ Not detected"}`
      );
    });
    console.log();

    // Demo 3: Frequency Peaks Detection
    console.log("🔍 Demo 3: Frequency Peaks Detection");
    console.log("-".repeat(80));
    const peaksAnalysis = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate signal with multiple frequencies
      const sampleRate = 44100;
      const duration = 0.3;
      const frequencies = [440, 880, 1320, 2000];
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        let value = 0;
        frequencies.forEach(freq => {
          value += Math.sin(2 * Math.PI * freq * t);
        });
        signal.push(value);
      }
      
      const analysis = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 4096
      });
      
      const peaks = FFTTools.findPeaks({
        result: analysis.result,
        minMagnitude: 0.1,
        minDistance: 10
      });
      
      const plot = FFTTools.plotSpectrum({
        result: analysis.result,
        width: 100,
        height: 30,
        title: "Frequency Peaks Detection"
      });
      
      return { peaks, plot, analysis };
    `);
    console.log(peaksAnalysis.returned.plot);
    console.log();
    console.log("🎯 Peak Detection Results:");
    console.log("  • Total Peaks Found:", peaksAnalysis.returned.peaks.count);
    console.log("  • Top 10 Peaks:");
    peaksAnalysis.returned.peaks.peaks.slice(0, 10).forEach((p: { index: number; magnitude: number }, i: number) => {
      const freq = peaksAnalysis.returned.analysis.result.frequencies[p.index] || 0;
      console.log(`    ${i + 1}. ${freq.toFixed(2)} Hz (magnitude: ${p.magnitude.toFixed(4)})`);
    });
    console.log();

    // Demo 4: Waveform Visualization
    console.log("🌊 Demo 4: Waveform Visualization");
    console.log("-".repeat(80));
    const waveform = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate complex waveform
      const sampleRate = 44100;
      const duration = 0.1; // 100ms
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        // Mix of frequencies with different amplitudes
        signal.push(
          0.5 * Math.sin(2 * Math.PI * 440 * t) +
          0.3 * Math.sin(2 * Math.PI * 880 * t) +
          0.2 * Math.sin(2 * Math.PI * 1320 * t)
        );
      }
      
      const analysis = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 2048
      });
      
      const plot = FFTTools.plotWaveform({
        signal,
        result: analysis.result,
        sampleRate,
        width: 100,
        height: 30,
        title: "Waveform with Frequency Spectrum"
      });
      
      return { plot, analysis, signal, duration, sampleRate };
    `);
    console.log(waveform.returned.plot);
    console.log();
    console.log("📊 Waveform Info:");
    console.log("  • Samples:", waveform.returned.signal.length);
    console.log("  • Duration:", waveform.returned.duration.toFixed(3), "seconds");
    console.log("  • Sample Rate:", waveform.returned.sampleRate, "Hz");
    console.log();

    // Demo 5: Frequency Filtering (Bandpass)
    console.log("🔧 Demo 5: Frequency Filtering (Bandpass)");
    console.log("-".repeat(80));
    const filtering = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate signal with wide frequency range
      const sampleRate = 44100;
      const signal = [];
      for (let i = 0; i < 4410; i++) {
        const t = i / sampleRate;
        signal.push(
          Math.sin(2 * Math.PI * 440 * t) +   // 440 Hz
          Math.sin(2 * Math.PI * 1000 * t) +  // 1000 Hz
          Math.sin(2 * Math.PI * 5000 * t)    // 5000 Hz
        );
      }
      
      // Original spectrum
      const original = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 2048
      });
      
      // Filtered spectrum (800-2000 Hz bandpass)
      const filteredSignal = FFTTools.filterFrequencies({
        signal,
        lowCut: 800,
        highCut: 2000,
        sampleRate
      });
      
      const filteredAnalysis = FFTTools.analyzeSignal({
        signal: filteredSignal,
        sampleRate,
        windowSize: 2048
      });
      
      const originalPlot = FFTTools.plotSpectrum({
        result: original.result,
        width: 100,
        height: 20,
        title: "Original (440, 1000, 5000 Hz)"
      });
      
      const filteredPlot = FFTTools.plotSpectrum({
        result: filteredAnalysis.result,
        width: 100,
        height: 20,
        title: "Filtered (800-2000 Hz)"
      });
      
      return { original, filtered: filteredAnalysis, originalPlot, filteredPlot, signal, filteredSignal };
    `);
    console.log("Original Signal Spectrum:");
    console.log(filtering.returned.originalPlot);
    console.log();
    console.log("Filtered Signal Spectrum (800-2000 Hz bandpass):");
    console.log(filtering.returned.filteredPlot);
    console.log();
    console.log("🔍 Filtering Results:");
    console.log("  • Original signal length:", filtering.returned.signal.length);
    console.log("  • Filtered signal length:", filtering.returned.filteredSignal.length);
    console.log("  • Frequency components:");
    console.log(
      "    - 440 Hz:",
      filtering.returned.original.peakFrequencies.some((f: number) => Math.abs(f - 440) < 10)
        ? "✅ Present"
        : "❌ Removed"
    );
    console.log(
      "    - 1000 Hz:",
      filtering.returned.filtered.peakFrequencies.some((f: number) => Math.abs(f - 1000) < 10)
        ? "✅ Preserved"
        : "❌ Removed"
    );
    console.log(
      "    - 5000 Hz:",
      filtering.returned.filtered.peakFrequencies.some((f: number) => Math.abs(f - 5000) < 10)
        ? "✅ Present"
        : "❌ Removed"
    );
    console.log();

    // Demo 6: Spectrogram Simulation (Time-Frequency)
    console.log("📉 Demo 6: Spectrogram Simulation");
    console.log("-".repeat(80));
    const spectrogram = await cm.executeCode(`
      const { resolve } = await import("path");
      const { FFTTools } = await import(resolve(process.cwd(), "src/tools/algorithms/fft.js"));
      
      // Generate time-varying signal (frequency sweep)
      const sampleRate = 44100;
      const duration = 0.5;
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        // Frequency sweeps from 440 Hz to 2000 Hz
        const freq = 440 + (2000 - 440) * (t / duration);
        signal.push(Math.sin(2 * Math.PI * freq * t));
      }
      
      // Create spectrogram-like visualization by analyzing windows
      const windowSize = 2048;
      const hopSize = 512;
      const timeBins = [];
      const magnitude = [];
      
      for (let start = 0; start < signal.length - windowSize; start += hopSize) {
        const window = signal.slice(start, start + windowSize);
        const analysis = FFTTools.analyzeSignal({
          signal: window,
          sampleRate,
          windowSize
        });
        
        // Only positive frequencies
        const halfSize = Math.floor(analysis.result.magnitude.length / 2);
        magnitude.push(Array.from(analysis.result.magnitude).slice(0, halfSize));
        timeBins.push(start / sampleRate);
      }
      
      // Get frequency bins from first analysis
      const firstAnalysis = FFTTools.analyzeSignal({
        signal: signal.slice(0, windowSize),
        sampleRate,
        windowSize
      });
      const frequencyBins = Array.from(firstAnalysis.result.frequencies).slice(0, Math.floor(firstAnalysis.result.frequencies.length / 2));
      
      const spectrogramData = {
        timeBins,
        frequencyBins,
        magnitude,
        sampleRate
      };
      
      const plot = FFTTools.plotSpectrogram({
        spectrogram: spectrogramData,
        width: 100,
        height: 40,
        title: "Frequency Sweep Spectrogram (440-2000 Hz)"
      });
      
      return { spectrogram: spectrogramData, plot };
    `);
    console.log(spectrogram.returned.plot);
    console.log();
    console.log("⏱️  Spectrogram Info:");
    console.log("  • Time Bins:", spectrogram.returned.spectrogram.timeBins.length);
    console.log("  • Frequency Bins:", spectrogram.returned.spectrogram.frequencyBins.length);
    console.log(
      "  • Duration:",
      spectrogram.returned.spectrogram.timeBins[spectrogram.returned.spectrogram.timeBins.length - 1]?.toFixed(3) ||
        "0",
      "seconds"
    );
    console.log(
      "  • Frequency Range: 0 -",
      spectrogram.returned.spectrogram.frequencyBins[
        spectrogram.returned.spectrogram.frequencyBins.length - 1
      ]?.toFixed(0) || "0",
      "Hz"
    );
    console.log();

    // Export visualizations if requested
    if (png || txt) {
      console.log("💾 Exporting visualizations...");
      console.log("-".repeat(80));

      const visualizations = [
        { name: "pure_tone_440hz", asciiArt: toneAnalysis.returned.plot },
        { name: "c_major_chord", asciiArt: chordAnalysis.returned.plot },
        { name: "frequency_peaks", asciiArt: peaksAnalysis.returned.plot },
        { name: "waveform", asciiArt: waveform.returned.plot },
        { name: "filtering_original", asciiArt: filtering.returned.originalPlot },
        { name: "filtering_filtered", asciiArt: filtering.returned.filteredPlot },
        { name: "spectrogram", asciiArt: spectrogram.returned.plot },
      ];

      // Export to TXT files
      if (txt) {
        try {
          const { writeFile, mkdir } = await import("fs/promises");
          await mkdir(outputDir, { recursive: true });

          for (const viz of visualizations) {
            const txtPath = resolve(outputDir, `${viz.name}.txt`);
            await writeFile(txtPath, viz.asciiArt, "utf-8");
            console.log(`✅ Saved: ${txtPath}`);
          }
          console.log();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("❌ Failed to save TXT files:", errorMessage);
          console.log();
        }
      }

      // Export to PNG files
      if (png) {
        try {
          await cm.executeCode(`
            const { resolve } = await import("path");
            const { exportMultipleToPNG } = await import(resolve(process.cwd(), "src/tools/algorithms/png-export.js"));
            
            const visualizations = ${JSON.stringify(visualizations)};
            const outputDir = ${JSON.stringify(outputDir)};
            const paths = await exportMultipleToPNG(visualizations, outputDir, {
              fontSize: 10,
              backgroundColor: "#000000",
              textColor: "#00ff00",
              scale: 2
            });
            
            console.log("✅ Exported", paths.length, "PNG visualizations:");
            paths.forEach((path, i) => {
              console.log(\`  \${i+1}. \${path}\`);
            });
          `);
          console.log();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log("⚠️  PNG export not available:", errorMessage);
          console.log("   Install 'canvas' package to enable PNG export:");
          console.log("   pnpm add canvas");
          console.log();
        }
      }
    }

    console.log("=".repeat(80));
    console.log("🎉 All FFT visualizations complete!");
    if (png || txt) {
      console.log();
      console.log("📁 Visualizations saved to:", outputDir);
      if (png) console.log("   • PNG files exported");
      if (txt) console.log("   • TXT files exported");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    cm.cleanup();
  }
}

main().catch(console.error);
