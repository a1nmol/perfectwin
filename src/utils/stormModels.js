/**
 * Storm Impact Models
 * Calculations for hurricane impact scoring and recovery predictions
 */

import {
  saffirSimpson,
  surgeFactors,
  habitatFragility as habitatFragilityMap,
  weights,
  recovery as recoveryConfig,
  defaults,
  dropScale,
  exposureDistanceKm
} from './stormConfig.js';

/**
 * Derive Saffir-Simpson category from wind speed in knots
 * @param {number} maxWindKt - Maximum sustained wind speed in knots
 * @returns {number} Category (1-5)
 */
export function saffirSimpsonCategoryFromWindKt(maxWindKt) {
  if (maxWindKt >= saffirSimpson.cat5.min) return 5;
  if (maxWindKt >= saffirSimpson.cat4.min) return 4;
  if (maxWindKt >= saffirSimpson.cat3.min) return 3;
  if (maxWindKt >= saffirSimpson.cat2.min) return 2;
  if (maxWindKt >= saffirSimpson.cat1.min) return 1;
  return 0; // Tropical storm or depression
}

/**
 * Get wind factor from hurricane category
 * @param {number} category - Saffir-Simpson category (1-5)
 * @returns {number} Wind factor (0.0 to 1.0)
 */
export function windFactorFromCategory(category) {
  switch (category) {
    case 5: return saffirSimpson.cat5.factor;
    case 4: return saffirSimpson.cat4.factor;
    case 3: return saffirSimpson.cat3.factor;
    case 2: return saffirSimpson.cat2.factor;
    case 1: return saffirSimpson.cat1.factor;
    default: return 0.0;
  }
}

/**
 * Get surge factor from habitat type
 * @param {string} habitatType - Habitat type name
 * @returns {number} Surge factor (0.0 to 1.0)
 */
