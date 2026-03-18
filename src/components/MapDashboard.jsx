import React, { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Graphic from '@arcgis/core/Graphic';
import { createColonyRenderer, createPopupTemplate, formatColonyFeature } from '../utils/colonyRenderer';
import { calculateHQI, calculateRecoveryTrend } from '../utils/hqiCalculator';
import { getSpeciesName } from '../utils/speciesMapping';
import { MapPin, Layers, ZoomIn, ZoomOut } from 'lucide-react';

const MapDashboard = ({ coloniesData, selectedYear, onColonySelect }) => {
  const mapDiv = useRef(null);
  const [mapView, setMapView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapStats, setMapStats] = useState({ total: 0, visible: 0 });

  useEffect(() => {
    if (!mapDiv.current) return;

    console.log('Initializing map...');
    
    // Initialize map without any basemap
    const map = new Map();

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [-90.0715, 29.9511], // Louisiana center
      zoom: 7,
      background: {
        color: [30, 41, 59] // Dark gray background
      },
      popup: {
        dockEnabled: true,
        dockOptions: {
          buttonEnabled: false,
          breakpoint: false
        }
      }
    });

    // Wait for view to be ready
    console.log('Waiting for view to be ready...');
    view.when(() => {
      console.log('Map view is ready!');
      setMapView(view);
      setLoading(false);
    }).catch((error) => {
      console.error('Error loading map:', error);
      setLoading(false);
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  useEffect(() => {
    console.log('MapDashboard useEffect - mapView:', mapView, 'coloniesData:', coloniesData);
    if (!mapView || !coloniesData || coloniesData.length === 0) {
      console.log('Skipping feature creation - mapView:', !!mapView, 'coloniesData length:', coloniesData?.length);
      return;
    }

    console.log('Creating features for', coloniesData.length, 'colonies');
    // Create features from colony data
    const features = coloniesData.map(colony => {
      const feature = formatColonyFeature(colony, selectedYear);
      if (!feature) return null;

      // Calculate HQI
      const latestData = selectedYear 
        ? colony.history.find(h => h.year === selectedYear)
        : colony.history[colony.history.length - 1];
      
      if (latestData) {
        const hqi = calculateHQI(latestData.nests, latestData.birds, latestData.species_count);
        feature.attributes.hqiScore = hqi.score;
        feature.attributes.hqiRating = hqi.rating;

        // Calculate trend if we have historical data
        if (colony.history.length > 1) {
          const trend = calculateRecoveryTrend(colony, 2010, 2021);
          feature.attributes.trend = `${trend.direction} ${trend.trend}`;
        }

        // Format top species
        const speciesNames = colony.top_species.slice(0, 3).map(getSpeciesName);
        feature.attributes.topSpecies = speciesNames.join(', ');
      }

      return new Graphic(feature);
    }).filter(Boolean);

    // Create feature layer
    const featureLayer = new FeatureLayer({
      source: features,
      objectIdField: 'ObjectID',
      fields: [
        { name: 'ObjectID', type: 'oid' },
        { name: 'name', type: 'string' },
        { name: 'totalBirds', type: 'integer' },
        { name: 'totalNests', type: 'integer' },
        { name: 'speciesCount', type: 'integer' },
        { name: 'topSpecies', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'category', type: 'string' },
        { name: 'nestingEfficiency', type: 'integer' },
        { name: 'hqiScore', type: 'double' },
        { name: 'hqiRating', type: 'string' },
        { name: 'trend', type: 'string' }
      ],
      renderer: createColonyRenderer(),
      popupTemplate: createPopupTemplate(),
      title: 'Louisiana Bird Colonies'
    });

    // Remove existing layers
    mapView.map.removeAll();
    
    // Add new layer
    mapView.map.add(featureLayer);

    // Update stats
    setMapStats({
      total: coloniesData.length,
      visible: features.length
    });

    // Handle popup click events
    mapView.on('click', (event) => {
      mapView.hitTest(event).then((response) => {
        if (response.results.length > 0) {
          const graphic = response.results[0].graphic;
          if (graphic && graphic.attributes && onColonySelect) {
            const colonyName = graphic.attributes.name;
            const colony = coloniesData.find(c => c.name === colonyName);
            if (colony) {
              onColonySelect(colony);
            }
          }
        }
      });
    });

  }, [mapView, coloniesData, selectedYear, onColonySelect]);

  const handleZoomIn = () => {
    if (mapView) {
      mapView.zoom += 1;
    }
  };

  const handleZoomOut = () => {
    if (mapView) {
      mapView.zoom -= 1;
    }
  };

  const handleResetView = () => {
    if (mapView) {
      mapView.goTo({
        center: [-90.0715, 29.9511],
        zoom: 7
      });
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapDiv} className="w-full h-full rounded-xl overflow-hidden shadow-2xl" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm rounded-xl">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-primary font-semibold">Loading Louisiana Colonies...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="glass-button p-3 rounded-lg hover:scale-105 transition-transform"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="glass-button p-3 rounded-lg hover:scale-105 transition-transform"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={handleResetView}
          className="glass-button p-3 rounded-lg hover:scale-105 transition-transform"
          title="Reset View"
        >
          <Layers className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Map Stats */}
      <div className="absolute bottom-4 left-4 glass-panel px-4 py-2 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-gray-300">
            Showing <span className="text-primary font-bold">{mapStats.visible}</span> of{' '}
            <span className="font-bold">{mapStats.total}</span> colonies
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-panel p-4 rounded-lg max-w-xs">
        <h3 className="text-sm font-bold text-white mb-2">Species Richness</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-300">Low (1-5 species)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-300">Medium (6-10 species)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-300">High (11-15 species)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-gray-300">Very High (16+ species)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Marker size represents bird population
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapDashboard;
