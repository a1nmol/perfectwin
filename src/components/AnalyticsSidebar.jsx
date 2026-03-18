import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Bird, Egg, Layers as LayersIcon, MapPin, Leaf, Waves, AlertTriangle, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { calculateHQI, identifyCriticalHabitats } from '../utils/hqiCalculator';
import { getSpeciesName } from '../utils/speciesMapping';
import { calculateYearGrowth, calculateNestingEfficiency } from '../utils/dataProcessor';

const AnalyticsSidebar = ({ coloniesData, selectedYear }) => {
  // ── Interpolation helper — returns data for ANY year 2010-2026 ──────────────
  const getColonyDataForYear = (history, targetYear) => {
    const exact = history.find(h => h.year === targetYear);
    if (exact) return { ...exact, isActual: true };

    const known = [...history].sort((a, b) => a.year - b.year);
    if (!known.length) return null;

    // Linear interpolation between two bracketing actual years (≤ 2021 gaps)
    if (targetYear <= 2021) {
      const before = known.filter(h => h.year < targetYear);
      const after  = known.filter(h => h.year > targetYear && h.year <= 2021);
      if (before.length && after.length) {
        const b = before[before.length - 1];
        const a = after[0];
        const r = (targetYear - b.year) / (a.year - b.year);
        return {
          year: targetYear,
          birds:         Math.round(b.birds         + (a.birds         - b.birds)         * r),
          nests:         Math.round(b.nests         + (a.nests         - b.nests)         * r),
          species_count: Math.round(b.species_count + (a.species_count - b.species_count) * r),
          isActual: false, isInterpolated: true,
        };
      }
    }

    // Trend extrapolation with confidence decay for 2022+
    const recent = known.filter(h => h.year >= 2017 && h.year <= 2021);
    if (recent.length >= 2) {
      const f    = recent[0];
      const l    = recent[recent.length - 1];
      const diff = l.year - f.year;
      const yrs  = targetYear - l.year;
      const cf   = Math.max(0.6, 1 - yrs * 0.08);
      return {
        year: targetYear,
        birds:         Math.max(0, Math.round(l.birds         + ((l.birds         - f.birds)         / diff) * yrs * cf)),
        nests:         Math.max(0, Math.round(l.nests         + ((l.nests         - f.nests)         / diff) * yrs * cf)),
        species_count: Math.max(0, Math.round(l.species_count + ((l.species_count - f.species_count) / diff) * yrs * cf)),
        isActual: false, isPrediction: true,
        confidence: Math.round(cf * 100),
      };
    }

    // Fallback: most recent known
    return { ...known[known.length - 1], isActual: false, isInterpolated: true };
  };

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    if (!coloniesData || coloniesData.length === 0) return null;

    // ── Aggregate HQI via interpolation helper ─────────────────────────────
    let aggNests = 0, aggBirds = 0;
    const aggSpeciesSet = new Set();
    let coloniesWithData = 0;

    coloniesData.forEach(colony => {
      const d = selectedYear
        ? getColonyDataForYear(colony.history, selectedYear)
        : colony.history[colony.history.length - 1];
      if (d) {
        aggNests += d.nests;
        aggBirds += d.birds;
        coloniesWithData++;
        colony.top_species.forEach(s => aggSpeciesSet.add(s));
      }
    });

    const hqiResult = calculateHQI(aggNests, aggBirds, aggSpeciesSet.size);
    const hqi = {
      ...hqiResult,
      totalNests: aggNests,
      totalBirds: aggBirds,
      totalSpecies: aggSpeciesSet.size,
      coloniesAnalyzed: coloniesWithData,
      nestingEfficiency: aggBirds > 0 ? Math.round((aggNests / aggBirds) * 100) : 0,
    };

    const criticalHabitats = identifyCriticalHabitats(coloniesData, 5);

    // Trend chart — actual survey data only (historical view)
    const yearlyData = {};
    coloniesData.forEach(colony => {
      colony.history.forEach(record => {
        if (!yearlyData[record.year]) {
          yearlyData[record.year] = { year: record.year, birds: 0, nests: 0, colonies: 0, totalSpecies: 0 };
        }
        yearlyData[record.year].birds        += record.birds;
        yearlyData[record.year].nests        += record.nests;
        yearlyData[record.year].colonies     += 1;
        yearlyData[record.year].totalSpecies += record.species_count;
      });
    });

    const trendData = Object.values(yearlyData).map(data => ({
      ...data,
      avgSpecies: (data.totalSpecies / data.colonies).toFixed(1),
      nestingEfficiency: calculateNestingEfficiency(data.birds, data.nests)
    })).sort((a, b) => a.year - b.year);

    // coloniesDetected — colonies that produced data for the selected year
    const coloniesDetected = coloniesWithData;

    // Species distribution — use helper so all years show populated data
    const speciesCount = {};
    const uniqueSpecies = new Set();
    coloniesData.forEach(colony => {
      const d = selectedYear
        ? getColonyDataForYear(colony.history, selectedYear)
        : colony.history[colony.history.length - 1];
      if (d) {
        colony.top_species.forEach(species => {
          speciesCount[species] = (speciesCount[species] || 0) + 1;
          uniqueSpecies.add(species);
        });
      }
    });

    const topSpecies = Object.entries(speciesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([species, count]) => ({ name: getSpeciesName(species), value: count, code: species }));

    // Restoration priorities — use helper for current & reference year data
    const refYearTarget = Math.max((selectedYear || 2021) - 5, 2010);
    const restorationPriorities = coloniesData
      .map(colony => {
        const currentYearData = selectedYear
          ? getColonyDataForYear(colony.history, selectedYear)
          : colony.history[colony.history.length - 1];
        const referenceData = getColonyDataForYear(colony.history, refYearTarget) || colony.history[0];

        if (!currentYearData || !referenceData || referenceData.nests === 0) return null;

        const change = ((currentYearData.nests - referenceData.nests) / referenceData.nests) * 100;
        return {
          name: colony.name,
          change,
          currentNests:   currentYearData.nests,
          referenceNests: referenceData.nests,
          currentYear:    currentYearData.year ?? selectedYear,
          referenceYear:  referenceData.year   ?? refYearTarget,
          nestsLost:      referenceData.nests - currentYearData.nests,
          priority: change < -50 ? 'High' : change < -20 ? 'Medium' : 'Low',
          lat: colony.lat,
          lng: colony.lng,
          reason: change < -50
            ? 'Critical habitat loss - Storm damage or erosion'
            : change < -20
            ? 'Significant decline - Predation or disturbance'
            : 'Moderate decline - Natural fluctuation'
        };
      })
      .filter(c => c !== null && c.change < -10)
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);

    return { hqi, criticalHabitats, trendData, topSpecies, coloniesDetected, speciesRichness: uniqueSpecies.size, restorationPriorities };
  }, [coloniesData, selectedYear]);

  if (!metrics) {
    return (
      <div className="command-panel h-full flex items-center justify-center">
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#0ea5e9', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const getTrendIcon = (data) => {
    if (data.length < 2) return <Minus className="w-5 h-5" />;
    const first = data[0].birds;
    const last = data[data.length - 1].birds;
    if (last > first * 1.1) return <TrendingUp className="w-5 h-5 text-primary" />;
    if (last < first * 0.9) return <TrendingDown className="w-5 h-5 text-coral" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getTrendPercentage = (data, selectedYear, coloniesData) => {
    if (data.length < 2) return null;
    
    // If a year is selected, check if current year has ACTUAL data
    if (selectedYear) {
      // Check if current year has actual data
      const hasCurrentYearData = coloniesData.some(c => 
        c.history.some(h => h.year === selectedYear)
      );
      
      // Only calculate YoY if current year has actual data
      if (hasCurrentYearData) {
        const currentYearData = data.find(d => d.year === selectedYear);
        
        // Find the nearest previous year with actual data
        const yearsWithData = coloniesData
          .flatMap(c => c.history.map(h => h.year))
          .filter((year, index, self) => self.indexOf(year) === index)
          .sort((a, b) => a - b);
        
        const previousYearsWithData = yearsWithData.filter(y => y < selectedYear);
        
        if (previousYearsWithData.length > 0 && currentYearData) {
          const nearestPreviousYear = previousYearsWithData[previousYearsWithData.length - 1];
          const previousYearData = data.find(d => d.year === nearestPreviousYear);
          
          if (previousYearData && previousYearData.birds > 0) {
            return (((currentYearData.birds - previousYearData.birds) / previousYearData.birds) * 100).toFixed(1);
          }
        }
      }
      
      // If current year doesn't have actual data, return null
      return null;
    }
    
    // Otherwise show overall trend (2010 to 2021)
    const first = data[0].birds;
    const last = data[data.length - 1].birds;
    return (((last - first) / first) * 100).toFixed(1);
  };

  // Badge logic: only show when the year truly has no actual survey data
  // - Real survey year → no badge (year exists in at least one colony's history)
  // - 2022–2026 → AI Predicted
  // - Gap year (≤2021 but no survey data) → Interpolated
  const isRealSurveyYear = !selectedYear || coloniesData.some(c =>
    c.history.some(h => h.year === selectedYear)
  );
  const isFuturePredicted = selectedYear > 2021;
  const isInterpolatedYear = selectedYear && !isRealSurveyYear && !isFuturePredicted;

  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(0);

  const WORKFLOWS = [
    {
      persona: 'Field Biologist',
      color: '#10b981',
      steps: [
        { tab: 'AI Detect', desc: 'Upload aerial survey photo → select colony + altitude → run detection' },
        { tab: 'Annotate',  desc: 'Review bounding boxes; correct any misclassified species' },
        { tab: 'Analytics', desc: 'Compare nest count to historical baseline for the colony' },
        { tab: 'Validate',  desc: 'Check interpolation accuracy grade before reporting' },
      ],
    },
    {
      persona: 'Conservation Planner',
      color: '#0ea5e9',
      steps: [
        { tab: 'Analytics', desc: 'Review HQI score + critical habitat list for selected year' },
        { tab: 'Species',   desc: 'Identify threatened species at priority colonies' },
        { tab: 'Hurricane', desc: 'Run cumulative storm impact analysis (all storms)' },
        { tab: 'Budget',    desc: 'Allocate restoration budget by colony priority score' },
      ],
    },
    {
      persona: 'Policy Maker',
      color: '#f97316',
      steps: [
        { tab: 'Analytics', desc: 'Open Dashboard → check population trend 2010–2021' },
        { tab: 'Hurricane', desc: 'Select major storm (e.g. Katrina) → run single-storm impact' },
        { tab: 'Reports',   desc: 'Generate PDF report with KPIs, map, and recovery data' },
        { tab: 'Validate',  desc: 'Review model accuracy grade for stakeholder confidence' },
      ],
    },
  ];

  return (
    <div className="command-panel h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-400">
              {selectedYear ? `Year: ${selectedYear}` : 'All Years (2010-2021)'}
            </p>
            {(isFuturePredicted || isInterpolatedYear) && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isFuturePredicted
                  ? 'text-sky-400 bg-sky-400/15'
                  : 'text-yellow-400 bg-yellow-400/15'
              }`}>
                {isFuturePredicted ? '✦ AI Predicted' : '~ Interpolated'}
              </span>
            )}
          </div>
        </div>

        {/* Key Metrics Grid - Enhanced */}
        <div className="grid grid-cols-2 gap-3">
          {/* Colonies Detected */}
          <div className="metric-card bg-gradient-to-br from-primary/20 to-primary/5">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs text-gray-400">Colonies</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {metrics.coloniesDetected}
            </p>
            <p className="text-xs text-gray-400">Active colonies detected</p>
          </div>

          {/* Species Richness */}
          <div className="metric-card bg-gradient-to-br from-ocean/20 to-ocean/5">
            <div className="flex items-center justify-between mb-2">
              <LayersIcon className="w-5 h-5 text-ocean" />
              <span className="text-xs text-gray-400">Diversity</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {metrics.speciesRichness}
            </p>
            <p className="text-xs text-gray-400">Unique species</p>
          </div>

          {/* Total Birds */}
          <div className="metric-card bg-gradient-to-br from-purple-500/20 to-purple-500/5">
            <div className="flex items-center justify-between mb-2">
              <Bird className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-gray-400">Total Birds</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {metrics.hqi.totalBirds.toLocaleString()}
            </p>
            <div className="flex items-center gap-1 text-xs">
              {(() => {
                const percentage = getTrendPercentage(metrics.trendData, selectedYear, coloniesData);
                if (percentage === null) {
                  return <span className="text-gray-500">No YoY data</span>;
                }
                return (
                  <>
                    {getTrendIcon(metrics.trendData)}
                    <span className={percentage > 0 ? 'text-primary' : 'text-coral'}>
                      {selectedYear ? 'YoY: ' : ''}{percentage}%
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Total Nests */}
          <div className="metric-card bg-gradient-to-br from-coral/20 to-coral/5">
            <div className="flex items-center justify-between mb-2">
              <Egg className="w-5 h-5 text-coral" />
              <span className="text-xs text-gray-400">Total Nests</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {metrics.hqi.totalNests.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Nesting efficiency: {metrics.hqi.nestingEfficiency}%</p>
          </div>
        </div>

        {/* HQI Score - Prominent Display */}
        <div className="glass-panel p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border-2 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Habitat Quality Index</p>
              <p className="text-5xl font-bold text-primary">{metrics.hqi.score}</p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                metrics.hqi.score >= 80 ? 'bg-primary/20 text-primary' :
                metrics.hqi.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-coral/20 text-coral'
              }`}>
                {metrics.hqi.rating}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {metrics.hqi.coloniesAnalyzed} colonies
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-primary to-primary-light"
              style={{ width: `${metrics.hqi.score}%` }}
            ></div>
          </div>
        </div>

        {/* Population Trend Chart - Enhanced */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Population Trends (2010-2021)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.trendData}>
              <defs>
                <linearGradient id="colorBirds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="birds" stroke="#10b981" fillOpacity={1} fill="url(#colorBirds)" strokeWidth={2} name="Birds" />
              <Area type="monotone" dataKey="nests" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorNests)" strokeWidth={2} name="Nests" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Species Diversity Trend */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            Species Diversity Over Time
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={metrics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="avgSpecies" stroke="#8b5cf6" strokeWidth={3} name="Avg Species per Colony" dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Species Distribution */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-4">Species Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics.topSpecies}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {metrics.topSpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Restoration Priorities - YEAR SPECIFIC */}
        <div className="glass-panel p-4 rounded-lg border-2 border-coral/30">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-coral" />
            Priority Restoration Areas ({selectedYear || 2021})
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Colonies with significant decline compared to {Math.max((selectedYear || 2021) - 5, 2010)}
          </p>
          <div className="space-y-3">
            {metrics.restorationPriorities.length > 0 ? metrics.restorationPriorities.map((area, index) => {
              const priorityColors = {
                High: '#ef4444',
                Medium: '#f97316',
                Low: '#eab308'
              };
              
              return (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3 border-l-4" style={{ borderColor: priorityColors[area.priority] }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{area.name}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {area.lat.toFixed(4)}, {area.lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-2 py-1 rounded`}
                        style={{
                          backgroundColor: priorityColors[area.priority] + '20',
                          color: priorityColors[area.priority]
                        }}
                      >
                        {area.priority}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-coral font-bold">
                      {Math.abs(area.change).toFixed(1)}% decline
                    </p>
                    <p className="text-gray-400">
                      Nests: <span className="text-white">{area.referenceNests}</span> ({area.referenceYear}) → <span className="text-coral">{area.currentNests}</span> ({area.currentYear})
                    </p>
                    <p className="text-yellow-500 text-xs mt-2">
                      ⚠️ {area.reason}
                    </p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(Math.abs(area.change), 100)}%`,
                        backgroundColor: priorityColors[area.priority]
                      }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">✓ No critical declines detected</p>
                <p className="text-xs mt-1">All habitats stable for {selectedYear || 2021}</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Habitats */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-4">Top 5 Critical Habitats</h3>
          <div className="space-y-3">
            {metrics.criticalHabitats.map((habitat, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{habitat.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {habitat.birds.toLocaleString()} birds • {habitat.nests.toLocaleString()} nests
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: metrics.hqi.color }}>
                      HQI: {habitat.hqi.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-400">{habitat.species} species</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((habitat.hqi / 100) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-3">Summary Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Colonies Analyzed:</span>
              <span className="text-white font-semibold">{metrics.hqi.coloniesAnalyzed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Nesting Efficiency:</span>
              <span className="text-white font-semibold">{metrics.hqi.nestingEfficiency}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Biodiversity Factor:</span>
              <span className="text-white font-semibold">
                {metrics.hqi.biodiversityFactor ? metrics.hqi.biodiversityFactor.toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Species Richness:</span>
              <span className="text-white font-semibold">{metrics.speciesRichness} unique species</span>
            </div>
          </div>
        </div>

        {/* ── User Workflow Guide ── */}
        <div className="glass-panel rounded-lg overflow-hidden border border-gray-700/50">
          <button
            onClick={() => setWorkflowOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">User Workflow Guide</span>
              <span className="text-[10px] text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded font-semibold">3 Personas</span>
            </div>
            {workflowOpen
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {workflowOpen && (
            <div className="border-t border-gray-700/50">
              {/* Persona tabs */}
              <div className="flex border-b border-gray-700/50">
                {WORKFLOWS.map((wf, i) => (
                  <button
                    key={wf.persona}
                    onClick={() => setActiveWorkflow(i)}
                    className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${
                      activeWorkflow === i
                        ? 'text-white border-b-2'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={activeWorkflow === i ? { borderColor: wf.color, color: wf.color } : {}}
                  >
                    {wf.persona}
                  </button>
                ))}
              </div>

              {/* Steps */}
              <div className="p-3 space-y-2">
                {WORKFLOWS[activeWorkflow].steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                      style={{
                        background: `${WORKFLOWS[activeWorkflow].color}20`,
                        color: WORKFLOWS[activeWorkflow].color,
                        border: `1px solid ${WORKFLOWS[activeWorkflow].color}40`,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5"
                        style={{
                          background: `${WORKFLOWS[activeWorkflow].color}15`,
                          color: WORKFLOWS[activeWorkflow].color,
                        }}
                      >
                        {step.tab}
                      </span>
                      <span className="text-xs text-gray-400">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AnalyticsSidebar;
