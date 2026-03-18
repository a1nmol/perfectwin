import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, AreaChart, Area, ReferenceLine
} from 'recharts';
import { Layers, TrendingDown, TrendingUp, AlertTriangle, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import {
  computeAllHabitatScores,
  basinSummary,
  estimateCumulativeLoss,
  riskColor,
  RISK_LABELS,
  COASTAL_ZONES,
} from '../utils/habitatLoss';

// ── Helpers ───────────────────────────────────────────────────────────────────

const RiskBadge = ({ risk }) => {
  const cfg = RISK_LABELS[risk] || RISK_LABELS.moderate;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
      <p className="text-white font-bold mb-1 truncate max-w-[160px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.name?.includes('%') || p.name?.includes('Loss') ? '%' : ''}
        </p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const HabitatLossPanel = ({ coloniesData }) => {
  const [activeBasin, setActiveBasin] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [colonyLimit, setColonyLimit] = useState(15);

  // Compute colony vulnerability scores
  const colonyScores = useMemo(
    () => computeAllHabitatScores(coloniesData),
    [coloniesData]
  );

  // Basin summaries
  const basins = useMemo(() => basinSummary(), []);

  // Total estimated area lost (sum of positive losses only)
  const totalLoss2024 = useMemo(() => {
    const sum = COASTAL_ZONES
      .filter(z => z.annualLossRate > 0)
      .reduce((acc, z) => acc + estimateCumulativeLoss(z.annualLossRate, 2010, 2024), 0);
    return (sum / COASTAL_ZONES.filter(z => z.annualLossRate > 0).length).toFixed(1);
  }, []);

  // Historical projection data for area chart (2010→2030)
  const projectionData = useMemo(() => {
    const years = [2010, 2012, 2014, 2016, 2018, 2021, 2024, 2027, 2030];
    return years.map(yr => {
      const row = { year: yr };
      COASTAL_ZONES.forEach(z => {
        const loss = estimateCumulativeLoss(z.annualLossRate, 2010, yr);
        row[z.id] = parseFloat(loss.toFixed(2));
      });
      return row;
    });
  }, []);

  // Top vulnerable colonies bar chart data
  const topColoniesChart = useMemo(() =>
    colonyScores.slice(0, 12).map(c => ({
      name: c.colonyName.length > 22 ? c.colonyName.slice(0, 22) + '…' : c.colonyName,
      fullName: c.colonyName,
      loss: c.loss2010_2024Pct,
      score: c.vulnerabilityScore,
      zone: c.zoneName,
      color: riskColor(c.vulnerabilityScore),
    })),
    [colonyScores]
  );

  // Stats
  const criticalCount  = colonyScores.filter(c => c.vulnerabilityScore >= 75).length;
  const highCount      = colonyScores.filter(c => c.vulnerabilityScore >= 50 && c.vulnerabilityScore < 75).length;
  const stableCount    = colonyScores.filter(c => c.vulnerabilityScore < 15).length;

  if (!coloniesData?.length) {
    return (
      <div className="command-panel h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading data…</p>
      </div>
    );
  }

  return (
    <div className="command-panel h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="border-b border-gray-700 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Land Change Analysis</h2>
          </div>
          <p className="text-xs text-gray-400">
            Louisiana coastal wetland loss · USGS/CPRA calibrated model · 2010–2030 projection
          </p>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-panel p-3 rounded-lg text-center">
            <p className="text-2xl font-black text-red-400">{criticalCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Critical colonies</p>
            <p className="text-[10px] text-red-400">≥75 vuln. score</p>
          </div>
          <div className="glass-panel p-3 rounded-lg text-center">
            <p className="text-2xl font-black text-amber-400">{totalLoss2024}%</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Avg basin loss</p>
            <p className="text-[10px] text-amber-400">2010 → 2024</p>
          </div>
          <div className="glass-panel p-3 rounded-lg text-center">
            <p className="text-2xl font-black text-emerald-400">{stableCount}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Stable / gaining</p>
            <p className="text-[10px] text-emerald-400">Atchafalaya zone</p>
          </div>
        </div>

        {/* ── Louisiana Context Banner ── */}
        <div className="bg-amber-500/8 border border-amber-500/25 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-300 mb-1">
                Louisiana loses ~1 football field of coastal land every 100 minutes
              </p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Since 1932, Louisiana has lost approximately <span className="text-white font-semibold">2,006 sq miles</span> of
                coastal land — an area larger than Delaware. This directly threatens nesting habitat
                for 190 monitored waterbird colonies. Data calibrated to USGS Couvillion et al. (2017)
                and CPRA 2023 Coastal Master Plan.
              </p>
            </div>
          </div>
        </div>

        {/* ── Basin Cards ── */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            Coastal Basin Status (2010–2024)
          </h3>
          {basins.map(b => (
            <div
              key={b.id}
              className={`glass-panel rounded-lg overflow-hidden cursor-pointer transition-all ${
                activeBasin === b.id ? 'border border-gray-600' : ''
              }`}
              onClick={() => setActiveBasin(activeBasin === b.id ? null : b.id)}
            >
              <div className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                  <span className="text-xs font-semibold text-white truncate">{b.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <RiskBadge risk={b.risk} />
                  <span className={`text-xs font-mono font-bold ${b.loss2010_2024Pct < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {b.loss2010_2024Pct < 0 ? '+' : ''}{Math.abs(b.loss2010_2024Pct).toFixed(1)}%
                  </span>
                  {activeBasin === b.id
                    ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-3 pb-2">
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.abs(b.loss2010_2024Pct) * 5, 100)}%`,
                      backgroundColor: b.color,
                    }}
                  />
                </div>
              </div>

              {/* Expanded detail */}
              {activeBasin === b.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-700/50 pt-2">
                  <p className="text-[11px] text-gray-400 leading-relaxed">{b.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <p className="text-gray-500 mb-0.5">Annual loss rate</p>
                      <p className="text-white font-semibold">{b.annualRatePct}% / yr</p>
                    </div>
                    <div className="bg-gray-800/50 rounded px-2 py-1.5">
                      <p className="text-gray-500 mb-0.5">Acres lost 1932–2016</p>
                      <p className="text-white font-semibold">
                        {b.totalAcresLost < 0
                          ? `+${Math.abs(b.totalAcresLost).toLocaleString()} gained`
                          : b.totalAcresLost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Primary loss drivers:</p>
                    <div className="flex flex-wrap gap-1">
                      {b.drivers.map(d => (
                        <span key={d} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  {b.cpraProjects.length > 0 && (
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">CPRA restoration projects:</p>
                      <div className="flex flex-wrap gap-1">
                        {b.cpraProjects.map(p => (
                          <span key={p} className="text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-700/30 px-1.5 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Basin Loss Projection Chart ── */}
        <div className="glass-panel p-3 rounded-lg">
          <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
            <TrendingDown className="w-3.5 h-3.5 text-red-400" />
            Cumulative Habitat Loss by Basin (%)
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            2024+ = CPRA projection under current conditions (no new diversions)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={projectionData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="year" stroke="#9ca3af" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis
                stroke="#9ca3af" tick={{ fontSize: 10 }} tickLine={false}
                tickFormatter={v => `${v}%`} width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={2024} stroke="#6b7280" strokeDasharray="4 2" label={{ value: 'Today', fill: '#9ca3af', fontSize: 10 }} />
              {COASTAL_ZONES.filter(z => z.annualLossRate > 0).map(z => (
                <Area
                  key={z.id}
                  type="monotone"
                  dataKey={z.id}
                  name={z.name.split('/')[0].trim()}
                  stroke={z.color}
                  fill={z.fillColor}
                  strokeWidth={1.5}
                  dot={false}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Top Vulnerable Colonies Chart ── */}
        <div className="glass-panel p-3 rounded-lg">
          <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            Most Vulnerable Colonies — Estimated Habitat Loss
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">Top 12 by modelled cumulative loss 2010–2024</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={topColoniesChart}
              layout="vertical"
              margin={{ top: 0, right: 40, bottom: 0, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis
                type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <YAxis
                type="category" dataKey="name" stroke="#9ca3af" tick={{ fontSize: 9 }}
                tickLine={false} width={100}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload;
                  return (
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
                      <p className="text-white font-bold mb-1">{d?.fullName}</p>
                      <p style={{ color: d?.color }}>Habitat loss: {d?.loss?.toFixed(1)}%</p>
                      <p className="text-gray-400">Zone: {d?.zone}</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="loss" name="Habitat loss %" radius={[0, 3, 3, 0]}>
                {topColoniesChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Colony Vulnerability Table ── */}
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">All Colony Vulnerability Scores</h3>
            <span className="text-[10px] text-gray-500">{colonyScores.length} colonies</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-3 py-2 text-left text-gray-400 font-semibold">Colony</th>
                  <th className="px-3 py-2 text-left text-gray-400 font-semibold">Basin</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Loss 2024</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Proj 2030</th>
                  <th className="px-3 py-2 text-center text-gray-400 font-semibold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {colonyScores.slice(0, colonyLimit).map((c, i) => (
                  <tr
                    key={c.colonyName}
                    className={`border-b border-gray-800 hover:bg-gray-800/40 transition-colors ${
                      i % 2 === 0 ? 'bg-gray-900/20' : ''
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-white max-w-[130px]">
                      <span className="truncate block">{c.colonyName}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-400 text-[10px]">
                      <span className="truncate block max-w-[90px]">{c.zoneName.split('/')[0].trim()}</span>
                    </td>
                    <td className="px-3 py-2 text-right font-semibold" style={{ color: riskColor(c.vulnerabilityScore) }}>
                      {c.loss2010_2024Pct > 0 ? '' : '+'}{Math.abs(c.loss2010_2024Pct).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right text-gray-400 text-[11px]">
                      {c.projectedLoss2030Pct > 0 ? '+' : ''}{c.projectedLoss2030Pct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-center">
                      <RiskBadge risk={c.zoneRisk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {colonyLimit < colonyScores.length && (
            <button
              onClick={() => setColonyLimit(l => l + 20)}
              className="w-full py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors border-t border-gray-700"
            >
              Show {Math.min(20, colonyScores.length - colonyLimit)} more ({colonyScores.length - colonyLimit} remaining)
            </button>
          )}
        </div>

        {/* ── Atchafalaya Positive Note ── */}
        <div className="bg-emerald-500/8 border border-emerald-500/25 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-emerald-300 mb-1">Bright Spot: Atchafalaya Delta</p>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The Atchafalaya and Wax Lake deltas are <span className="text-emerald-400 font-semibold">gaining land</span> at
                ~0.28%/year, creating ~2,000 acres of new habitat annually. Colonies in this zone
                show improving conditions. This serves as a proof-of-concept for CPRA's
                planned sediment diversions throughout coastal Louisiana.
              </p>
            </div>
          </div>
        </div>

        {/* ── Data Sources ── */}
        <div className="glass-panel rounded-lg overflow-hidden border border-gray-700/50">
          <button
            onClick={() => setShowSources(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-800/40 transition-colors"
          >
            <span className="text-xs font-semibold text-gray-400 flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> Data Sources & Methodology
            </span>
            {showSources
              ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          {showSources && (
            <div className="px-3 pb-3 border-t border-gray-700/50 pt-2 space-y-1.5 text-[11px] text-gray-400">
              <p><span className="text-gray-300 font-semibold">USGS NWRC —</span> Couvillion et al. (2017). Land area change in coastal Louisiana 1932–2016. USGS Data Series 1032.</p>
              <p><span className="text-gray-300 font-semibold">CPRA 2023 —</span> Louisiana's Comprehensive Master Plan for a Sustainable Coast. Basin-level loss projections under no-action scenarios.</p>
              <p><span className="text-gray-300 font-semibold">NOAA Digital Coast —</span> C-CAP Land Change Atlas. 2010–2021 high-resolution coastal change mapping.</p>
              <p><span className="text-gray-300 font-semibold">Methodology —</span> Compound annual loss rates applied per basin (2010 baseline). Each colony's rate is attenuated by distance from basin centre (60% attenuation at zone edge). Projections assume no new CPRA diversions (conservative / worst-case scenario).</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HabitatLossPanel;
