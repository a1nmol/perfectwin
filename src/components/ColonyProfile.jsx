import { useMemo } from 'react';
import { X, MapPin, TrendingUp, TrendingDown, Cpu } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { calculateHQI } from '../utils/hqiCalculator';
import { getSpeciesName, categoryColors, getSpeciesCategory } from '../utils/speciesMapping';

const HQI_BG = { Excellent: '#10b981', Good: '#0ea5e9', Fair: '#eab308', Poor: '#f97316', Critical: '#ef4444' };

export default function ColonyProfile({ colony, selectedYear, onClose, onViewAI }) {
  const currentData = useMemo(() => (
    colony.history.find(h => h.year === selectedYear) ||
    colony.history[colony.history.length - 1]
  ), [colony, selectedYear]);

  const prevData = useMemo(() => (
    colony.history.find(h => h.year === (currentData.year - 1))
  ), [colony, currentData]);

  const historyChart = useMemo(() => (
    colony.history.map(h => ({
      year: h.year,
      birds: h.birds,
      nests: h.nests,
      hqi: parseFloat(calculateHQI(h.nests, h.birds, h.species_count).score.toFixed(1)),
    }))
  ), [colony]);

  const hqi = calculateHQI(currentData.nests, currentData.birds, currentData.species_count);
  const hqiColor = HQI_BG[hqi.rating] || '#6b7280';

  const birdDelta = prevData && prevData.birds > 0
    ? ((currentData.birds - prevData.birds) / prevData.birds * 100)
    : null;

  const nestingEff = currentData.birds > 0
    ? Math.round((currentData.nests / currentData.birds) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white leading-tight truncate">{colony.name}</h2>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-600 flex-shrink-0" />
            <span className="text-xs text-gray-600">
              {colony.lat.toFixed(4)}°N, {Math.abs(colony.lng).toFixed(4)}°W
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1">Birds ({currentData.year})</p>
            <p className="text-xl font-bold text-white">{currentData.birds.toLocaleString()}</p>
            {birdDelta !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${birdDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {birdDelta >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {birdDelta >= 0 ? '+' : ''}{birdDelta.toFixed(1)}% vs prev yr
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1">Nests</p>
            <p className="text-xl font-bold text-primary">{currentData.nests.toLocaleString()}</p>
            <p className="text-[11px] text-gray-600 mt-1">{nestingEff}% efficiency</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1">Species</p>
            <p className="text-xl font-bold text-sky-400">{currentData.species_count}</p>
            <p className="text-[11px] text-gray-600 mt-1">
              {currentData.species_count >= 16 ? 'Very High'
                : currentData.species_count >= 11 ? 'High'
                : currentData.species_count >= 6 ? 'Medium' : 'Low'} diversity
            </p>
          </div>

          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-[11px] text-gray-500 mb-1">HQI Score</p>
            <p className="text-xl font-bold" style={{ color: hqiColor }}>{hqi.score.toFixed(1)}</p>
            <p className="text-[11px] mt-1" style={{ color: hqiColor }}>{hqi.rating}</p>
          </div>
        </div>

        {/* Population history */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Population History</h3>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={historyChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="cpBirds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cpNests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="year" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} width={38} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                formatter={v => v.toLocaleString()}
              />
              <Area type="monotone" dataKey="birds" stroke="#10b981" fill="url(#cpBirds)" strokeWidth={2} dot={false} name="Birds" />
              <Area type="monotone" dataKey="nests" stroke="#0ea5e9" fill="url(#cpNests)" strokeWidth={2} dot={false} name="Nests" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-emerald-400 rounded" />
              <span className="text-[11px] text-gray-500">Birds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-sky-400 rounded" />
              <span className="text-[11px] text-gray-500">Nests</span>
            </div>
          </div>
        </div>

        {/* HQI trend */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Habitat Quality Index Trend</h3>
          <ResponsiveContainer width="100%" height={90}>
            <LineChart data={historyChart} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="year" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} domain={[0, 'auto']} width={34} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                formatter={v => [`${v}`, 'HQI']}
              />
              <Line type="monotone" dataKey="hqi" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} name="HQI" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Species list */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">
            Resident Species <span className="text-gray-600 font-normal">({colony.top_species.length})</span>
          </h3>
          <div className="space-y-1.5">
            {colony.top_species.map(code => {
              const cat = getSpeciesCategory(code);
              const color = categoryColors[cat] || '#6b7280';
              return (
                <div key={code} className="flex items-center justify-between py-1 border-b border-gray-800/60 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-300">{getSpeciesName(code)}</span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{code}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical data table */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-3">Year-by-Year Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-1.5 text-gray-500 font-medium">Year</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Birds</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Nests</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">Spp</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">HQI</th>
                </tr>
              </thead>
              <tbody>
                {[...colony.history].reverse().map(h => {
                  const rowHqi = calculateHQI(h.nests, h.birds, h.species_count);
                  const isSelected = h.year === currentData.year;
                  return (
                    <tr key={h.year} className={`border-b border-gray-800/40 ${isSelected ? 'bg-primary/5' : ''}`}>
                      <td className={`py-1.5 font-medium ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{h.year}</td>
                      <td className="py-1.5 text-right text-gray-300">{h.birds.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-gray-300">{h.nests.toLocaleString()}</td>
                      <td className="py-1.5 text-right text-gray-400">{h.species_count}</td>
                      <td className="py-1.5 text-right font-semibold" style={{ color: HQI_BG[rowHqi.rating] }}>
                        {rowHqi.score.toFixed(0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action buttons */}
        {onViewAI && (
          <button
            onClick={onViewAI}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-sky-500/30 bg-sky-500/10 text-sky-400 text-sm font-semibold rounded-lg hover:bg-sky-500/20 transition-colors"
          >
            <Cpu className="w-4 h-4" />
            Analyze with AI Detection
          </button>
        )}
      </div>
    </div>
  );
}
