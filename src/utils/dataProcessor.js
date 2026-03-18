// Process the master Louisiana avian data
export const processMasterData = (masterData) => {
  const processed = {};
  
  masterData.forEach(colony => {
    if (!processed[colony.name]) {
      processed[colony.name] = {
        name: colony.name,
        lat: colony.lat,
        lng: colony.lng,
        image_url: colony.image_url,
        yearlyData: {},
        allSpecies: new Set(),
        totalBirds: 0,
        totalNests: 0
      };
    }
    
    const colonyData = processed[colony.name];
    
    colony.history.forEach(record => {
      const year = record.year;
      const species = record.species;
      
      if (!colonyData.yearlyData[year]) {
        colonyData.yearlyData[year] = {
          year,
          species: {},
          totalBirds: 0,
          totalNests: 0,
          speciesCount: 0
        };
      }
      
      const yearData = colonyData.yearlyData[year];
      
      if (!yearData.species[species]) {
        yearData.species[species] = {
          species,
          birds: 0,
          nests: 0,
          observations: []
        };
      }
      
      yearData.species[species].birds += record.birds || 0;
      yearData.species[species].nests += record.nests || 0;
      yearData.species[species].observations.push({
        birds: record.birds || 0,
        nests: record.nests || 0
      });
      
      yearData.totalBirds += record.birds || 0;
      yearData.totalNests += record.nests || 0;
      
      colonyData.allSpecies.add(species);
      colonyData.totalBirds += record.birds || 0;
      colonyData.totalNests += record.nests || 0;
    });
  });
  
  // Convert to array and calculate species counts
  return Object.values(processed).map(colony => {
    const yearlyDataArray = Object.values(colony.yearlyData).map(yearData => {
      yearData.speciesCount = Object.keys(yearData.species).length;
      return yearData;
    });
    
    return {
      ...colony,
      allSpecies: Array.from(colony.allSpecies),
      speciesRichness: colony.allSpecies.size,
      yearlyData: yearlyDataArray.sort((a, b) => a.year - b.year),
      history: yearlyDataArray.map(yd => ({
        year: yd.year,
        birds: yd.totalBirds,
        nests: yd.totalNests,
        species_count: yd.speciesCount
      }))
    };
  });
};

// Get species richness category
export const getSpeciesRichnessCategory = (speciesCount) => {
  if (speciesCount <= 5) return 'low';
  if (speciesCount <= 10) return 'medium';
  if (speciesCount <= 15) return 'high';
  return 'very-high';
};

// Get all unique species across all colonies
export const getAllUniqueSpecies = (processedData) => {
  const allSpecies = new Set();
  processedData.forEach(colony => {
    colony.allSpecies.forEach(species => allSpecies.add(species));
  });
  return Array.from(allSpecies).sort();
};

// Get bird tracking data for a specific species
export const getSpeciesTrackingData = (processedData, speciesCode) => {
  const trackingData = [];
  
  processedData.forEach(colony => {
    colony.yearlyData.forEach(yearData => {
      if (yearData.species[speciesCode]) {
        const speciesData = yearData.species[speciesCode];
        trackingData.push({
          colony: colony.name,
          lat: colony.lat,
          lng: colony.lng,
          year: yearData.year,
          birds: speciesData.birds,
          nests: speciesData.nests,
          observations: speciesData.observations.length
        });
      }
    });
  });
  
  return trackingData.sort((a, b) => a.year - b.year);
};

// Get year range from data
export const getYearRange = (processedData) => {
  const years = new Set();
  processedData.forEach(colony => {
    colony.yearlyData.forEach(yearData => {
      years.add(yearData.year);
    });
  });
  return Array.from(years).sort((a, b) => a - b);
};

// Fill missing years with interpolated or zero data
export const fillMissingYears = (colony, allYears) => {
  const filledHistory = [];
  const existingYears = new Set(colony.history.map(h => h.year));
  
  allYears.forEach(year => {
    if (existingYears.has(year)) {
      const existing = colony.history.find(h => h.year === year);
      filledHistory.push(existing);
    } else {
      // Find nearest years with data
      const before = colony.history.filter(h => h.year < year).sort((a, b) => b.year - a.year)[0];
      const after = colony.history.filter(h => h.year > year).sort((a, b) => a.year - b.year)[0];
      
      if (before && after) {
        // Interpolate
        const ratio = (year - before.year) / (after.year - before.year);
        filledHistory.push({
          year,
          birds: Math.round(before.birds + (after.birds - before.birds) * ratio),
          nests: Math.round(before.nests + (after.nests - before.nests) * ratio),
          species_count: Math.round(before.species_count + (after.species_count - before.species_count) * ratio),
          interpolated: true
        });
      } else {
        // No data available
        filledHistory.push({
          year,
          birds: 0,
          nests: 0,
          species_count: 0,
          noData: true
        });
      }
    }
  });
  
  return filledHistory;
};

