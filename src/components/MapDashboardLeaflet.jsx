import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Circle } from 'react-leaflet';
import { MapPin, Layers, ZoomIn, ZoomOut, Users } from 'lucide-react';
import { getSpeciesName } from '../utils/speciesMapping';
import { calculateHQI, calculateRecoveryTrend } from '../utils/hqiCalculator';
import StormTrackLayer from './StormTrackLayer';
import { COASTAL_ZONES, colonyHabitatScore, riskColor } from '../utils/habitatLoss';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { checkBadges, XP, getLevelInfo } from '../context/GameContext';
import 'leaflet/dist/leaflet.css';

// Component to handle map controls
function MapController({ onZoomIn, onZoomOut, onReset }) {
  const map = useMap();

  useEffect(() => {
    onZoomIn.current = () => map.zoomIn();
    onZoomOut.current = () => map.zoomOut();
    onReset.current = () => map.setView([29.9511, -90.0715], 7);
    // Fix black screen on hard refresh — Leaflet needs to recalculate container size
    setTimeout(() => map.invalidateSize(), 150);
  }, [map, onZoomIn, onZoomOut, onReset]);

  return null;
}

const MapDashboardLeaflet = ({ coloniesData, selectedYear, onColonySelect, selectedStorm, showStormImpact, detectionGeoPoints = [], showHabitatLayer = false }) => {
  const [mapStats, setMapStats]           = useState({ total: 0, visible: 0 });
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityObs, setCommunityObs]   = useState([]);
  const { user, profile, refreshProfile } = useAuth();

  // Load community observations
  useEffect(() => {
    if (!showCommunity) return;
    supabase
      .from('observations')
      .select('id, species, count, colony_name, lat, lng, created_at, profiles(username)')
      .not('lat', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => setCommunityObs(data || []));
  }, [showCommunity]);

  async function handleAdoptColony(colonyName) {
    if (!user || !profile) return;
    const current = profile?.adopted_colonies || [];
    if (current.includes(colonyName)) return;
    const adopted = [...current, colonyName];
    const newXp    = (profile?.xp || 0) + XP.ADOPT_COLONY;
    const newLevel = getLevelInfo(newXp).level;

    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ adopted_colonies: adopted, xp: newXp, level: newLevel })
      .eq('id', user.id)
      .select();

    if (error || !updated?.length) {
      await supabase
        .from('profiles')
        .upsert({ id: user.id, adopted_colonies: adopted, xp: newXp, level: newLevel }, { onConflict: 'id' });
    }

    const updatedProfile = { ...profile, adopted_colonies: adopted, xp: newXp };
    const badges = await checkBadges(user.id, updatedProfile, refreshProfile);
    if (badges.length === 0) await refreshProfile();
  }

  // Pre-compute habitat scores per colony (only when habitat layer is active)
  const habitatScores = useMemo(() => {
    if (!showHabitatLayer || !coloniesData?.length) return {};
    const map = {};
    coloniesData.forEach(c => {
      const score = colonyHabitatScore(c);
      if (score) map[c.name] = score;
    });
    return map;
  }, [showHabitatLayer, coloniesData]);
  const zoomInRef = React.useRef();
  const zoomOutRef = React.useRef();
  const resetRef = React.useRef();

  // Memoize color calculation to prevent re-creation
  const getMarkerColor = useCallback((speciesCount) => {
    if (speciesCount >= 16) return '#10b981'; // Emerald green - Very High
    if (speciesCount >= 11) return '#f97316'; // Orange - High
    if (speciesCount >= 6) return '#eab308';  // Yellow - Medium
    return '#9ca3af'; // Gray - Low
  }, []);

  // Memoize size calculation to prevent re-creation
  const getMarkerSize = useCallback((birds) => {
    const minSize = 8;
    const maxSize = 40;
    const maxBirds = 75000;
    const size = minSize + ((birds / maxBirds) * (maxSize - minSize));
    return Math.min(Math.max(size, minSize), maxSize);
  }, []);

  // Memoize processed colonies to prevent unnecessary recalculations
  const processedColonies = useMemo(() => {
    return coloniesData.map(colony => {
      // Get data for selected year or most recent
      let data = selectedYear 
        ? colony.history.find(h => h.year === selectedYear)
        : colony.history[colony.history.length - 1];
      
      if (!data) {
        data = colony.history[colony.history.length - 1];
      }

      const hqi = calculateHQI(data.nests, data.birds, data.species_count);
      let trend = '→ Stable';
      if (colony.history.length > 1) {
        const trendData = calculateRecoveryTrend(colony, 2010, 2021);
        trend = `${trendData.direction} ${trendData.trend}`;
      }

      const speciesNames = colony.top_species.slice(0, 3).map(getSpeciesName);

      return {
        ...colony,
        currentData: data,
        hqi,
        trend,
        speciesNames,
        color: getMarkerColor(data.species_count),
        size: getMarkerSize(data.birds),
      };
    });
  }, [coloniesData, selectedYear, getMarkerColor, getMarkerSize]);

  // Update map stats only when length changes
  useEffect(() => {
    setMapStats({
      total: coloniesData.length,
      visible: processedColonies.length
    });
  }, [coloniesData.length, processedColonies.length]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <MapContainer
        center={[29.9511, -90.0715]}
        zoom={7}
        className="w-full h-full rounded-xl overflow-hidden shadow-2xl"
        style={{ background: '#1e293b' }}
      >
        {/* Satellite tile layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          maxZoom={18}
        />
        {/* Labels overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=''
          maxZoom={18}
        />
        
        {/* Habitat loss zone overlays */}
        {showHabitatLayer && COASTAL_ZONES.map(zone => (
          <Circle
            key={`zone-${zone.id}`}
            center={zone.center}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              fillColor: zone.color,
              fillOpacity: 0.10,
              color: zone.color,
              weight: 1.5,
              opacity: 0.5,
              dashArray: zone.annualLossRate <= 0 ? null : '6 4',
            }}
          >
            <Popup maxWidth={260} className="colony-popup">
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-white text-sm">{zone.name}</p>
                <p className="text-gray-300">{zone.description}</p>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual loss rate:</span>
                  <span className="font-semibold" style={{ color: zone.color }}>
                    {zone.annualLossRate <= 0
                      ? `+${Math.abs(zone.annualLossRate * 100).toFixed(2)}% (gaining)`
                      : `−${(zone.annualLossRate * 100).toFixed(2)}%`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {zone.drivers.map(d => (
                    <span key={d} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{d}</span>
                  ))}
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Colony markers - optimized for performance */}
        {processedColonies.map((colony) => {
          const hscore = habitatScores[colony.name];
          const markerColor = showHabitatLayer && hscore
            ? riskColor(hscore.vulnerabilityScore)
            : colony.color;
          return (
          <CircleMarker
            key={`${colony.name}-${selectedYear || 'all'}`}
            center={[colony.lat, colony.lng]}
            radius={colony.size / 2}
            pathOptions={{
              fillColor: markerColor,
              fillOpacity: 0.8,
              color: '#fff',
              weight: 2,
              opacity: 0.9
            }}
            eventHandlers={{
              click: () => {
                if (onColonySelect) {
                  onColonySelect(colony);
                }
              }
            }}
          >
            <Popup 
              closeButton={true}
              autoPan={true}
              keepInView={true}
              maxWidth={320}
              minWidth={280}
              className="colony-popup"
            >
              <div className="text-sm">
                <h3 className="font-bold text-lg mb-3 text-white border-b border-gray-600 pb-2">
                  {colony.name}
                </h3>
                <div className="space-y-2 text-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Birds:</span>
                    <span className="font-semibold text-white">{colony.currentData.birds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Nests:</span>
                    <span className="font-semibold text-white">{colony.currentData.nests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Species Richness:</span>
                    <span className="font-semibold text-white">{colony.currentData.species_count}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Year:</span>
                    <span className="font-semibold text-white">{colony.currentData.year}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-xs text-gray-400 mb-2">Top Species:</p>
                  <div className="flex flex-wrap gap-1">
                    {colony.speciesNames.map((species, i) => (
                      <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                        {species}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Recovery Trend:</span>
                      <span className="font-semibold text-white">{colony.trend}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Nesting Efficiency:</span>
                      <span className="font-semibold text-primary">
                        {colony.currentData.birds > 0 ? Math.round((colony.currentData.nests / colony.currentData.birds) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">HQI Score:</span>
                      <span className="font-bold text-primary">
                        {colony.hqi.score.toFixed(2)} ({colony.hqi.rating})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adopt-a-Colony button */}
                {user && (() => {
                  const adopted = profile?.adopted_colonies || [];
                  const isAdopted = adopted.includes(colony.name);
                  return (
                    <button
                      onClick={() => handleAdoptColony(colony.name)}
                      disabled={isAdopted}
                      style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: isAdopted ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.4)',
                        background: isAdopted ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.15)',
                        color: isAdopted ? '#6ee7b7' : '#10b981',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isAdopted ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isAdopted ? '🏡 Colony Adopted!' : '🏡 Adopt this Colony (+15 XP)'}
                    </button>
                  );
                })()}
              </div>
            </Popup>
          </CircleMarker>
          );
        })}

        {/* Community citizen sightings layer */}
        {showCommunity && communityObs.map((obs, i) => (
          obs.lat && obs.lng ? (
            <CircleMarker
              key={`comm-${obs.id || i}`}
              center={[obs.lat, obs.lng]}
              radius={7}
              pathOptions={{
                fillColor: '#0ea5e9',
                fillOpacity: 0.85,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
              }}
            >
              <Popup maxWidth={240} minWidth={190} className="colony-popup">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600">
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
                    <span className="font-bold text-white">{obs.species}</span>
                  </div>
                  <div className="space-y-1 text-gray-200 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Count:</span>
                      <span className="font-semibold text-white">{obs.count}</span>
                    </div>
                    {obs.colony_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Colony:</span>
                        <span className="font-semibold text-white">{obs.colony_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">By:</span>
                      <span className="font-semibold text-sky-400">@{obs.profiles?.username || 'citizen'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(obs.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-center">
                    <span className="text-[10px] text-sky-400 font-semibold">👤 Citizen Science</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ) : null
        ))}

        {/* AI Detection geo-pins */}
        {detectionGeoPoints.map((pin, i) => (
          <CircleMarker
            key={`det-${i}-${pin.lat}-${pin.lng}`}
            center={[pin.lat, pin.lng]}
            radius={9}
            pathOptions={{
              fillColor: pin.color || '#f59e0b',
              fillOpacity: 0.9,
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              dashArray: '4 2',
            }}
          >
            <Popup maxWidth={240} minWidth={200} className="colony-popup">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pin.color }} />
                  <span className="font-bold text-white text-base">{pin.speciesName}</span>
                </div>
                <div className="space-y-1.5 text-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Detections:</span>
                    <span className="font-semibold text-white">{pin.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="font-semibold text-primary">{(pin.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lat:</span>
                    <span className="font-mono text-xs text-white">{pin.lat.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lng:</span>
                    <span className="font-mono text-xs text-white">{pin.lng.toFixed(5)}</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-amber-400 font-medium text-center">
                  AI Detection Pin
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <MapController
          onZoomIn={zoomInRef}
          onZoomOut={zoomOutRef}
          onReset={resetRef}
        />
        
        {/* Storm Track Layer
            - Track is always rendered when a storm is selected (pre-render on panel open / dropdown change)
            - Exposure buffer circles only appear after "Run Impact Analysis" sets showStormImpact=true
        */}
        {selectedStorm && (
          <StormTrackLayer 
            storm={selectedStorm}
            showBuffers={showStormImpact}
            showTrack={true}
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <button onClick={() => zoomInRef.current?.()} className="glass-button p-3 rounded-lg hover:scale-105 transition-transform" title="Zoom In">
          <ZoomIn className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => zoomOutRef.current?.()} className="glass-button p-3 rounded-lg hover:scale-105 transition-transform" title="Zoom Out">
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => resetRef.current?.()} className="glass-button p-3 rounded-lg hover:scale-105 transition-transform" title="Reset View">
          <Layers className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => setShowCommunity(v => !v)}
          className={`p-3 rounded-lg hover:scale-105 transition-all ${showCommunity ? 'bg-sky-500/30 border border-sky-500/50' : 'glass-button'}`}
          title="Toggle Citizen Sightings"
        >
          <Users className={`w-5 h-5 ${showCommunity ? 'text-sky-400' : 'text-white'}`} />
        </button>
      </div>

      {/* Map Stats */}
      <div className="absolute bottom-4 left-4 glass-panel px-4 py-2 rounded-lg z-[1000]">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-gray-300">
            Showing <span className="text-primary font-bold">{mapStats.visible}</span> of{' '}
            <span className="font-bold">{mapStats.total}</span> colonies
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass-panel p-3 rounded-lg max-w-[180px] z-[1000]">
        {showHabitatLayer ? (
          <>
            <h3 className="text-xs font-bold text-amber-400 mb-2">Habitat Loss Risk</h3>
            <div className="space-y-1 text-xs">
              {[['#ef4444','Critical (>15%/yr)'],['#f97316','High (10–15%)'],['#eab308','Moderate (5–10%)'],['#84cc16','Low (<5%)'],['#10b981','Stable / Gaining']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                  <span className="text-gray-300 text-[10px]">{l}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-500">Zones = USGS/CPRA basins</p>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xs font-bold text-white mb-2">Species Richness</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-400" /><span className="text-gray-300 text-[10px]">Low (1–5 sp.)</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="text-gray-300 text-[10px]">Medium (6–10)</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /><span className="text-gray-300 text-[10px]">High (11–15)</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-primary" /><span className="text-gray-300 text-[10px]">Very High (16+)</span></div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] text-gray-400">Size = bird population</p>
            </div>
            {showCommunity && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
                  <span className="text-gray-300 text-[10px]">Citizen sightings</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MapDashboardLeaflet;