export function surgeFactorFromHabitat(habitatType) {
  if (!habitatType) return surgeFactors['Unknown'];
  
  // Try exact match first
  if (surgeFactors[habitatType] !== undefined) {
    return surgeFactors[habitatType];
  }
  
  // Try case-insensitive partial match
  const lowerHabitat = habitatType.toLowerCase();
  for (const [key, value] of Object.entries(surgeFactors)) {
    if (key.toLowerCase().includes(lowerHabitat) || lowerHabitat.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return surgeFactors['Unknown'];
}

/**
 * Get habitat fragility score
 * @param {string} habitatType - Habitat type name
 * @returns {number} Fragility score (0.0 to 1.0)
 */
export function habitatFragility(habitatType) {
  if (!habitatType) return habitatFragilityMap['Unknown'];
  
  // Try exact match first
  if (habitatFragilityMap[habitatType] !== undefined) {
    return habitatFragilityMap[habitatType];
  }
  
  // Try case-insensitive partial match
  const lowerHabitat = habitatType.toLowerCase();
  for (const [key, value] of Object.entries(habitatFragilityMap)) {
    if (key.toLowerCase().includes(lowerHabitat) || lowerHabitat.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return habitatFragilityMap['Unknown'];
}

/**
 * Calculate impact score for a colony
 * @param {Object} params
 * @param {number} params.category - Hurricane category (1-5)
 * @param {number} params.exposureScore - Exposure score (0.0 to 1.0)
 * @param {string} params.habitatType - Habitat type
 * @returns {number} Impact score (0.0 to 1.0)
 */
export function impactScore({ category, exposureScore, habitatType }) {
  const windFactor = windFactorFromCategory(category);
  const surgeFactor = surgeFactorFromHabitat(habitatType);
  const fragility = habitatFragility(habitatType);
  
  const score = 
    (windFactor * weights.wind) +
    (surgeFactor * weights.surge) +
    (fragility * weights.fragility) +
    (exposureScore * weights.exposure);
  
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate recovery years for a colony
 * @param {Object} params
 * @param {number} params.impactScore - Impact score (0.0 to 1.0)
 * @param {number} params.speciesRichness - Number of species (default: 8)
 * @param {number} params.vegetationDensity - Vegetation density 0-1 (default: 0.30)
 * @param {number} params.landLossRate - Annual land loss rate (default: 0.05)
 * @returns {number} Recovery years (1 to 12)
 */
export function recoveryYears({
  impactScore,
  speciesRichness = defaults.speciesRichness,
  vegetationDensity = defaults.vegetationDensity,
  landLossRate = defaults.landLossRate
}) {
  const baseYears = impactScore * recoveryConfig.impactMultiplier;
  const speciesReduction = speciesRichness * recoveryConfig.speciesCoeff;
  const vegReduction = vegetationDensity * recoveryConfig.vegCoeff;
  const landLossIncrease = landLossRate * recoveryConfig.landLossCoeff;
  
  const years = baseYears - speciesReduction - vegReduction + landLossIncrease;
  
  // Clamp to [minYears, maxYears]
  return Math.max(
    recoveryConfig.minYears,
    Math.min(recoveryConfig.maxYears, Math.round(years))
  );
}

/**
 * Calculate predicted population drop percentage
 * @param {number} impactScore - Impact score (0.0 to 1.0)
 * @returns {number} Population drop percentage (0 to 40)
 */
export function predictedPopulationDropPct(impactScore) {
  return Math.round(impactScore * dropScale * 100);
}

/**
 * Calculate all impact metrics for a colony
 * @param {Object} params
 * @param {Object} params.colony - Colony data with lat, lon, habitatType, etc.
 * @param {number} params.minDistanceKm - Minimum distance to storm track
 * @param {number} params.exposureScore - Exposure score
 * @param {number} params.category - Hurricane category
 * @returns {Object} Complete impact analysis
 */
export function calculateColonyImpact({
  colony,
  minDistanceKm,
  exposureScore,
  category
}) {
  const habitatType = colony.habitatType || defaults.habitatType;
  const speciesRichness = colony.speciesRichness || colony.species_count || defaults.speciesRichness;
  const vegetationDensity = colony.vegetationDensity || defaults.vegetationDensity;
  const landLossRate = colony.landLossRate || defaults.landLossRate;
  
  const impact = impactScore({
    category,
    exposureScore,
    habitatType
  });
  
  const recovery = recoveryYears({
    impactScore: impact,
    speciesRichness,
    vegetationDensity,
    landLossRate
  });
  
  const dropPct = predictedPopulationDropPct(impact);
  
  return {
    colonyId: colony.id || colony.name,
    colonyName: colony.name,
    exposureScore: Number(exposureScore.toFixed(2)),
    impactScore: Number(impact.toFixed(3)),
    predictedPopulationDropPct: dropPct,
    recoveryYears: recovery,
    factors: {
      minDistanceKm: Number(minDistanceKm.toFixed(2)),
      habitatType,
      speciesRichness,
      vegetationDensity: Number(vegetationDensity.toFixed(2)),
      landLossRate: Number(landLossRate.toFixed(3)),
      windFactor: Number(windFactorFromCategory(category).toFixed(2)),
      surgeFactor: Number(surgeFactorFromHabitat(habitatType).toFixed(2)),
      fragility: Number(habitatFragility(habitatType).toFixed(2))
    }
  };
}

/**
 * Generate recovery timeline data for visualization
 * @param {number} recoveryYears - Years to full recovery
 * @param {number} initialPopulation - Starting population
 * @param {number} dropPct - Population drop percentage
 * @returns {Array} Timeline data points
 */
export function generateRecoveryTimeline(recoveryYears, initialPopulation, dropPct) {
  const timeline = [];
  const minPopulation = initialPopulation * (1 - dropPct / 100);
  
  // Year 0: Initial impact
  timeline.push({
    year: 0,
    population: Math.round(minPopulation),
    percentRecovered: 0
  });
  
  // Recovery years: Linear recovery
  for (let year = 1; year <= recoveryYears; year++) {
    const percentRecovered = (year / recoveryYears) * 100;
    const population = minPopulation + (initialPopulation - minPopulation) * (year / recoveryYears);
    
    timeline.push({
      year,
      population: Math.round(population),
      percentRecovered: Math.round(percentRecovered)
    });
  }
  
  return timeline;
}

/**
 * Haversine distance between two lat/lon points in km
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Minimum distance from a lat/lon point to a storm track array in km
 * @param {number} lat
 * @param {number} lon
 * @param {Array<{lat:number,lon:number}>} track
 * @returns {number} km
 */
export function minDistanceToTrack(lat, lon, track) {
  if (!track || track.length === 0) return Infinity;
  return Math.min(...track.map(pt => haversineDistanceKm(lat, lon, pt.lat, pt.lon)));
}

/**
 * Classify exposure score from minimum distance to storm track
 * Mirrors the Flask API thresholds exactly (stormConfig.exposureDistanceKm)
 * @param {number} minDistKm
 * @returns {number} 0.0 | 0.2 | 0.5 | 0.8 | 1.0
 */
export function classifyExposureScore(minDistKm) {
  if (minDistKm < exposureDistanceKm.veryHigh) return 1.0;  // < 20 km
  if (minDistKm < exposureDistanceKm.high)     return 0.8;  // < 50 km
  if (minDistKm < exposureDistanceKm.medium)   return 0.5;  // < 100 km
  if (minDistKm < exposureDistanceKm.low)      return 0.2;  // < 150 km
  return 0.0;
}

export default {
  saffirSimpsonCategoryFromWindKt,
  windFactorFromCategory,
  surgeFactorFromHabitat,
  habitatFragility,
  impactScore,
  recoveryYears,
  predictedPopulationDropPct,
  calculateColonyImpact,
  generateRecoveryTimeline,
  haversineDistanceKm,
  minDistanceToTrack,
  classifyExposureScore
};
