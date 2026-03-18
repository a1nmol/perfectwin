/**
 * Storm Impact Configuration
 * Centralized constants for hurricane impact and recovery calculations
 */

// Exposure distance thresholds (in kilometers)
export const exposureDistanceKm = {
  veryHigh: 20,    // < 20 km → ExposureScore = 1.0
  high: 50,        // < 50 km → ExposureScore = 0.8
  medium: 100,     // < 100 km → ExposureScore = 0.5
  low: 150         // < 150 km → ExposureScore = 0.2
  // >= 150 km → ExposureScore = 0.0
};

// Impact score weights (must sum to 1.0)
export const weights = {
  wind: 0.4,        // Wind factor contribution
  surge: 0.3,       // Storm surge factor contribution
  fragility: 0.2,   // Habitat fragility contribution
  exposure: 0.1     // Exposure score contribution
};

// Saffir-Simpson wind speed thresholds (in knots)
export const saffirSimpson = {
  cat1: { min: 64, max: 82, factor: 0.2 },
  cat2: { min: 83, max: 95, factor: 0.4 },
  cat3: { min: 96, max: 112, factor: 0.6 },
  cat4: { min: 113, max: 136, factor: 0.8 },
  cat5: { min: 137, max: Infinity, factor: 1.0 }
};

// Surge factor by habitat type
export const surgeFactors = {
  'Low marsh': 1.0,
  'Sandbar': 1.0,
  'Barrier island': 0.7,
  'Interior wetland': 0.3,
  'Vegetated island': 0.5,
  'Stable substrate': 0.3,
  'Unknown': 0.7  // Neutral default
};

// Habitat fragility scores
export const habitatFragility = {
  'Sandbar': 1.0,
  'Low marsh': 0.8,
  'Barrier island': 0.7,
  'Vegetated island': 0.6,
  'Interior wetland': 0.4,
  'Stable substrate': 0.3,
  'Unknown': 0.6  // Neutral default
};

// Recovery calculation parameters
export const recovery = {
  impactMultiplier: 4,      // Base years = ImpactScore * 4
  speciesCoeff: 0.1,        // Species richness reduction factor
  vegCoeff: 0.05,           // Vegetation density reduction factor
  landLossCoeff: 1.5,       // Land loss rate increase factor
  minYears: 1,              // Minimum recovery time
  maxYears: 12              // Maximum recovery time
};

// Default colony attributes (when data is missing)
export const defaults = {
  speciesRichness: 8,
  vegetationDensity: 0.30,  // 0-1 scale
  landLossRate: 0.05,       // 5% per year
  habitatType: 'Unknown'
};

// Population drop scale
export const dropScale = 0.4;  // ImpactScore * 40% = predicted population drop

// Storm track visualization colors
export const bufferColors = {
  veryHigh: '#ef4444',  // Red - 20km
  high: '#f97316',      // Orange - 50km
  medium: '#eab308',    // Yellow - 100km
  low: '#fbbf24'        // Amber - 150km
};

// Performance thresholds
export const performance = {
  maxColonies: 190,
  maxTrackPoints: 200,
  targetMs: 300  // Target calculation time in milliseconds
};

export default {
  exposureDistanceKm,
  weights,
  saffirSimpson,
  surgeFactors,
  habitatFragility,
  recovery,
  defaults,
  dropScale,
  bufferColors,
  performance
};
