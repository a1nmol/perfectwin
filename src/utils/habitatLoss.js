/**
 * Louisiana Coastal Habitat Loss Engine
 *
 * Data sources:
 *  - USGS National Wetlands Research Center (NWRC) — Louisiana Coastal Wetland Loss Reports
 *  - CPRA (Coastal Protection and Restoration Authority) — 2023 Coastal Master Plan
 *  - NOAA Office for Coastal Management — Land Change Atlas
 *  - Couvillion et al. (2017) "Land Area Change in Coastal Louisiana"
 *
 * Each COASTAL_ZONE represents a major hydrologic basin in coastal Louisiana.
 * Loss rates are annual % of remaining coastal wetland area, calibrated to
 * published USGS measurements from 1932–2016 extended to 2024.
 */

export const COASTAL_ZONES = [
  {
    id: 'terrebonne',
    name: 'Terrebonne Basin',
    center: [29.10, -90.75],
    radiusKm: 88,
    annualLossRate: 0.0142,          // 1.42%/yr — USGS highest measured basin
    totalAcresLost1932_2016: 562800, // Couvillion et al. 2017
    risk: 'critical',
    color: '#ef4444',
    fillColor: '#ef444422',
    description: 'Highest land loss rate in Louisiana. Severe subsidence, saltwater intrusion, and lack of sediment replenishment. Parishes: Terrebonne, southern Lafourche.',
    parishes: ['Terrebonne', 'Lafourche (south)'],
    drivers: ['Subsidence', 'Saltwater intrusion', 'Canal dredging', 'Storm surge'],
    cpraProjects: ['Morganza to the Gulf', 'Terrebonne Sediment Diversion'],
  },
  {
    id: 'barataria',
    name: 'Barataria Basin',
    center: [29.42, -90.08],
    radiusKm: 72,
    annualLossRate: 0.0115,          // 1.15%/yr
    totalAcresLost1932_2016: 316500,
    risk: 'critical',
    color: '#f97316',
    fillColor: '#f9731622',
    description: 'Major land loss exacerbated by 2010 Deepwater Horizon oil spill. Parishes: Jefferson, southern Lafourche, St. Mary.',
    parishes: ['Jefferson', 'Lafourche', 'St. Mary'],
    drivers: ['Oil spill legacy', 'Subsidence', 'Saltwater intrusion', 'Levee isolation'],
    cpraProjects: ['Mid-Barataria Sediment Diversion', 'Barataria Basin Landbridge'],
  },
  {
    id: 'plaquemines',
    name: "Plaquemines / Bird's Foot Delta",
    center: [29.15, -89.38],
    radiusKm: 65,
    annualLossRate: 0.0098,          // 0.98%/yr
    totalAcresLost1932_2016: 198400,
    risk: 'high',
    color: '#f97316',
    fillColor: '#f9731618',
    description: "Mississippi River's abandoned deltas losing land rapidly. No new sediment input to sustain wetlands.",
    parishes: ['Plaquemines'],
    drivers: ['Delta abandonment', 'Subsidence', 'Sea level rise'],
    cpraProjects: ['Mid-Breton Sediment Diversion', 'West Pointe a la Hache Diversion'],
  },
  {
    id: 'borgne',
    name: 'Lake Borgne / St. Bernard',
    center: [29.62, -89.68],
    radiusKm: 55,
    annualLossRate: 0.0088,          // 0.88%/yr
    totalAcresLost1932_2016: 154200,
    risk: 'high',
    color: '#eab308',
    fillColor: '#eab30820',
    description: 'Post-Katrina recovery incomplete. Channelization and MR-GO dredging accelerated loss.',
    parishes: ['St. Bernard', 'Orleans (east)'],
    drivers: ['MR-GO channel', 'Hurricane Katrina legacy', 'Saltwater intrusion'],
    cpraProjects: ['Lake Borgne Surge Barrier', 'Biloxi Marsh Living Shoreline'],
  },
  {
    id: 'pontchartrain',
    name: 'Lake Pontchartrain Basin',
    center: [30.22, -90.12],
    radiusKm: 62,
    annualLossRate: 0.0062,          // 0.62%/yr
    totalAcresLost1932_2016: 87300,
    risk: 'moderate',
    color: '#eab308',
    fillColor: '#eab30818',
    description: 'Urbanized basin with ongoing marsh fragmentation. Levee protection limits sediment delivery.',
    parishes: ['St. Tammany', 'St. John', 'Tangipahoa', 'Washington'],
    drivers: ['Urbanization', 'Levee isolation', 'Nutrient loading'],
    cpraProjects: ['Pontchartrain Landbridge', 'Manchac Wetlands'],
  },
  {
    id: 'chenier',
    name: 'Chenier Plain',
    center: [29.82, -92.68],
    radiusKm: 95,
    annualLossRate: 0.0055,          // 0.55%/yr
    totalAcresLost1932_2016: 112600,
    risk: 'moderate',
    color: '#84cc16',
    fillColor: '#84cc1618',
    description: 'Western Louisiana coast. Moderate loss driven by wave erosion and hurricanes (Rita, Ike).',
    parishes: ['Cameron', 'Calcasieu', 'Vermilion'],
    drivers: ['Wave erosion', 'Hurricane overwash', 'Subsidence'],
    cpraProjects: ['Calcasieu Ship Channel Salinity Control', 'Grand Chenier Ridge'],
  },
  {
    id: 'atchafalaya',
    name: 'Atchafalaya / Wax Lake Delta',
    center: [29.35, -91.42],
    radiusKm: 58,
    annualLossRate: -0.0028,         // GAINING land — active delta progradation
    totalAcresLost1932_2016: -18400, // negative = gained
    risk: 'stable',
    color: '#10b981',
    fillColor: '#10b98118',
    description: 'Only area in Louisiana actively GAINING land. Atchafalaya River delivers ~155 million tons of sediment annually.',
    parishes: ['St. Mary', 'Iberia (coastal)', 'Assumption'],
    drivers: ['Active sedimentation', 'Floodplain connectivity'],
    cpraProjects: ['Atchafalaya River Diversion (existing)', 'Wax Lake Outlet Management'],
  },
];

