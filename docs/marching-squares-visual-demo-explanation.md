# Marching Squares Visual Demo Explanation

This document explains how the visual demo demonstrates marching squares and what benchmark data is used in the test suite.

## How the Visual Demo Demonstrates Marching Squares

The visual demo uses **ASCII art** to show how marching squares extracts contour lines from 2D scalar fields. Here's how it works:

### Core Concept

Marching Squares takes a **2D grid of scalar values** (like height, temperature, or density) and a **threshold value**, then generates **contour lines** that connect points where the value equals the threshold.

### Visual Demonstration Process

Each demo follows this pattern:

1. **Generate a 2D Grid**: Create a grid of numeric values representing some scalar field
2. **Apply Marching Squares**: Call `tools.algorithms.MarchingSquaresTools.compute()` with the grid and a threshold
3. **Visualize Results**: Display both the original grid and the extracted contours using ASCII characters

### Demo Breakdown

#### Demo 1: Circle Pattern

- **Grid Generation**: Creates a circular pattern where cells inside a radius = 1, outside = 0
- **Visualization**: Shows `██` for values > 0.5, `░░` for values ≤ 0.5
- **Demonstrates**: How marching squares extracts the boundary (contour) of a shape

#### Demo 2: Gradient Pattern

- **Grid Generation**: Linear gradient from (0,0) to (size,size) with values 0.0 to 1.0
- **Visualization**: Uses 5 shades (` `, `░`, `▒`, `▓`, `█`) to show value intensity
- **Demonstrates**: How contours appear as diagonal lines through a gradient field

#### Demo 3: Topographic Map

- **Grid Generation**: Radial falloff from center (mountain-like terrain)
- **Multi-Level Contours**: Uses `computeMultiLevel()` with thresholds [0.2, 0.4, 0.6, 0.8]
- **Visualization**: Shows elevation levels and multiple contour rings
- **Demonstrates**: Real-world topographic mapping with elevation contours

#### Demo 4: Island Generation

- **Grid Generation**: Circular island with radial height falloff
- **Multiple Thresholds**: Computes coastline (0.3) and elevation (0.6) separately
- **Visualization**: Uses `~` for water, `░▒▓█` for land elevations
- **Demonstrates**: Practical terrain generation with multiple contour levels

#### Demo 5: Heat Map

- **Grid Generation**: Multiple hot spots with exponential distance-based influence
- **Multi-Level**: Temperature zones at 30°C, 50°C, 70°C, 90°C
- **Visualization**: Shows temperature distribution with `🔥` for very hot spots
- **Demonstrates**: Scientific data visualization with isothermal lines

#### Demo 6: Wave Pattern

- **Grid Generation**: Multi-frequency sine/cosine waves combined
- **Contour Analysis**: Analyzes largest contour for length, area, centroid
- **Visualization**: Shows wave interference patterns
- **Demonstrates**: Scientific data analysis with contour properties

#### Demo 7: Simplification

- **Grid Generation**: Noisy pattern with many small variations
- **Simplification**: Uses Douglas-Peucker algorithm to reduce segment count
- **Visualization**: Shows before/after with segment count bars
- **Demonstrates**: Contour optimization for rendering efficiency

#### Demo 8: Performance

- **Grid Generation**: Random data for multiple grid sizes (10×10 to 40×40)
- **Benchmarking**: Measures execution time for each size
- **Visualization**: ASCII bar chart showing performance scaling
- **Demonstrates**: Performance characteristics and scalability

### Key Visualization Techniques

1. **Binary Visualization**: `██` vs `░░` for above/below threshold
2. **Gradient Visualization**: Multiple shades (`░▒▓█`) for value ranges
3. **Multi-Level Display**: Shows contours at different thresholds simultaneously
4. **ASCII Art Mapping**: Uses characters to represent terrain types (water, land, peaks)
5. **Performance Charts**: Bar charts using `█` characters scaled to execution time

### What Makes It Educational

- **Visual Feedback**: You can see the input grid and output contours side-by-side
- **Real-World Patterns**: Uses practical patterns (terrain, heat, waves) not just abstract data
- **Multiple Use Cases**: Shows 8 different applications of the algorithm
- **Interactive**: All demos run via codemode, making it easy to modify and experiment

## Benchmark Data in Test Suite

The test suite uses several types of data for benchmarking and validation:

### Test Suite Data (`marching-squares.test.ts`)

#### 1. **Simple Test Patterns**

```typescript
// Single point pattern
[[0, 0, 0],
 [0, 1, 0],
 [0, 0, 0]]

// Cross pattern
[[0, 0, 0, 0, 0],
 [0, 0, 1, 0, 0],
 [0, 1, 1, 1, 0],
 [0, 0, 1, 0, 0],
 [0, 0, 0, 0, 0]]
```

