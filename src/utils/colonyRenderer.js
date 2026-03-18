// ArcGIS UniqueValueRenderer configuration for colony visualization

/**
 * Get biodiversity category based on species count
 * @param {number} speciesCount - Number of species
 * @returns {string} Category name
 */
export const getBiodiversityCategory = (speciesCount) => {
  if (speciesCount >= 16) return 'very-high';
  if (speciesCount >= 11) return 'high';
  if (speciesCount >= 6) return 'medium';
  return 'low';
};

/**
 * Get color for biodiversity category
 * @param {string} category - Biodiversity category
 * @returns {Array} RGB color array
 */
export const getCategoryColor = (category) => {
  const colors = {
    'very-high': [16, 185, 129],    // Emerald green
    'high': [249, 115, 22],          // Orange
    'medium': [234, 179, 8],         // Yellow
    'low': [156, 163, 175]           // Gray
  };
  return colors[category] || colors.low;
};

/**
 * Create UniqueValueRenderer for ArcGIS map
 * @returns {object} ArcGIS renderer configuration
 */
export const createColonyRenderer = () => {
  return {
    type: "simple",
    symbol: {
      type: "simple-marker",
      size: 10,
      color: [16, 185, 129, 0.8],
      outline: {
        color: [255, 255, 255, 0.8],
        width: 2
      }
    },
    visualVariables: [
      {
        type: "size",
        field: "totalBirds",
        minDataValue: 0,
        maxDataValue: 75000,
        minSize: 8,
        maxSize: 40
      },
      {
        type: "color",
        field: "speciesCount",
        stops: [
          { value: 1, color: [156, 163, 175, 0.8], label: "Low (1-5 species)" },
          { value: 6, color: [234, 179, 8, 0.8], label: "Medium (6-10 species)" },
          { value: 11, color: [249, 115, 22, 0.8], label: "High (11-15 species)" },
          { value: 16, color: [16, 185, 129, 0.8], label: "Very High (16+ species)" }
        ]
      }
    ]
  };
};

/**
 * Create popup template for colony features
 * @returns {object} ArcGIS popup template
 */
export const createPopupTemplate = () => {
  return {
    title: "{name}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "totalBirds",
            label: "Total Birds",
            format: {
              digitSeparator: true,
              places: 0
            }
          },
          {
            fieldName: "totalNests",
            label: "Total Nests",
            format: {
              digitSeparator: true,
              places: 0
            }
          },
          {
            fieldName: "speciesCount",
            label: "Species Richness"
          },
          {
            fieldName: "topSpecies",
            label: "Top Species"
          },
          {
            fieldName: "year",
            label: "Year"
          }
        ]
      },
      {
        type: "text",
        text: "<div style='margin-top: 10px; padding: 10px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;'>" +
              "<strong>Recovery Trend:</strong> {trend}<br/>" +
              "<strong>Nesting Efficiency:</strong> {nestingEfficiency}%<br/>" +
              "<strong>HQI Score:</strong> {hqiScore} ({hqiRating})" +
              "</div>"
      },
      {
        type: "media",
        mediaInfos: [
          {
            type: "line-chart",
            title: "Population Trend (2010-2021)",
            value: {
              fields: ["birds2010", "birds2015", "birds2021"],
              normalizeField: null,
              tooltipField: "name"
            }
          }
        ]
      }
    ],
    actions: [
      {
        title: "View Details",
        id: "view-details",
        className: "esri-icon-description"
      },
      {
        title: "Analyze Habitat",
        id: "analyze-habitat",
        className: "esri-icon-chart"
      }
    ]
  };
};

/**
 * Create cluster configuration for dense areas
 * @returns {object} ArcGIS cluster configuration
 */
export const createClusterConfig = () => {
  return {
    type: "cluster",
    clusterRadius: "100px",
    popupTemplate: {
      title: "Cluster of {cluster_count} colonies",
      content: "This cluster contains {cluster_count} bird colonies. Zoom in to see individual colonies.",
      fieldInfos: [
        {
          fieldName: "cluster_count",
          format: {
            places: 0,
            digitSeparator: true
          }
        }
      ]
    },
    clusterMinSize: "24px",
    clusterMaxSize: "60px",
    labelingInfo: [
      {
        deconflictionStrategy: "none",
        labelExpressionInfo: {
          expression: "Text($feature.cluster_count, '#,###')"
        },
        symbol: {
          type: "text",
          color: "white",
          font: {
            weight: "bold",
            family: "Noto Sans",
            size: "12px"
          }
        },
        labelPlacement: "center-center"
      }
    ]
  };
};

/**
 * Create heatmap renderer for density visualization
 * @returns {object} ArcGIS heatmap renderer
 */
export const createHeatmapRenderer = () => {
  return {
    type: "heatmap",
    field: "totalBirds",
    colorStops: [
      { ratio: 0, color: "rgba(255, 255, 255, 0)" },
      { ratio: 0.2, color: "rgba(56, 189, 248, 0.5)" },
      { ratio: 0.5, color: "rgba(234, 179, 8, 0.7)" },
      { ratio: 0.8, color: "rgba(249, 115, 22, 0.8)" },
      { ratio: 1, color: "rgba(239, 68, 68, 1)" }
    ],
    maxPixelIntensity: 100,
    minPixelIntensity: 0,
    radius: 20
  };
};

/**
 * Format colony data for ArcGIS feature layer
 * @param {object} colony - Colony data from JSON
 * @param {number} year - Year to display (optional)
 * @returns {object} Formatted feature
 */
export const formatColonyFeature = (colony, year = null) => {
  // Get data for specified year or most recent
  let data;
  if (year) {
    data = colony.history.find(h => h.year === year);
  }
  if (!data) {
    data = colony.history[colony.history.length - 1];
  }
  
  if (!data) return null;
  
  const category = getBiodiversityCategory(data.species_count);
  
  return {
    geometry: {
      type: "point",
      longitude: colony.lng,
      latitude: colony.lat
    },
    attributes: {
      ObjectID: colony.name.replace(/\s+/g, '_'),
      name: colony.name,
      totalBirds: data.birds,
      totalNests: data.nests,
      speciesCount: data.species_count,
      topSpecies: colony.top_species.join(', '),
      year: data.year,
      category: category,
      nestingEfficiency: data.birds > 0 ? Math.round((data.nests / data.birds) * 100) : 0,
      hqiScore: 0, // Will be calculated
      hqiRating: '',
      trend: '→'
    }
  };
};
