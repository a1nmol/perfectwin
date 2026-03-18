/**
 * Geographic Utility Functions
 * Haversine distance and polyline distance calculations
 */

import { exposureDistanceKm } from './stormConfig.js';

/**
 * Calculate haversine distance between two points
 * @param {number} lat1 - Latitude of point 1 (degrees)
 * @param {number} lon1 - Longitude of point 1 (degrees)
 * @param {number} lat2 - Latitude of point 2 (degrees)
 * @param {number} lon2 - Longitude of point 2 (degrees)
 * @returns {number} Distance in kilometers
 */
export function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate minimum distance from a point to a polyline (storm track)
 * @param {Object} point - {lat, lon}
 * @param {Array} trackCoords - Array of {lat, lon, time, windKt}
 * @returns {number} Minimum distance in kilometers
 */
export function minDistanceFromPointToPathKm(point, trackCoords) {
  if (!trackCoords || trackCoords.length === 0) {
    return Infinity;
  }
  
  if (trackCoords.length === 1) {
    return haversineDistanceKm(point.lat, point.lon, trackCoords[0].lat, trackCoords[0].lon);
  }
  
  let minDistance = Infinity;
  
  // Check distance to each track segment
  for (let i = 0; i < trackCoords.length - 1; i++) {
    const segmentDistance = distanceToSegment(
      point,
      trackCoords[i],
      trackCoords[i + 1]
    );
    minDistance = Math.min(minDistance, segmentDistance);
  }
  
  return minDistance;
}

/**
 * Calculate distance from point to line segment
 * @param {Object} point - {lat, lon}
 * @param {Object} segStart - {lat, lon}
 * @param {Object} segEnd - {lat, lon}
 * @returns {number} Distance in kilometers
 */
function distanceToSegment(point, segStart, segEnd) {
  // Distance to start point
  const distToStart = haversineDistanceKm(point.lat, point.lon, segStart.lat, segStart.lon);
  
  // Distance to end point
  const distToEnd = haversineDistanceKm(point.lat, point.lon, segEnd.lat, segEnd.lon);
  
  // Length of segment
  const segmentLength = haversineDistanceKm(segStart.lat, segStart.lon, segEnd.lat, segEnd.lon);
  
  // If segment is very short, return distance to start
  if (segmentLength < 0.001) {
    return distToStart;
  }
  
  // Calculate projection using dot product approximation
  // For small distances, we can use Euclidean approximation
  const dx = segEnd.lon - segStart.lon;
  const dy = segEnd.lat - segStart.lat;
  const px = point.lon - segStart.lon;
  const py = point.lat - segStart.lat;
  
  const dotProduct = px * dx + py * dy;
  const segmentLengthSq = dx * dx + dy * dy;
  
  let t = dotProduct / segmentLengthSq;
  t = Math.max(0, Math.min(1, t)); // Clamp to [0, 1]
  
  // Find closest point on segment
  const closestLat = segStart.lat + t * dy;
  const closestLon = segStart.lon + t * dx;
  
  // Return distance to closest point
  return haversineDistanceKm(point.lat, point.lon, closestLat, closestLon);
}

/**
 * Classify exposure score based on minimum distance
 * @param {number} minDistanceKm - Minimum distance to storm track
 * @param {Object} config - Distance thresholds from stormConfig
 * @returns {number} Exposure score (0.0 to 1.0)
 */
export function classifyExposureScore(minDistanceKm, config = exposureDistanceKm) {
  if (minDistanceKm < config.veryHigh) return 1.0;
  if (minDistanceKm < config.high) return 0.8;
  if (minDistanceKm < config.medium) return 0.5;
  if (minDistanceKm < config.low) return 0.2;
  return 0.0;
}

/**
 * Calculate bounding box for a set of coordinates
 * @param {Array} coords - Array of {lat, lon}
 * @returns {Object} {minLat, maxLat, minLon, maxLon}
 */
export function calculateBounds(coords) {
  if (!coords || coords.length === 0) {
    return { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 };
  }
  
  let minLat = coords[0].lat;
  let maxLat = coords[0].lat;
  let minLon = coords[0].lon;
  let maxLon = coords[0].lon;
  
  for (const coord of coords) {
    minLat = Math.min(minLat, coord.lat);
    maxLat = Math.max(maxLat, coord.lat);
    minLon = Math.min(minLon, coord.lon);
    maxLon = Math.max(maxLon, coord.lon);
  }
  
  return { minLat, maxLat, minLon, maxLon };
}

/**
 * Check if a point is within a bounding box (with buffer)
 * @param {Object} point - {lat, lon}
 * @param {Object} bounds - {minLat, maxLat, minLon, maxLon}
 * @param {number} bufferKm - Buffer distance in km
 * @returns {boolean}
 */
export function isPointInBounds(point, bounds, bufferKm = 200) {
  // Rough conversion: 1 degree ≈ 111 km at equator
  const bufferDeg = bufferKm / 111;
  
  return (
    point.lat >= bounds.minLat - bufferDeg &&
    point.lat <= bounds.maxLat + bufferDeg &&
    point.lon >= bounds.minLon - bufferDeg &&
    point.lon <= bounds.maxLon + bufferDeg
  );
}

export default {
  haversineDistanceKm,
  minDistanceFromPointToPathKm,
  classifyExposureScore,
  calculateBounds,
  isPointInBounds
};
