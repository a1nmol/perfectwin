// Habitat Quality Index (HQI) Calculator
// Formula: HQI = (Total Nests / Total Birds) × Biodiversity Factor

/**
 * Calculate Habitat Quality Index for a colony or dataset
 * @param {number} totalNests - Total number of nests
 * @param {number} totalBirds - Total number of birds
 * @param {number} speciesCount - Number of different species
 * @returns {object} HQI score and rating
 */
export const calculateHQI = (totalNests, totalBirds, speciesCount) => {
  if (totalBirds === 0) {
    return { score: 0, rating: 'No Data', color: '#6b7280' };
  }

  // Nesting efficiency (0-1)
  const nestingEfficiency = totalNests / totalBirds;
  
  // Biodiversity factor (normalized, higher species count = better)
  // Scale: 1-5 species = 0.5, 6-10 = 0.75, 11-15 = 1.0, 16+ = 1.25
  let biodiversityFactor = 0.5;
  if (speciesCount >= 16) biodiversityFactor = 1.25;
  else if (speciesCount >= 11) biodiversityFactor = 1.0;
  else if (speciesCount >= 6) biodiversityFactor = 0.75;
  
  // Calculate HQI (scale 0-100)
  const hqi = (nestingEfficiency * biodiversityFactor * 100);
  
  // Determine rating
  let rating, color;
  if (hqi >= 80) {
    rating = 'Excellent';
    color = '#10b981'; // Emerald
  } else if (hqi >= 60) {
    rating = 'Good';
    color = '#0ea5e9'; // Ocean blue
  } else if (hqi >= 40) {
    rating = 'Fair';
    color = '#eab308'; // Yellow
  } else if (hqi >= 20) {
    rating = 'Poor';
    color = '#f97316'; // Coral
  } else {
    rating = 'Critical';
    color = '#ef4444'; // Red
  }
  
  return {
    score: Math.round(hqi * 10) / 10,
    rating,
    color,
    nestingEfficiency: Math.round(nestingEfficiency * 100),
    biodiversityFactor
  };
};

/**
 * Calculate aggregate HQI for multiple colonies
 * @param {Array} colonies - Array of colony data
 * @param {number} year - Year to calculate for (optional)
 * @returns {object} Aggregate HQI metrics
 */
export const calculateAggregateHQI = (colonies, year = null) => {
  let totalNests = 0;
  let totalBirds = 0;
  let speciesSet = new Set();
  let coloniesWithData = 0;

  colonies.forEach(colony => {
    let data;
    
    if (year) {
      // Find data for specific year
      data = colony.history.find(h => h.year === year);
    } else {
      // Use most recent data
      data = colony.history[colony.history.length - 1];
    }
    
    if (data) {
      totalNests += data.nests;
      totalBirds += data.birds;
      coloniesWithData++;
      
      // Add species from this colony
      colony.top_species.forEach(species => speciesSet.add(species));
    }
  });

  const totalSpecies = speciesSet.size;
  const hqi = calculateHQI(totalNests, totalBirds, totalSpecies);

  return {
    ...hqi,
    totalNests,
    totalBirds,
    totalSpecies,
    coloniesAnalyzed: coloniesWithData,
    year: year || 'Latest'
  };
};

/**
 * Calculate recovery trend between two years
 * @param {object} colony - Colony data
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @returns {object} Trend analysis
 */
export const calculateRecoveryTrend = (colony, startYear, endYear) => {
  const startData = colony.history.find(h => h.year === startYear);
  const endData = colony.history.find(h => h.year === endYear);
  
  if (!startData || !endData) {
    return { trend: 'unknown', change: 0, direction: '→' };
  }
  
  const nestChange = ((endData.nests - startData.nests) / startData.nests) * 100;
  const birdChange = ((endData.birds - startData.birds) / startData.birds) * 100;
  const speciesChange = endData.species_count - startData.species_count;
  
  let trend, direction;
  const avgChange = (nestChange + birdChange) / 2;
  
  if (avgChange > 10) {
    trend = 'improving';
    direction = '↑';
  } else if (avgChange < -10) {
    trend = 'declining';
    direction = '↓';
  } else {
    trend = 'stable';
    direction = '→';
  }
  
  return {
    trend,
    direction,
    nestChange: Math.round(nestChange),
    birdChange: Math.round(birdChange),
    speciesChange,
    startYear,
    endYear
  };
};

/**
 * Identify critical habitats based on HQI and population
 * @param {Array} colonies - Array of colony data
 * @param {number} topN - Number of top habitats to return
 * @returns {Array} Top critical habitats
 */
export const identifyCriticalHabitats = (colonies, topN = 5) => {
  const scored = colonies.map(colony => {
    const latestData = colony.history[colony.history.length - 1];
    if (!latestData) return null;
    
    const hqi = calculateHQI(latestData.nests, latestData.birds, latestData.species_count);
    
    // Critical score = HQI × log(population)
    const populationScore = Math.log10(latestData.birds + 1);
    const criticalScore = hqi.score * populationScore;
    
    return {
      name: colony.name,
      hqi: hqi.score,
      rating: hqi.rating,
      birds: latestData.birds,
      nests: latestData.nests,
      species: latestData.species_count,
      criticalScore,
      lat: colony.lat,
      lng: colony.lng
    };
  }).filter(Boolean);
  
  // Sort by critical score descending
  scored.sort((a, b) => b.criticalScore - a.criticalScore);
  
  return scored.slice(0, topN);
};
