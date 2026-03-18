import React, { useState, useEffect, useMemo } from 'react';
import { Download, Play, AlertCircle, CheckCircle, Loader, Layers, Wind } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  impactScore as computeImpactScore,
  recoveryYears as computeRecoveryYears,
  minDistanceToTrack,
  classifyExposureScore
} from '../utils/stormModels.js';

// Cumulative impact color scale
const impactColor = (score) => {
  if (score >= 6) return '#ef4444';
  if (score >= 4) return '#f97316';
  if (score >= 2) return '#eab308';
  return '#10b981';
};

const StormImpactPanel = ({ coloniesData, onStormSelect, onShowImpact }) => {
  const [storms, setStorms] = useState([]);
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [impactResults, setImpactResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImpactLayer, setShowImpactLayer] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'impactScore', direction: 'desc' });
  const impactTiming = 'next';
  // 'single' = single-storm analysis  |  'cumulative' = all-storms view
  const [activeView, setActiveView] = useState('single');

  // Load storms on mount — auto-select most recent, pre-render track
  useEffect(() => {
    fetch('/data/mock_storms.json')
      .then(res => res.json())
      .then(data => {
        // Sort by year descending so most recent is first
        const sorted = [...data].sort((a, b) => b.year - a.year);
        setStorms(sorted);
        if (sorted.length > 0) {
          const mostRecent = sorted[0];
          setSelectedStorm(mostRecent);
          // Pre-render track on map immediately (no analysis yet)
          if (onStormSelect) {
            onStormSelect(mostRecent);
          }
        }
      })
      .catch(err => {
        console.error('Error loading storms:', err);
        setError('Failed to load storm data');
      });
  }, []);

  // Run impact analysis — fully client-side, no Flask API required
  const runImpactAnalysis = () => {
    if (!selectedStorm || !coloniesData || coloniesData.length === 0) {
      setError('Please select a storm and ensure colony data is loaded');
      return;
    }

    setLoading(true);
    setError(null);

    // Use setTimeout so the loading spinner renders before the sync computation
    setTimeout(() => {
      try {
        const t = selectedStorm.year;
        const beforeYear = t - 1;
        const impactYear = impactTiming === 'next' ? t + 1 : t;

        // Build totals lookup: totals[colonyName][year] = { birds, nests }
        const totals = {};
        coloniesData.forEach(colony => {
          totals[colony.name] = {};
          (colony.history || []).forEach(h => {
            totals[colony.name][h.year] = { birds: h.birds, nests: h.nests };
          });
        });

        // Helper: most recent year ≤ targetYear in colony history
        const findBestYear = (history, targetYear) => {
          const eligible = history.map(h => h.year).filter(y => y <= targetYear);
          return eligible.length > 0 ? Math.max(...eligible) : null;
        };

        // Compute results for each colony client-side
        const results = coloniesData.map(colony => {
          const colonyId = colony.name;
          const lat = colony.lat;
          const lon = colony.lng || colony.lon;
          const habitatType = colony.habitatType || 'Unknown';
          const history = colony.history || [];
          const speciesRichness = history[history.length - 1]?.species_count || 8;
          const vegetationDensity = 0.30;
          const landLossRate = 0.05;

          // Exposure score — distance to track, thresholds unchanged
          const minDistKm = minDistanceToTrack(lat, lon, selectedStorm.track);
          const exposure = classifyExposureScore(minDistKm);

          // Impact score — existing formula, weights unchanged
          const impact = computeImpactScore({
            category: selectedStorm.category,
            exposureScore: exposure,
            habitatType
          });

          // ── Smart year matching ──────────────────────────────────────────
          // Find the closest available year ≤ each target year.
          // This handles storms outside the data range (e.g. Francine 2024
          // when data only goes to 2021).
          const bestBeforeYear = findBestYear(history, beforeYear);
          const bestImpactYear = findBestYear(history, impactYear);

          // Only use actual data when we have TWO DIFFERENT years to compare
          const canUseActual =
            bestBeforeYear != null &&
            bestImpactYear != null &&
            bestBeforeYear !== bestImpactYear;

          // Most-recent available birds as baseline (for model fallback)
          const allYears = history.map(h => h.year);
          const latestYear = allYears.length > 0 ? Math.max(...allYears) : null;
          const baselineBirds =
            latestYear != null ? (totals[colonyId]?.[latestYear]?.birds ?? 0) : 0;

          const birdsBefore = bestBeforeYear != null
            ? (totals[colonyId]?.[bestBeforeYear]?.birds ?? baselineBirds)
            : baselineBirds;

          const birdsAfterActual = canUseActual
            ? (totals[colonyId]?.[bestImpactYear]?.birds ?? null)
            : null;

          // Model-derived fallback: apply impact score drop to baseline
          const modelDropFrac = impact * 0.4;
          const birdsAfterModel =
            birdsBefore > 0 ? Math.round(birdsBefore * (1 - modelDropFrac)) : 0;

          const birdsAfter = birdsAfterActual ?? birdsAfterModel;
          const isActualData = birdsAfterActual != null;

          // pctDrop — from actual counts when available, else from model
          let pctDrop = null;
          if (birdsBefore > 0 && birdsAfter != null) {
            pctDrop = Math.round(((birdsBefore - birdsAfter) / birdsBefore) * 100);
          }
          const displayDrop = pctDrop !== null ? pctDrop : Math.round(impact * 0.4 * 100);

          // Recovery years — existing formula from impact score
          const recovery = computeRecoveryYears({
            impactScore: impact,
            speciesRichness,
            vegetationDensity,
            landLossRate
          });

          // Actual years used for display / sparkline
          const usedBeforeYear = bestBeforeYear ?? beforeYear;
          const usedImpactYear = bestImpactYear ?? impactYear;

          return {
            colonyId,
            colonyName: colony.name,
            exposureScore: Number(exposure.toFixed(2)),
            impactScore: Number(impact.toFixed(3)),
            predictedPopulationDropPct: displayDrop,
            recoveryYears: recovery,
            birdsBefore,
            birdsAfter,
            isActualData,
            usedBeforeYear,
            usedImpactYear,
            beforeYear,
            impactYear,
            factors: {
              minDistanceKm: Number(minDistKm.toFixed(2)),
              habitatType,
              speciesRichness,
              vegetationDensity,
              landLossRate
            }
          };
        });

        // Summary statistics
        const impactScores = results.map(r => r.impactScore);
        const maxImpact = Math.max(...impactScores);
        const meanImpact =
          impactScores.reduce((a, b) => a + b, 0) / impactScores.length;

        const data = {
          storm: {
            id: selectedStorm.id,
            name: selectedStorm.name,
            year: selectedStorm.year,
            category: selectedStorm.category
          },
          results,
          summary: {
            count: results.length,
            maxImpact: Number(maxImpact.toFixed(3)),
            meanImpact: Number(meanImpact.toFixed(3)),
            beforeYear,
            impactYear,
            generatedAt: new Date().toISOString()
          }
        };

        setImpactResults(data);
        setShowImpactLayer(true);

        // Notify parent to show storm + buffers on map
        if (onStormSelect) onStormSelect(selectedStorm);
        if (onShowImpact) onShowImpact(true);
      } catch (err) {
        console.error('Error running impact analysis:', err);
        setError(`Failed to run analysis: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, 0);
  };

  // Sort results
  const sortedResults = React.useMemo(() => {
    if (!impactResults?.results) return [];
    
    const sorted = [...impactResults.results];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return sorted;
  }, [impactResults, sortConfig]);

  // ── Cumulative impact across ALL storms ─────────────────────────────────
  const cumulativeResults = useMemo(() => {
    if (activeView !== 'cumulative' || !storms.length || !coloniesData.length) return [];

    return coloniesData.map(colony => {
      const lat = colony.lat;
      const lon = colony.lng || colony.lon;
      const habitatType = colony.habitatType || 'Unknown';

      let totalImpact = 0;
      const breakdown = storms.map(storm => {
        const dist   = minDistanceToTrack(lat, lon, storm.track);
        const expo   = classifyExposureScore(dist);
        const impact = computeImpactScore({ category: storm.category, exposureScore: expo, habitatType });
        totalImpact += impact;
        return { name: storm.name, year: storm.year, impact: parseFloat(impact.toFixed(3)) };
      }).sort((a, b) => b.impact - a.impact);

      const stormsHit = breakdown.filter(s => s.impact > 0.3).length;
      return {
        colonyName: colony.name,
        totalImpact: parseFloat(totalImpact.toFixed(2)),
        avgImpact:   parseFloat((totalImpact / storms.length).toFixed(3)),
        stormsHit,
        worstStorm:  breakdown[0]?.name || '—',
        breakdown,
      };
    }).sort((a, b) => b.totalImpact - a.totalImpact);
  }, [activeView, storms, coloniesData]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Export to CSV — includes beforeYear and impactYear columns
  const exportToCSV = () => {
    if (!impactResults?.results) return;

    const { beforeYear, impactYear } = impactResults.summary;

    const headers = [
      'Storm ID',
      'Colony ID',
      'Colony Name',
      'Before Year',
      'Impact Year',
      'Birds Before',
      'Birds After',
      'Exposure Score',
      'Impact Score',
      'Population Drop %',
      'Recovery Years',
      'Min Distance (km)',
      'Habitat Type',
      'Species Richness',
      'Vegetation Density',
      'Land Loss Rate'
    ];

    const rows = impactResults.results.map(r => [
      impactResults.storm.id,
      r.colonyId,
      r.colonyName,
      beforeYear ?? r.beforeYear ?? '',
      impactYear ?? r.impactYear ?? '',
      r.birdsBefore ?? '',
      r.birdsAfter ?? '',
      r.exposureScore,
      r.impactScore,
      r.predictedPopulationDropPct,
      r.recoveryYears,
      r.factors.minDistanceKm,
      r.factors.habitatType,
      r.factors.speciesRichness,
      r.factors.vegetationDensity,
      r.factors.landLossRate
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hurricane_impact_${impactResults.storm.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="command-panel h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-6">
        {/* Header + view toggle */}
        <div className="border-b border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-white mb-1">Hurricane Impact Predictor</h2>
          <p className="text-sm text-gray-400 mb-3">
            Simulate hurricane impacts on colonial waterbird habitats
          </p>
          {/* Tab toggle */}
          <div className="flex gap-1 bg-gray-800/60 p-1 rounded-lg">
            <button
              onClick={() => setActiveView('single')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'single' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> Single Storm
            </button>
            <button
              onClick={() => setActiveView('cumulative')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeView === 'cumulative' ? 'bg-coral/20 text-coral' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Storms
            </button>
          </div>
        </div>

        {/* ── CUMULATIVE VIEW ─────────────────────────────────────────────── */}
        {activeView === 'cumulative' && (
          <>
            <div className="glass-panel p-4 rounded-lg bg-coral/5 border border-coral/20">
              <p className="text-xs text-gray-400 leading-relaxed">
                Cumulative storm exposure across <span className="text-white font-semibold">{storms.length} historical hurricanes</span>.
                Higher total impact scores indicate chronically stressed colonies most in need of protection.
              </p>
            </div>

            {cumulativeResults.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Loading storm data…
              </div>
            )}

            {cumulativeResults.length > 0 && (
              <>
                {/* Top-10 bar chart */}
                <div className="glass-panel p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-white mb-3">
                    Most Stressed Colonies (Cumulative Impact)
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={cumulativeResults.slice(0, 10).map(r => ({
                        name: r.colonyName.length > 14 ? r.colonyName.slice(0, 14) + '…' : r.colonyName,
                        total: r.totalImpact,
                        storms: r.stormsHit,
                      }))}
                      layout="vertical"
                      margin={{ top: 0, right: 8, left: 100, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                      <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip
                        contentStyle={{ background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(75,85,99,0.5)', borderRadius: 8, fontSize: 11 }}
                        formatter={(v, name) => [name === 'total' ? v.toFixed(2) : v, name === 'total' ? 'Total Impact' : 'Storms Hit']}
                      />
                      <Bar dataKey="total" radius={[0, 3, 3, 0]} name="total">
                        {cumulativeResults.slice(0, 10).map((r, i) => (
                          <Cell key={i} fill={impactColor(r.totalImpact)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-3 mt-3 text-xs">
                    {[['≥6', '#ef4444', 'Critical'], ['4–6', '#f97316', 'High'], ['2–4', '#eab308', 'Medium'], ['<2', '#10b981', 'Low']].map(([range, color, label]) => (
                      <div key={label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-gray-500">{label} ({range})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full table */}
                <div className="glass-panel p-4 rounded-lg">
                  <h3 className="text-sm font-bold text-white mb-3">All Colonies Ranked</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2 px-2 text-gray-400">#</th>
                          <th className="text-left py-2 px-2 text-gray-400">Colony</th>
                          <th className="text-right py-2 px-2 text-gray-400">Total</th>
                          <th className="text-right py-2 px-2 text-gray-400">Avg</th>
                          <th className="text-right py-2 px-2 text-gray-400">Hit</th>
                          <th className="text-left py-2 px-2 text-gray-400">Worst</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cumulativeResults.slice(0, 25).map((r, i) => (
                          <tr key={r.colonyName} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                            <td className="py-2 px-2 text-gray-600">{i + 1}</td>
                            <td className="py-2 px-2 text-white font-medium">{r.colonyName}</td>
                            <td className="py-2 px-2 text-right font-bold" style={{ color: impactColor(r.totalImpact) }}>
                              {r.totalImpact.toFixed(2)}
                            </td>
                            <td className="py-2 px-2 text-right text-gray-400">{r.avgImpact.toFixed(3)}</td>
                            <td className="py-2 px-2 text-right text-orange-400 font-semibold">{r.stormsHit}</td>
                            <td className="py-2 px-2 text-gray-400 text-[10px]">{r.worstStorm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {cumulativeResults.length > 25 && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Showing top 25 of {cumulativeResults.length} colonies
                    </p>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── SINGLE STORM VIEW (existing content) ───────────────────────── */}
        {activeView === 'single' && (
          <>

        {/* Storm Selection */}
        <div className="glass-panel p-4 rounded-lg">
          <h3 className="text-sm font-bold text-white mb-3">Select Hurricane</h3>
          <select
            value={selectedStorm?.id || ''}
            onChange={(e) => {
              const storm = storms.find(s => s.id === e.target.value);
              if (!storm) return;
              setSelectedStorm(storm);
              // Reset analysis results when storm changes
              setImpactResults(null);
              setShowImpactLayer(false);
              // Pre-render new storm track (no analysis)
              if (onStormSelect) onStormSelect(storm);
              if (onShowImpact) onShowImpact(false);
            }}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {storms.map(storm => (
              <option key={storm.id} value={storm.id}>
                {storm.name} ({storm.year}) - Category {storm.category}
              </option>
            ))}
          </select>

          {selectedStorm && (
            <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs text-gray-300">
              <p className="font-semibold text-white mb-1">{selectedStorm.description}</p>
              <p>Max Wind: {selectedStorm.maxWindKt} kt</p>
              <p>Track Points: {selectedStorm.track.length}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">

          <button
            onClick={runImpactAnalysis}
            disabled={loading || !selectedStorm}
            className="w-full glass-button py-3 rounded-lg hover:bg-primary/10 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-white font-semibold">Running Analysis...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-white font-semibold">Run Impact Analysis</span>
                </>
              )}
            </div>
          </button>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showImpact"
              checked={showImpactLayer}
              onChange={(e) => {
                setShowImpactLayer(e.target.checked);
                if (onShowImpact) {
                  onShowImpact(e.target.checked);
                }
              }}
              className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
            />
            <label htmlFor="showImpact" className="text-sm text-gray-300">
              Show hurricane impact overlay on map
            </label>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-panel p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">
                <p className="font-semibold mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {impactResults && (
          <>
            <div className="glass-panel p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-white">Analysis Complete</h3>
                  <p className="text-xs text-gray-400">
                    {impactResults.storm.name} ({impactResults.storm.year}) - Category {impactResults.storm.category}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Target: {impactResults.summary.beforeYear} → {impactResults.summary.impactYear}
                    {' '}({impactTiming === 'next' ? 'next nesting season' : 'same-year'})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Colonies Analyzed</p>
                  <p className="text-white font-bold text-lg">{impactResults.summary.count}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Max Impact</p>
                  <p className="text-coral font-bold text-lg">{impactResults.summary.maxImpact.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Mean Impact</p>
                  <p className="text-yellow-400 font-bold text-lg">{impactResults.summary.meanImpact.toFixed(2)}</p>
                </div>
                <div className="bg-gray-800/50 rounded p-2">
                  <p className="text-gray-400 text-xs">Generated</p>
                  <p className="text-white font-bold text-xs">
                    {new Date(impactResults.summary.generatedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="w-full glass-button py-3 rounded-lg hover:bg-ocean/10 transition-all group"
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5 text-ocean group-hover:scale-110 transition-transform" />
                <span className="text-white font-semibold">Export Results to CSV</span>
              </div>
            </button>

            {/* Results Table */}
            <div className="glass-panel p-4 rounded-lg">
              <h3 className="text-sm font-bold text-white mb-3">
                Impacted Colonies ({sortedResults.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th 
                        className="text-left py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('colonyName')}
                      >
                        Colony {sortConfig.key === 'colonyName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-right py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('exposureScore')}
                      >
                        Exposure {sortConfig.key === 'exposureScore' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-right py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('impactScore')}
                      >
                        Impact {sortConfig.key === 'impactScore' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-right py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('predictedPopulationDropPct')}
                      >
                        Drop % {sortConfig.key === 'predictedPopulationDropPct' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-right py-2 px-2 text-gray-400 cursor-pointer hover:text-white"
                        onClick={() => handleSort('recoveryYears')}
                      >
                        Recovery {sortConfig.key === 'recoveryYears' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-center py-2 px-2 text-gray-400">Src</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.slice(0, 20).map((result, index) => (
                      <tr 
                        key={index}
                        className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-2 px-2 text-white font-medium">
                          {result.colonyName}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className={`font-semibold ${
                            result.exposureScore >= 0.8 ? 'text-red-400' :
                            result.exposureScore >= 0.5 ? 'text-orange-400' :
                            result.exposureScore >= 0.2 ? 'text-yellow-400' :
                            'text-gray-400'
                          }`}>
                            {result.exposureScore.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className={`font-semibold ${
                            result.impactScore >= 0.7 ? 'text-red-400' :
                            result.impactScore >= 0.5 ? 'text-orange-400' :
                            result.impactScore >= 0.3 ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {result.impactScore.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right text-coral font-semibold">
                          {result.predictedPopulationDropPct}%
                        </td>
                        <td className="py-2 px-2 text-right text-primary font-semibold">
                          {result.recoveryYears} yr
                        </td>
                        <td className="py-2 px-2 text-center" title={result.isActualData ? `Actual survey data (${result.usedBeforeYear}→${result.usedImpactYear})` : 'Model estimate (no survey data for these years)'}>
                          <span className={`text-[10px] font-semibold px-1 py-0.5 rounded ${result.isActualData ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-500 bg-gray-700/50'}`}>
                            {result.isActualData ? '📊' : '📐'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedResults.length > 20 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Showing top 20 of {sortedResults.length} colonies. Export CSV for full results.
                </p>
              )}
            </div>

            {/* Population Trend Sparkline — 3 labeled anchor points */}
            {sortedResults.length > 0 && (() => {
              const top = sortedResults[0];
              const recoveryYear = top.usedImpactYear + 1;
              const recoveryBirds = top.birdsBefore != null && top.birdsAfter != null
                ? Math.round(
                    top.birdsAfter +
                    (top.birdsBefore - top.birdsAfter) /
                      Math.max(top.recoveryYears, 1)
                  )
                : 0;
              const sparkData = [
                { year: top.usedBeforeYear, population: top.birdsBefore ?? 0, phase: 'Before' },
                { year: top.usedImpactYear, population: top.birdsAfter ?? 0, phase: 'Impact' },
                { year: recoveryYear,        population: recoveryBirds,        phase: 'Recovery' }
              ];
              return (
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-sm font-bold text-white">
                      Population Trend: {top.colonyName}
                    </h3>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${top.isActualData ? 'text-emerald-400 bg-emerald-400/10' : 'text-gray-400 bg-gray-700/50'}`}>
                      {top.isActualData ? '📊 Actual data' : '📐 Model est.'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mb-3">
                    Before ({top.usedBeforeYear}) → Impact ({top.usedImpactYear}) → Recovery ({recoveryYear})
                    {!top.isActualData && (
                      <span className="ml-1 text-gray-600">
                        · survey data ends 2021, using model projection
                      </span>
                    )}
                  </p>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={sparkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        style={{ fontSize: '10px' }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '10px' }}
                        label={{
                          value: 'Birds',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fontSize: '10px', fill: '#9ca3af' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.95)',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                        formatter={(val, _name, props) => [
                          val.toLocaleString() + ' birds',
                          props.payload?.phase ?? 'Population'
                        ]}
                        labelFormatter={(yr) => `Year ${yr}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="population"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-gray-400 mt-2">
                    {top.isActualData
                      ? `Survey data: ${top.birdsBefore?.toLocaleString()} → ${top.birdsAfter?.toLocaleString()} birds (${top.usedBeforeYear}→${top.usedImpactYear}). Recovery est. ${top.recoveryYears} yr.`
                      : `No survey data for target years. Model projects ${top.birdsBefore?.toLocaleString()} → ${top.birdsAfter?.toLocaleString()} birds. Recovery est. ${top.recoveryYears} yr.`
                    }
                  </p>
                </div>
              );
            })()}
          </>
        )}

        {/* Help Text */}
        {!impactResults && (
          <div className="glass-panel p-4 rounded-lg bg-ocean/10 border border-ocean/30">
            <h3 className="text-sm font-bold text-ocean mb-2">How It Works</h3>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Select a historical hurricane from the dropdown</li>
              <li>• Click "Run Impact Analysis" — fully offline, no API needed</li>
              <li>• Analysis compares pre-storm season vs. next nesting season (t−1 → t+1)</li>
              <li>• <span className="text-emerald-400">📊 Actual</span> = real survey counts used; <span className="text-gray-400">📐 Model</span> = projected</li>
              <li>• Results sorted by impact severity; export to CSV</li>
              <li>• Survey data covers 2010–2021; storms outside this range use model estimates</li>
            </ul>
          </div>
        )}
        </>
        )}
        {/* end activeView === 'single' */}
      </div>
    </div>
  );
};

export default StormImpactPanel;
