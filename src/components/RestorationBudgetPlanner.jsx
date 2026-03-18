import { useState, useMemo } from 'react';
import { Download, DollarSign, TrendingDown, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateHQI } from '../utils/hqiCalculator';

const fmt$ = n => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

export default function RestorationBudgetPlanner({ coloniesData, selectedYear }) {
  const [totalBudget, setTotalBudget]     = useState(5_000_000);
  const [costPerColony, setCostPerColony] = useState(250_000);

  // Score every colony for restoration priority
  const ranked = useMemo(() => {
    return coloniesData.map(colony => {
      const cur = colony.history.find(h => h.year === selectedYear)
        || colony.history[colony.history.length - 1];
      const hqi = calculateHQI(cur.nests, cur.birds, cur.species_count);

      // Reference: 5 yrs back or earliest record
      const refYear = cur.year - 5;
      const ref = colony.history.find(h => h.year === refYear) || colony.history[0];
      const birdDeclinePct = ref.birds > 0
        ? ((cur.birds - ref.birds) / ref.birds) * 100
        : 0;

      // Priority: lower HQI + larger decline + bigger population = higher need
      const needScore  = (100 - hqi.score) * 0.40;           // 0-40
      const decScore   = Math.max(0, -birdDeclinePct) * 0.40; // 0-40 (only declines)
      const popScore   = Math.log10(Math.max(cur.birds, 1)) * 2; // 0-~10

      const priority = needScore + decScore + popScore;

      // Simple projected benefit: recover 70% of lost birds, +15% nest gain
      const birdsLost = ref.birds > 0 ? Math.max(0, ref.birds - cur.birds) : 0;
      const projBirdsSaved  = Math.round(birdsLost * 0.70);
      const projNestIncrease = Math.round(cur.nests * 0.15);

      return { colony, cur, hqi, birdDeclinePct, priority, projBirdsSaved, projNestIncrease };
    }).sort((a, b) => b.priority - a.priority);
  }, [coloniesData, selectedYear]);

  const maxColonies   = Math.max(0, Math.floor(totalBudget / costPerColony));
  const funded        = ranked.slice(0, maxColonies);
  const totalBirds    = funded.reduce((s, c) => s + c.projBirdsSaved, 0);
  const totalNests    = funded.reduce((s, c) => s + c.projNestIncrease, 0);
  const costPerBird   = totalBirds > 0 ? Math.round(totalBudget / totalBirds) : null;

  const chartData = funded.slice(0, 10).map(({ colony, priority, projBirdsSaved }) => ({
    name: colony.name.length > 14 ? colony.name.slice(0, 14) + '…' : colony.name,
    priority: parseFloat(priority.toFixed(1)),
    birds: projBirdsSaved,
  }));

  const exportPlan = () => {
    const headers = ['Rank', 'Colony', 'HQI', 'HQI Rating', 'Bird Change %', 'Priority Score', 'Budget ($)', 'Est. Birds Saved', 'Est. Nests Added'];
    const rows = ranked.map(({ colony, hqi, birdDeclinePct, priority, projBirdsSaved, projNestIncrease }, i) => [
      i + 1, colony.name, hqi.score.toFixed(1), hqi.rating,
      birdDeclinePct.toFixed(1), priority.toFixed(1),
      i < maxColonies ? costPerColony : 0,
      i < maxColonies ? projBirdsSaved : 0,
      i < maxColonies ? projNestIncrease : 0,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `restoration_plan_${selectedYear}_${fmt$(totalBudget).replace('$', '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Slider gradient helper
  const gradient = (val, min, max, color) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #374151 ${pct}%, #374151 100%)`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Restoration Budget Planner</h2>
            <p className="text-[11px] text-gray-600 mt-0.5">
              Optimize habitat investment across {coloniesData.length} colonies
            </p>
          </div>
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

        {/* Budget controls */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 space-y-5">
          {/* Total budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Total Budget</label>
              <span className="text-lg font-bold text-primary">{fmt$(totalBudget)}</span>
            </div>
            <input
              type="range" min={500_000} max={20_000_000} step={500_000}
              value={totalBudget}
              onChange={e => setTotalBudget(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: gradient(totalBudget, 500_000, 20_000_000, '#10b981') }}
            />
            <div className="flex justify-between text-[10px] text-gray-700 mt-1">
              <span>$500K</span><span>$20M</span>
            </div>
          </div>

          {/* Cost per colony */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Cost per Colony</label>
              <span className="text-sm font-bold text-sky-400">{fmt$(costPerColony)}</span>
            </div>
            <input
              type="range" min={50_000} max={1_000_000} step={50_000}
              value={costPerColony}
              onChange={e => setCostPerColony(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{ background: gradient(costPerColony, 50_000, 1_000_000, '#0ea5e9') }}
            />
            <div className="flex justify-between text-[10px] text-gray-700 mt-1">
              <span>$50K</span><span>$1M</span>
            </div>
          </div>
        </div>

        {/* Impact summary */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Colonies Funded', value: funded.length, sub: `of ${ranked.length}`, color: 'text-primary' },
            { label: 'Birds Protected', value: totalBirds.toLocaleString(), sub: 'projected', color: 'text-sky-400' },
            { label: 'Nest Gain',       value: `+${totalNests.toLocaleString()}`, sub: 'projected', color: 'text-yellow-400' },
            { label: 'Cost / Bird',     value: costPerBird ? `$${costPerBird.toLocaleString()}` : '—', sub: 'ROI metric', color: 'text-orange-400' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="bg-gray-900 rounded-lg p-3 border border-gray-800 text-center">
              <p className="text-[11px] text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-700 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Priority chart */}
        {chartData.length > 0 && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <h3 className="text-sm font-semibold text-white mb-3">Top 10 Priority Colonies</h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 90, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#4b5563" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="#4b5563" tick={{ fontSize: 10 }} width={90} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
                  formatter={(v, name) => [name === 'priority' ? v : v.toLocaleString(), name === 'priority' ? 'Priority Score' : 'Est. Birds Saved']}
                />
                <Bar dataKey="priority" fill="#10b981" radius={[0, 3, 3, 0]} name="priority" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Export */}
        <button
          onClick={exportPlan}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-primary/30 bg-primary/10 text-primary text-sm font-semibold rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Restoration Plan CSV
        </button>

        {/* Priority list */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              All Colonies by Priority
            </p>
          </div>
          <div className="divide-y divide-gray-800/40">
            {ranked.slice(0, 25).map(({ colony, hqi, birdDeclinePct, priority }, i) => {
              const isFunded = i < maxColonies;
              return (
                <div key={colony.name} className={`flex items-center gap-3 px-4 py-2.5 ${isFunded ? '' : 'opacity-40'}`}>
                  <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${isFunded ? 'text-primary' : 'text-gray-600'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{colony.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-600">HQI {hqi.score.toFixed(0)}</span>
                      {birdDeclinePct < -5 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                          <TrendingDown className="w-2.5 h-2.5" />
                          {Math.abs(birdDeclinePct).toFixed(0)}% birds
                        </span>
                      )}
                    </div>
                  </div>
                  {isFunded ? (
                    <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded font-medium flex-shrink-0">
                      Funded
                    </span>
                  ) : (
                    <Target className="w-3.5 h-3.5 text-gray-700 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