- **Purpose**: Basic functionality validation
- **Characteristics**: Small (3×3 to 7×7), predictable patterns

#### 2. **Gradient Patterns**

```typescript
[[0, 0.3, 0.6, 0.9],
 [0, 0.3, 0.6, 0.9],
 [0, 0.3, 0.6, 0.9]]
```

- **Purpose**: Testing threshold sensitivity
- **Characteristics**: Linear gradients, multiple threshold levels

#### 3. **Ambiguity Test Cases**

```typescript
// Case 5: diagonal corners above threshold
[[1, 0],
 [0, 1]]

// Case 10: opposite diagonal
[[0, 1],
 [1, 0]]
```

- **Purpose**: Testing ambiguity resolution methods
- **Characteristics**: 2×2 grids with specific corner patterns

#### 4. **Performance Test Data**

```typescript
// 50×50 random grid
Array(50).fill(null).map(() =>
  Array(50).fill(0).map(() => Math.random())
)
```

- **Purpose**: Performance comparison with legacy implementation
- **Characteristics**: 50×50 grid, random values 0-1, 10 iterations
- **Metrics**: Average execution time comparison

### Benchmark Suite Data (`marching-squares-benchmark.ts`)

The benchmark suite uses more comprehensive data:

#### 1. **Random Grids** (Primary Benchmark Data)

```typescript
function generateRandomGrid(size: number): number[][] {
  return Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(0)
        .map(() => Math.random())
    );
}
```

- **Grid Sizes**: 10×10, 25×25, 50×50, 75×75, 100×100
- **Value Range**: 0.0 to 1.0 (uniform random distribution)
- **Iterations**:
  - 50 iterations for 10×10 and 25×25
  - 20 iterations for 50×50
  - 10 iterations for 75×75 and 100×100
- **Purpose**: Primary performance comparison data
- **Why Random**: Provides worst-case scenario with maximum contour complexity

#### 2. **Pattern Grids** (Alternative Test Patterns)

```typescript
function generatePatternGrid(size: number, pattern: "circle" | "gradient" | "noise")
```

**Circle Pattern**:

- Creates a circular region (radius = size/4) with value 1.0, outside = 0.0
- **Purpose**: Tests simple geometric shape extraction

**Gradient Pattern**:

- Linear gradient: `value = (x + y) / (size * 2)`
- **Purpose**: Tests diagonal contour extraction

**Noise Pattern**:

- Random values (same as random grids)
- **Purpose**: Alternative random data generation

#### 3. **Benchmark Configuration**

**Grid Sizes Tested**:

- 10×10 (100 cells)
- 25×25 (625 cells)
- 50×50 (2,500 cells)
- 75×75 (5,625 cells)
- 100×100 (10,000 cells)

**Threshold**: Fixed at 0.5 for all benchmarks

**Metrics Collected**:

- **Time**: Average, min, max execution time (milliseconds)
- **Memory**: Average memory usage (if available)
- **Contours**: Number of contours generated
- **Segments**: Total number of line segments

**Comparison**:

- Refined LUT vs Legacy implementation
- Calculates: time improvement percentage and speedup factor

### Why This Benchmark Data?

1. **Random Data**:
   - Represents worst-case scenario (maximum contour complexity)
   - Ensures algorithm works with unpredictable input
   - Tests performance under realistic conditions

2. **Multiple Grid Sizes**:
   - Tests scalability from small to large grids
   - Identifies performance characteristics at different scales
   - Validates that improvements hold across sizes

3. **Multiple Iterations**:
   - Reduces measurement variance
   - Provides statistical confidence
   - Captures min/max performance bounds

4. **Fixed Threshold**:
   - Ensures fair comparison between implementations
   - 0.5 is neutral (middle of 0-1 range)
   - Produces reasonable contour counts

### Benchmark Results Format

The benchmark outputs:

- **Summary Table**: Grid size, average times, improvement percentage, speedup
- **Detailed Results**: Min/max times, contour/segment counts for each implementation
- **JSON Export**: Machine-readable results for programmatic analysis

### Performance Test in Test Suite

The test suite also includes a performance test:

- **Grid Size**: 50×50
- **Data**: Random values (Math.random())
- **Iterations**: 10
- **Comparison**: Refined LUT vs Legacy
- **Assertion**: Refined LUT should be ≤ 1.3× legacy time (allows for variance)

## Summary

**Visual Demo**: Uses ASCII art to show marching squares extracting contours from various 2D scalar fields (terrain, heat, waves, etc.), making the algorithm's behavior visually understandable.

**Benchmark Data**: Primarily uses random grids of varying sizes (10×10 to 100×100) with uniform random values, tested over multiple iterations to measure performance improvements of the refined LUT implementation over the legacy version.