// Calculate year-specific growth percentage
export const calculateYearGrowth = (trendData, year) => {
  const currentYearData = trendData.find(d => d.year === year);
  const previousYearData = trendData.find(d => d.year === year - 1);
  
  if (!currentYearData || !previousYearData || previousYearData.birds === 0) {
    return 0;
  }
  
  return Number((((currentYearData.birds - previousYearData.birds) / previousYearData.birds) * 100).toFixed(1));
};

// Calculate year-specific nesting efficiency
export const calculateNestingEfficiency = (birds, nests) => {
  if (birds === 0) return 0;
  return Math.round((nests / birds) * 100);
};

/**
 * Interpolate a single value for a target year from a sparse history array,
 * using the same linear interpolation logic as fillMissingYears.
 * Returns null if interpolation is not possible (no before or after point).
 *
 * @param {Array<{year:number, birds:number, nests:number}>} history
 * @param {number} targetYear
 * @returns {{ birds: number, nests: number } | null}
 */
const interpolateForYear = (history, targetYear) => {
  const before = history
    .filter(h => h.year < targetYear)
    .sort((a, b) => b.year - a.year)[0];
  const after = history
    .filter(h => h.year > targetYear)
    .sort((a, b) => a.year - b.year)[0];

  if (!before || !after) return null;

  const ratio = (targetYear - before.year) / (after.year - before.year);
  return {
    birds: Math.round(before.birds + (after.birds - before.birds) * ratio),
    nests: Math.round(before.nests + (after.nests - before.nests) * ratio),
  };
};

/**
 * Compute validation data for a set of test years.
 *
 * For each test year, for every colony that has *actual* data for that year:
 *   - Remove the test year from the colony's history
 *   - Interpolate the value using surrounding years
 *   - Record actual vs predicted for birds and nests
 *
 * Returns an array of per-year result objects:
 * {
 *   year: number,
 *   actualTotalBirds: number,
 *   predTotalBirds: number,
 *   actualTotalNests: number,
 *   predTotalNests: number,
 *   colonyBirdsMAPEs: number[],   // per-colony MAPE for birds
 *   colonyNestsMAPEs: number[],   // per-colony MAPE for nests
 *   validColonies: number,        // colonies where interpolation was possible
 * }
 *
 * @param {Array} coloniesData - processed colonies array (with .history)
 * @param {number[]} testYears
 * @returns {Array}
 */
export const getValidationData = (coloniesData, testYears) => {
  if (!coloniesData || !coloniesData.length || !testYears || !testYears.length) {
    return [];
  }

  return testYears.map(testYear => {
    let actualTotalBirds = 0;
    let predTotalBirds = 0;
    let actualTotalNests = 0;
    let predTotalNests = 0;
    const colonyBirdsMAPEs = [];
    const colonyNestsMAPEs = [];
    const colonyPoints = [];
    let validColonies = 0;

    coloniesData.forEach(colony => {
      // Find actual record for this test year
      const actualRecord = colony.history.find(h => h.year === testYear);
      if (!actualRecord) return; // colony has no data for this year — skip

      // Build history WITHOUT the test year
      const reducedHistory = colony.history.filter(h => h.year !== testYear);

      // Attempt interpolation
      const predicted = interpolateForYear(reducedHistory, testYear);
      if (!predicted) return; // can't interpolate (no before or after) — skip

      validColonies++;

      // Accumulate totals
      actualTotalBirds += actualRecord.birds;
      predTotalBirds += predicted.birds;
      actualTotalNests += actualRecord.nests;
      predTotalNests += predicted.nests;

      // Per-colony MAPE for birds
      if (Math.abs(actualRecord.birds) > 1e-9) {
        colonyBirdsMAPEs.push(
          Math.abs((actualRecord.birds - predicted.birds) / actualRecord.birds) * 100
        );
      }

      // Per-colony MAPE for nests
      if (Math.abs(actualRecord.nests) > 1e-9) {
        colonyNestsMAPEs.push(
          Math.abs((actualRecord.nests - predicted.nests) / actualRecord.nests) * 100
        );
      }

      colonyPoints.push({
        name: colony.name,
        actual: actualRecord.birds,
        predicted: predicted.birds,
      });
    });

    return {
      year: testYear,
      actualTotalBirds,
      predTotalBirds,
      actualTotalNests,
      predTotalNests,
      colonyBirdsMAPEs,
      colonyNestsMAPEs,
      validColonies,
      colonyPoints,
    };
  });
};
