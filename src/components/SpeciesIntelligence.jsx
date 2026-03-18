import { useMemo, useState } from 'react';
import { Search, ChevronRight, ChevronLeft, Bird } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { getSpeciesName, getSpeciesCategory, categoryColors } from '../utils/speciesMapping';

const CATEGORY_LABELS = {
  tern: 'Tern', gull: 'Gull', pelican: 'Pelican',
  heron: 'Heron / Egret', ibis: 'Ibis / Spoonbill',
  skimmer: 'Skimmer', other: 'Other',
};

export default function SpeciesIntelligence({ coloniesData, selectedYear }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(null);
  const [sortBy, setSortBy] = useState('colonies'); // 'colonies' | 'name'

  // Build species index once from colony data
  const speciesIndex = useMemo(() => {
    const index = {};
    coloniesData.forEach(colony => {
      const yearData = colony.history.find(h => h.year === selectedYear)
        || colony.history[colony.history.length - 1];

      colony.top_species.forEach((code, rank) => {
        if (!index[code]) {
          index[code] = {
            code,
            name: getSpeciesName(code),
            category: getSpeciesCategory(code),
            colonies: [],
            yearlyPresence: {},   // year → count of colonies
          };
        }
        index[code].colonies.push({ colony, rank, yearData });

        // Track presence per year
        colony.history.forEach(h => {
          if (!index[code].yearlyPresence[h.year]) index[code].yearlyPresence[h.year] = 0;
          index[code].yearlyPresence[h.year]++;
        });
      });
    });

    return Object.values(index).sort((a, b) =>
      sortBy === 'colonies'
        ? b.colonies.length - a.colonies.length
        : a.name.localeCompare(b.name)
    );
  }, [coloniesData, selectedYear, sortBy]);

  const filtered = useMemo(() => {
    if (!searchQuery) return speciesIndex;
    const q = searchQuery.toLowerCase();
    return speciesIndex.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [speciesIndex, searchQuery]);

  const selectedSp = selectedCode ? speciesIndex.find(s => s.code === selectedCode) : null;

  const presenceTrend = useMemo(() => {
    if (!selectedSp) return [];
    return Object.entries(selectedSp.yearlyPresence)
      .map(([year, count]) => ({ year: parseInt(year), colonies: count }))
      .sort((a, b) => a.year - b.year);
  }, [selectedSp]);

  // Top colonies for selected species this year
  const topColonies = useMemo(() => {
    if (!selectedSp) return [];
    return [...selectedSp.colonies]
      .sort((a, b) => b.yearData.birds - a.yearData.birds)
      .slice(0, 10);
  }, [selectedSp]);

  // Summary stats for all species in this year
  const yearStats = useMemo(() => {
    const total = speciesIndex.length;
    const active = speciesIndex.filter(s => s.yearlyPresence[selectedYear] > 0).length;
    return { total, active };
  }, [speciesIndex, selectedYear]);

  // Group by category for list display
  const byCategory = useMemo(() => {
    const groups = {};
    filtered.forEach(sp => {
      const cat = sp.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(sp);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col h-full bg-gray-950">

      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-white">Species Intelligence</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {yearStats.active} of {yearStats.total} species active in {selectedYear}
            </p>
          </div>
          <Bird className="w-5 h-5 text-primary" />
        </div>

        {!selectedSp && (
          <>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
              <input
                type="text"
                placeholder="Search species or code…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex gap-1">
              {['colonies', 'name'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`text-xs px-3 py-1 rounded-md transition-colors ${sortBy === opt ? 'bg-primary/20 text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  Sort: {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedSp && (
          <button
            onClick={() => setSelectedCode(null)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> All Species
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* ── DETAIL VIEW ──────────────────────────────────────── */}
        {selectedSp ? (
          <div className="p-4 space-y-4">
            {/* Species header card */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedSp.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[11px] font-mono bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      {selectedSp.code}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded capitalize font-medium"
                      style={{
                        backgroundColor: `${categoryColors[selectedSp.category] || '#6b7280'}20`,
                        color: categoryColors[selectedSp.category] || '#6b7280',
                      }}
                    >
                      {CATEGORY_LABELS[selectedSp.category] || selectedSp.category}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-primary">{selectedSp.colonies.length}</p>
                  <p className="text-[11px] text-gray-600">colonies</p>
                </div>
              </div>
            </div>

            {/* Presence trend */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3">Colony Presence Over Time</h4>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={presenceTrend} margin={{ top: 2, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="year" stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                    formatter={v => [v, 'Colonies']}
                  />
                  <Bar
                    dataKey="colonies"
                    fill={categoryColors[selectedSp.category] || '#10b981'}
                    radius={[2, 2, 0, 0]}
                    name="Colonies"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top colonies for this year */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <h4 className="text-sm font-semibold text-white mb-3">
                Top Colonies in {selectedYear}
              </h4>
              <div className="space-y-1">
                {topColonies.map(({ colony, yearData }, i) => (
                  <div
                    key={colony.name}
                    className="flex items-center justify-between py-1.5 border-b border-gray-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] text-gray-600 w-4 text-right flex-shrink-0">{i + 1}</span>
                      <span className="text-sm text-gray-300 truncate">{colony.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {yearData.birds.toLocaleString()} birds
                    </span>
                  </div>
                ))}
                {topColonies.length === 0 && (
                  <p className="text-sm text-gray-600">No colonies found for {selectedYear}</p>
                )}
              </div>
            </div>
          </div>

        ) : (
          /* ── LIST VIEW ──────────────────────────────────────── */
          <div>
            {Object.entries(byCategory).map(([cat, species]) => (
              <div key={cat}>
                {/* Category header */}
                <div className="px-4 py-2 bg-gray-900/60 border-b border-gray-800/50 sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: categoryColors[cat] || '#6b7280' }}
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span className="text-[11px] text-gray-700">({species.length})</span>
                  </div>
                </div>

                {/* Species rows */}
                {species.map(sp => {
                  const color = categoryColors[sp.category] || '#6b7280';
                  const activeThisYear = (sp.yearlyPresence[selectedYear] || 0);
                  return (
                    <button
                      key={sp.code}
                      onClick={() => setSelectedCode(sp.code)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-900 border-b border-gray-800/30 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-300 font-medium group-hover:text-white truncate">
                            {sp.name}
                          </p>
                          <p className="text-[11px] text-gray-600 font-mono">{sp.code}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-300">{sp.colonies.length}</p>
                          <p className="text-[10px] text-gray-700">total</p>
                        </div>
                        {activeThisYear > 0 && (
                          <div className="text-right">
                            <p className="text-xs font-semibold text-primary">{activeThisYear}</p>
                            <p className="text-[10px] text-gray-700">{selectedYear}</p>
                          </div>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-600 text-sm">
                No species match "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
