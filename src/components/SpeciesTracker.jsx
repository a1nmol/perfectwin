import React, { useState, useEffect } from 'react';
import { Search, MapPin, TrendingUp, TrendingDown, Minus, Bird } from 'lucide-react';
import { getSpeciesName, categoryColors, getSpeciesCategory } from '../utils/speciesMapping';
import { getSpeciesTrackingData } from '../utils/dataProcessor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

const SpeciesTracker = ({ processedData, allSpecies, onColonySelect }) => {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [trackingData, setTrackingData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpecies, setFilteredSpecies] = useState([]);

  useEffect(() => {
    if (allSpecies && allSpecies.length > 0) {
      setFilteredSpecies(allSpecies);
      // Set default to most common species
      setSelectedSpecies('LAGU'); // Laughing Gull
    }
  }, [allSpecies]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allSpecies.filter(species => {
        const fullName = getSpeciesName(species).toLowerCase();
        const code = species.toLowerCase();
        const term = searchTerm.toLowerCase();
        return fullName.includes(term) || code.includes(term);
      });
      setFilteredSpecies(filtered);
    } else {
      setFilteredSpecies(allSpecies);
    }
  }, [searchTerm, allSpecies]);

  useEffect(() => {
    if (selectedSpecies && processedData) {
      const data = getSpeciesTrackingData(processedData, selectedSpecies);
      setTrackingData(data);
    }
  }, [selectedSpecies, processedData]);

  const getPopulationTrend = () => {
    if (trackingData.length < 2) return 'stable';
    
    const firstYear = trackingData[0];
    const lastYear = trackingData[trackingData.length - 1];
    
    const totalFirst = trackingData
      .filter(d => d.year === firstYear.year)
      .reduce((sum, d) => sum + d.birds, 0);
    
    const totalLast = trackingData
      .filter(d => d.year === lastYear.year)
      .reduce((sum, d) => sum + d.birds, 0);
    
    const change = ((totalLast - totalFirst) / totalFirst) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  };

  const getTrendIcon = () => {
    const trend = getPopulationTrend();
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-primary" />;
    if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-coral" />;
    return <Minus className="w-5 h-5 text-yellow-500" />;
  };

  const getYearlyTotals = () => {
    const yearlyTotals = {};
    trackingData.forEach(record => {
      if (!yearlyTotals[record.year]) {
        yearlyTotals[record.year] = { year: record.year, birds: 0, nests: 0, colonies: 0 };
      }
      yearlyTotals[record.year].birds += record.birds;
      yearlyTotals[record.year].nests += record.nests;
      yearlyTotals[record.year].colonies += 1;
    });
    return Object.values(yearlyTotals).sort((a, b) => a.year - b.year);
  };

  const getTopColonies = () => {
    const colonyTotals = {};
    trackingData.forEach(record => {
      if (!colonyTotals[record.colony]) {
        colonyTotals[record.colony] = {
          colony: record.colony,
          lat: record.lat,
          lng: record.lng,
          totalBirds: 0,
          totalNests: 0,
          years: new Set()
        };
      }
      colonyTotals[record.colony].totalBirds += record.birds;
      colonyTotals[record.colony].totalNests += record.nests;
      colonyTotals[record.colony].years.add(record.year);
    });
    
    return Object.values(colonyTotals)
      .map(c => ({ ...c, years: c.years.size }))
      .sort((a, b) => b.totalBirds - a.totalBirds)
      .slice(0, 10);
  };

  const category = selectedSpecies ? getSpeciesCategory(selectedSpecies) : 'other';
  const color = categoryColors[category];

  return (
    <div className="command-panel space-y-6 overflow-y-auto custom-scrollbar max-h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bird className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-white">Species Tracker</h2>
          <p className="text-sm text-gray-400">Track individual species across Louisiana</p>
        </div>
      </div>

      {/* Species Search & Selection */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search species by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="glass-panel p-3 rounded-lg max-h-48 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            {filteredSpecies.slice(0, 20).map(species => {
              const cat = getSpeciesCategory(species);
              const col = categoryColors[cat];
              const isSelected = species === selectedSpecies;
              
              return (
                <button
                  key={species}
                  onClick={() => setSelectedSpecies(species)}
                  className={`p-2 rounded-lg text-left transition-all ${
                    isSelected ? 'bg-white/20 border-2' : 'glass-button'
                  }`}
                  style={{ borderColor: isSelected ? col : 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: col }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{species}</p>
                      <p className="text-xs text-gray-400 truncate">{getSpeciesName(species)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filteredSpecies.length > 20 && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Showing 20 of {filteredSpecies.length} species
            </p>
          )}
        </div>
      </div>

      {/* Selected Species Info */}
      {selectedSpecies && trackingData.length > 0 && (
        <div className="space-y-4 fade-in">
          {/* Species Header */}
          <div className="glass-panel p-4 rounded-lg" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-white">{getSpeciesName(selectedSpecies)}</h3>
                <p className="text-sm text-gray-400">Code: {selectedSpecies}</p>
              </div>
              {getTrendIcon()}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <p className="text-xs text-gray-400">Total Records</p>
                <p className="text-xl font-bold text-white">{trackingData.length}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Colonies</p>
                <p className="text-xl font-bold text-primary">{new Set(trackingData.map(d => d.colony)).size}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Years</p>
                <p className="text-xl font-bold text-ocean">{new Set(trackingData.map(d => d.year)).size}</p>
              </div>
            </div>
          </div>

          {/* Population Trend Chart */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-3">Population Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getYearlyTotals()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="year" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="birds" stroke={color} strokeWidth={2} name="Total Birds" />
                <Line type="monotone" dataKey="nests" stroke="#0ea5e9" strokeWidth={2} name="Total Nests" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Colonies */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-3">Top 10 Colonies for {getSpeciesName(selectedSpecies)}</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {getTopColonies().map((colony, index) => (
                <div
                  key={colony.colony}
                  className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/50 transition-all cursor-pointer"
                  onClick={() => onColonySelect && onColonySelect({ name: colony.colony, lat: colony.lat, lng: colony.lng })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-white">{colony.colony}</span>
                    </div>
                    <span className="text-xs text-gray-400">{colony.years} years</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Birds: </span>
                      <span className="font-bold text-white">{colony.totalBirds.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Nests: </span>
                      <span className="font-bold text-primary">{colony.totalNests.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(colony.totalBirds / getTopColonies()[0].totalBirds) * 100}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="glass-panel p-4 rounded-lg">
            <h3 className="text-sm font-bold text-white mb-3">Geographic Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="lng"
                  name="Longitude"
                  stroke="#9CA3AF"
                  style={{ fontSize: '10px' }}
                />
                <YAxis
                  type="number"
                  dataKey="lat"
                  name="Latitude"
                  stroke="#9CA3AF"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value, name, props) => {
                    if (name === 'birds') return [value, 'Birds'];
                    return [value, name];
                  }}
                  labelFormatter={(value) => `Colony: ${trackingData.find(d => d.lng === value)?.colony || ''}`}
                />
                <Scatter
                  name="Observations"
                  data={trackingData}
                  fill={color}
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Each point represents an observation at a colony location
            </p>
          </div>

          {/* Info */}
          <div className="glass-panel p-3 rounded-lg bg-ocean/10 border border-ocean/30">
            <p className="text-xs text-ocean leading-relaxed">
              <strong>Species Tracking:</strong> This data shows all recorded observations of {getSpeciesName(selectedSpecies)} 
              across Louisiana colonies from 2010-2021. Click on any colony in the "Top 10" list to view it on the map. 
              The population trend indicates {getPopulationTrend()} populations over the study period.
            </p>
          </div>
        </div>
      )}

      {!selectedSpecies && (
        <div className="glass-panel p-8 rounded-lg text-center">
          <Bird className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400">Select a species to view tracking data</p>
        </div>
      )}
    </div>
  );
};

export default SpeciesTracker;
