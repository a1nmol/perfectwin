import React from 'react';
import { Filter, Layers } from 'lucide-react';
import { getSpeciesRichnessCategory } from '../utils/dataProcessor';

const MapFilter = ({ activeFilter, onFilterChange, coloniesData }) => {
  const filters = [
    { id: 'all', label: 'All Colonies', color: '#6b7280' },
    { id: 'low', label: 'Low (1-5 species)', color: '#eab308' },
    { id: 'medium', label: 'Medium (6-10 species)', color: '#f97316' },
    { id: 'high', label: 'High (11-15 species)', color: '#ef4444' },
    { id: 'very-high', label: 'Very High (16+ species)', color: '#10b981' }
  ];

  const getFilterCounts = () => {
    const counts = {
      all: coloniesData.length,
      low: 0,
      medium: 0,
      high: 0,
      'very-high': 0
    };

    coloniesData.forEach(colony => {
      const category = getSpeciesRichnessCategory(colony.speciesRichness || 0);
      counts[category]++;
    });

    return counts;
  };

  const counts = getFilterCounts();

  return (
    <div className="glass-panel p-4 rounded-lg space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-bold text-white">Filter by Species Richness</h3>
      </div>

      <div className="space-y-2">
        {filters.map(filter => {
          const isActive = activeFilter === filter.id;
          const count = counts[filter.id] || 0;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                isActive
                  ? 'bg-white/20 border-2'
                  : 'glass-button hover:bg-white/10'
              }`}
              style={{
                borderColor: isActive ? filter.color : 'transparent'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: filter.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-semibold text-white">{filter.label}</p>
                    {filter.id !== 'all' && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Biodiversity: {filter.id.replace('-', ' ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{count}</p>
                  <p className="text-xs text-gray-400">colonies</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / counts.all) * 100}%`,
                    backgroundColor: filter.color
                  }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="glass-panel p-3 rounded-lg bg-ocean/10 border border-ocean/30 mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-ocean" />
          <p className="text-xs font-bold text-ocean">Map Legend</p>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Species richness indicates biodiversity. Higher richness (more species) suggests healthier, 
          more resilient habitats. Use filters to focus on specific biodiversity levels.
        </p>
      </div>

      {/* Active Filter Info */}
      {activeFilter !== 'all' && (
        <div className="glass-panel p-3 rounded-lg bg-primary/10 border border-primary/30">
          <p className="text-xs text-primary">
            <strong>Active Filter:</strong> Showing {count} colonies with {filters.find(f => f.id === activeFilter)?.label.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapFilter;
