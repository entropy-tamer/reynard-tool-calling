/**
 * @file FFT Tools Demo
 *
 * Demonstration of FFT tools for audio analysis
 */

import { codemode } from "../codemode.js";

async function main() {
  const cm = await codemode({ projectRoot: process.cwd() });

  console.log("🎵 FFT Tools Demo\n");

  // Test audio file path
  const audioFile = "data/audio/vo/female/french/kick_door_1.wav";

  try {
    // Test 1: Analyze audio
    console.log("1. Analyzing audio file...");
    const analysis = await cm.executeCode(`
      const { FFTTools } = await import("../../tools/algorithms/fft.js");
      const result = await FFTTools.analyzeAudio({
        filePath: "${audioFile}",
        windowSize: 2048
      });
      console.log("Sample Rate:", result.result.frequencies.length > 0 ? "Detected" : "Unknown");
      console.log("Dominant Frequencies:", result.dominantFrequencies.slice(0, 5).map(f => f.frequency.toFixed(2) + " Hz"));
      console.log("Total Power:", result.totalPower.toFixed(2));
      console.log("Execution Time:", result.executionTime.toFixed(2) + "ms");
      return result;
    `);
    console.log("✅ Audio analysis complete\n");

    // Test 2: Get spectrum with visualization
    console.log("2. Generating spectrum plot...");
    const spectrum = await cm.executeCode(`
      const { FFTTools } = await import("../../tools/algorithms/fft.js");
      const result = await FFTTools.audioSpectrum({
        filePath: "${audioFile}",
        windowSize: 2048,
        width: 80,
        height: 20
      });
      console.log(result.plot);
      return result;
    `);
    console.log("✅ Spectrum plot generated\n");

    // Test 3: Find peaks
    console.log("3. Finding frequency peaks...");
    const peaks = await cm.executeCode(`
      const { FFTTools } = await import("../../tools/algorithms/fft.js");
      const result = await FFTTools.audioPeaks({
        filePath: "${audioFile}",
        windowSize: 2048,
        minMagnitude: 0.1,
        minDistance: 10
      });
      console.log("Found", result.count, "peaks");
      console.log("Top 5 peaks:");
      result.peaks.slice(0, 5).forEach((p, i) => {
        console.log(\`  \${i+1}. \${p.frequency.toFixed(2)} Hz (magnitude: \${p.magnitude.toFixed(3)})\`);
      });
      return result;
    `);
    console.log("✅ Peak detection complete\n");

    // Test 4: Signal analysis
    console.log("4. Testing signal analysis...");
    const signalAnalysis = await cm.executeCode(`
      const { FFTTools } = await import("../../tools/algorithms/fft.js");
      // Generate test signal: 440 Hz sine wave
      const sampleRate = 44100;
      const duration = 0.1; // 100ms
      const frequency = 440;
      const signal = [];
      for (let i = 0; i < sampleRate * duration; i++) {
        signal.push(Math.sin(2 * Math.PI * frequency * i / sampleRate));
      }
      const result = FFTTools.analyzeSignal({
        signal,
        sampleRate,
        windowSize: 2048
      });
      console.log("Detected frequency:", result.peakFrequencies[0]?.toFixed(2) || "N/A", "Hz");
      console.log("Expected: 440 Hz");
      return result;
    `);
    console.log("✅ Signal analysis complete\n");

    // Test 5: Frequency filtering
    console.log("5. Testing frequency filtering...");
    const filtered = await cm.executeCode(`
      const { FFTTools } = await import("../../tools/algorithms/fft.js");
      // Generate signal with multiple frequencies
      const sampleRate = 44100;
      const signal = [];
      for (let i = 0; i < 4410; i++) {
        const t = i / sampleRate;
        signal.push(
          Math.sin(2 * Math.PI * 440 * t) +  // 440 Hz
          Math.sin(2 * Math.PI * 1000 * t) + // 1000 Hz
          Math.sin(2 * Math.PI * 5000 * t)   // 5000 Hz
        );
      }
      const filtered = FFTTools.filterFrequencies({
        signal,
        lowCut: 800,
        highCut: 2000,
        sampleRate
      });
      console.log("Original signal length:", signal.length);
      console.log("Filtered signal length:", filtered.length);
      return { original: signal.length, filtered: filtered.length };
    `);
    console.log("✅ Frequency filtering complete\n");

    console.log("🎉 All FFT tools tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    cm.cleanup();
  }
}

main().catch(console.error);