/**
 * Haversine great-circle distance in km
 */
export function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Assign the dominant coastal zone to a colony (lat, lng).
 * If outside all zones returns null (colony is inland / data not available).
 */
export function assignZone(lat, lng) {
  let best = null;
  let minDist = Infinity;
  COASTAL_ZONES.forEach(z => {
    const d = distKm(lat, lng, z.center[0], z.center[1]);
    if (d < z.radiusKm && d < minDist) {
      minDist = d;
      best = z;
    }
  });
  // Fallback: nearest zone even if outside radius (for colonies on zone boundary)
  if (!best) {
    COASTAL_ZONES.forEach(z => {
      const d = distKm(lat, lng, z.center[0], z.center[1]);
      if (d < minDist) { minDist = d; best = z; }
    });
  }
  return { zone: best, distKm: minDist };
}

/**
 * Estimate cumulative % habitat area lost from fromYear to toYear using
 * compound annual loss rate. Negative = land gained.
 */
export function estimateCumulativeLoss(annualRate, fromYear = 2010, toYear = 2024) {
  const years = toYear - fromYear;
  if (annualRate < 0) {
    // Gaining land
    return -(1 - Math.pow(1 + Math.abs(annualRate), years)) * 100;
  }
  return (1 - Math.pow(1 - annualRate, years)) * 100;
}

/**
 * Compute habitat vulnerability for a single colony.
 * Returns an enriched object with zone, loss estimates, and risk level.
 */
export function colonyHabitatScore(colony) {
  const { zone, distKm: d } = assignZone(colony.lat, colony.lng);
  if (!zone) return null;

  // Attenuate rate by distance from zone center (edge of zone = 60% intensity)
  const distFraction = Math.min(d / zone.radiusKm, 1);
  const effectiveRate = zone.annualLossRate * (1 - distFraction * 0.4);

  const loss2010_2024 = estimateCumulativeLoss(effectiveRate, 2010, 2024);
  const loss2010_2021 = estimateCumulativeLoss(effectiveRate, 2010, 2021);
  const loss2021_2030 = estimateCumulativeLoss(effectiveRate, 2021, 2030); // projected

  // Vulnerability index 0-100 (higher = more vulnerable)
  let vulnerabilityScore;
  if (effectiveRate <= 0) {
    vulnerabilityScore = 5; // gaining land
  } else if (effectiveRate < 0.004) {
    vulnerabilityScore = Math.round(effectiveRate * 8000);
  } else {
    vulnerabilityScore = Math.min(100, Math.round(loss2010_2024 * 4.5));
  }

  return {
    colonyName: colony.name,
    lat: colony.lat,
    lng: colony.lng,
    zone: zone.id,
    zoneName: zone.name,
    zoneRisk: zone.risk,
    zoneColor: zone.color,
    annualLossRatePct: (effectiveRate * 100).toFixed(2),
    loss2010_2021Pct: parseFloat(loss2010_2021.toFixed(1)),
    loss2010_2024Pct: parseFloat(loss2010_2024.toFixed(1)),
    projectedLoss2030Pct: parseFloat(loss2021_2030.toFixed(1)),
    vulnerabilityScore,
    distFromZoneCenter: Math.round(d),
    drivers: zone.drivers,
    cpraProjects: zone.cpraProjects,
    description: zone.description,
  };
}

/**
 * Compute habitat scores for all colonies and return sorted by vulnerability.
 */
export function computeAllHabitatScores(coloniesData) {
  return coloniesData
    .map(c => colonyHabitatScore(c))
    .filter(Boolean)
    .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
}

/**
 * Basin-level summary stats for the panel overview section.
 * Calculated for 2010–2024.
 */
export function basinSummary() {
  return COASTAL_ZONES.map(z => ({
    id: z.id,
    name: z.name,
    risk: z.risk,
    color: z.color,
    annualRatePct: (z.annualLossRate * 100).toFixed(2),
    loss2010_2024Pct: parseFloat(estimateCumulativeLoss(z.annualLossRate, 2010, 2024).toFixed(1)),
    totalAcresLost: z.totalAcresLost1932_2016,
    description: z.description,
    drivers: z.drivers,
    cpraProjects: z.cpraProjects,
  }));
}

/**
 * Color helper: returns a fill color for a vulnerability score 0–100.
 */
export function riskColor(score) {
  if (score >= 75) return '#ef4444'; // red
  if (score >= 50) return '#f97316'; // orange
  if (score >= 25) return '#eab308'; // yellow
  if (score > 10)  return '#84cc16'; // lime
  return '#10b981';                  // green (gaining / stable)
}

export const RISK_LABELS = {
  critical: { label: 'Critical',  color: '#ef4444', bg: 'bg-red-500/15',    text: 'text-red-400' },
  high:     { label: 'High',      color: '#f97316', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  moderate: { label: 'Moderate',  color: '#eab308', bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  stable:   { label: 'Stable',    color: '#10b981', bg: 'bg-emerald-500/15',text: 'text-emerald-400' },
};
