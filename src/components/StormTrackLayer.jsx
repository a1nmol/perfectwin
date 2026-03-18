import React from 'react';
import { Polyline, Circle, Popup, useMap } from 'react-leaflet';
import { bufferColors, exposureDistanceKm } from '../utils/stormConfig.js';

/**
 * StormTrackLayer Component
 * Renders hurricane track polyline and distance buffer circles on Leaflet map
 */
const StormTrackLayer = ({ storm, showBuffers = true, showTrack = true }) => {
  const map = useMap();

  if (!storm || !storm.track || storm.track.length === 0) {
    return null;
  }

  // Convert track to Leaflet format [lat, lng]
  const trackCoords = storm.track.map(point => [point.lat, point.lon]);

  // Calculate center point for buffers (landfall or max intensity point)
  const maxWindPoint = storm.track.reduce((max, point) => 
    point.windKt > max.windKt ? point : max
  , storm.track[0]);

  const centerPoint = [maxWindPoint.lat, maxWindPoint.lon];

  // Fit map bounds to show entire track
  React.useEffect(() => {
    if (trackCoords.length > 0) {
      const bounds = trackCoords.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, L.latLngBounds(trackCoords[0], trackCoords[0]));
      
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [storm.id, map]);

  return (
    <>
      {/* Storm Track Polyline */}
      {showTrack && (
        <Polyline
          positions={trackCoords}
          pathOptions={{
            color: '#ef4444',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 5'
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-lg mb-2">
                Hurricane {storm.name} ({storm.year})
              </h3>
              <p><strong>Category:</strong> {storm.category}</p>
              <p><strong>Max Wind:</strong> {storm.maxWindKt} kt</p>
              <p><strong>Track Points:</strong> {storm.track.length}</p>
              {storm.description && (
                <p className="mt-2 text-xs text-gray-600">{storm.description}</p>
              )}
            </div>
          </Popup>
        </Polyline>
      )}

      {/* Track Points */}
      {showTrack && storm.track.map((point, index) => (
        <Circle
          key={`track-point-${index}`}
          center={[point.lat, point.lon]}
          radius={2000}
          pathOptions={{
            fillColor: '#ef4444',
            fillOpacity: 0.6,
            color: '#dc2626',
            weight: 1
          }}
        >
          <Popup>
            <div className="text-xs">
              <p><strong>Time:</strong> {new Date(point.time).toLocaleString()}</p>
              <p><strong>Wind:</strong> {point.windKt} kt</p>
              <p><strong>Position:</strong> {point.lat.toFixed(2)}°N, {Math.abs(point.lon).toFixed(2)}°W</p>
            </div>
          </Popup>
        </Circle>
      ))}

      {/* Distance Buffer Circles */}
      {showBuffers && (
        <>
          {/* 20 km - Very High Exposure */}
          <Circle
            center={centerPoint}
            radius={exposureDistanceKm.veryHigh * 1000}
            pathOptions={{
              fillColor: bufferColors.veryHigh,
              fillOpacity: 0.15,
              color: bufferColors.veryHigh,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold" style={{ color: bufferColors.veryHigh }}>
                  Very High Exposure Zone
                </p>
                <p>Distance: {'<'} {exposureDistanceKm.veryHigh} km</p>
                <p>Exposure Score: 1.0</p>
              </div>
            </Popup>
          </Circle>

          {/* 50 km - High Exposure */}
          <Circle
            center={centerPoint}
            radius={exposureDistanceKm.high * 1000}
            pathOptions={{
              fillColor: bufferColors.high,
              fillOpacity: 0.1,
              color: bufferColors.high,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold" style={{ color: bufferColors.high }}>
                  High Exposure Zone
                </p>
                <p>Distance: {'<'} {exposureDistanceKm.high} km</p>
                <p>Exposure Score: 0.8</p>
              </div>
            </Popup>
          </Circle>

          {/* 100 km - Medium Exposure */}
          <Circle
            center={centerPoint}
            radius={exposureDistanceKm.medium * 1000}
            pathOptions={{
              fillColor: bufferColors.medium,
              fillOpacity: 0.08,
              color: bufferColors.medium,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold" style={{ color: bufferColors.medium }}>
                  Medium Exposure Zone
                </p>
                <p>Distance: {'<'} {exposureDistanceKm.medium} km</p>
                <p>Exposure Score: 0.5</p>
              </div>
            </Popup>
          </Circle>

          {/* 150 km - Low Exposure */}
          <Circle
            center={centerPoint}
            radius={exposureDistanceKm.low * 1000}
            pathOptions={{
              fillColor: bufferColors.low,
              fillOpacity: 0.05,
              color: bufferColors.low,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold" style={{ color: bufferColors.low }}>
                  Low Exposure Zone
                </p>
                <p>Distance: {'<'} {exposureDistanceKm.low} km</p>
                <p>Exposure Score: 0.2</p>
              </div>
            </Popup>
          </Circle>
        </>
      )}

      {/* Legend */}
      <div className="leaflet-bottom leaflet-right" style={{ pointerEvents: 'none' }}>
        <div className="leaflet-control" style={{ 
          pointerEvents: 'auto',
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          marginRight: '10px',
          marginBottom: '10px',
          minWidth: '200px'
        }}>
          <h4 className="text-sm font-bold text-white mb-2">
            Hurricane {storm.name} ({storm.year})
          </h4>
          <div className="text-xs text-gray-300 space-y-1">
            <div className="flex items-center gap-2">
              <div style={{ 
                width: '20px', 
                height: '3px', 
                backgroundColor: '#ef4444',
                border: '1px dashed #dc2626'
              }}></div>
              <span>Storm Track</span>
            </div>
            {showBuffers && (
              <>
                <div className="flex items-center gap-2">
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: bufferColors.veryHigh,
                    opacity: 0.6,
                    borderRadius: '2px'
                  }}></div>
                  <span>{'<'} 20 km (Very High)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: bufferColors.high,
                    opacity: 0.6,
                    borderRadius: '2px'
                  }}></div>
                  <span>{'<'} 50 km (High)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: bufferColors.medium,
                    opacity: 0.6,
                    borderRadius: '2px'
                  }}></div>
                  <span>{'<'} 100 km (Medium)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: bufferColors.low,
                    opacity: 0.6,
                    borderRadius: '2px'
                  }}></div>
                  <span>{'<'} 150 km (Low)</span>
                </div>
              </>
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
            <p>Category {storm.category} • {storm.maxWindKt} kt</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StormTrackLayer;
