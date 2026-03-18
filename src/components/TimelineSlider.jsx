import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, ChevronDown, ChevronUp, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

const MIN_YEAR = 2010;
const MAX_YEAR = 2026;
const SPEEDS = [
  { label: '0.5×', ms: 1600 },
  { label: '1×',   ms: 800 },
  { label: '2×',   ms: 400 },
  { label: '3×',   ms: 220 },
];

export default function TimelineSlider({ coloniesData, selectedYear, onYearChange }) {
  const [isPlaying, setIsPlaying]     = useState(false);
  const [speedIdx, setSpeedIdx]       = useState(1);   // default 1×
  const [expanded, setExpanded]       = useState(false);
  const intervalRef                   = useRef(null);

  // Build complete year dataset (actual → interpolated → predicted)
  const completeYearData = useMemo(() => {
    if (!coloniesData || coloniesData.length === 0) return [];

    const actualYearsSet = new Set();
    coloniesData.forEach(col => col.history.forEach(r => actualYearsSet.add(r.year)));

    const yearlyActual = {};
    for (let yr = MIN_YEAR; yr <= 2021; yr++) {
      let birds = 0, nests = 0, count = 0;
      const spp = new Set();
      coloniesData.forEach(col => {
        const d = col.history.find(h => h.year === yr);
        if (d) { birds += d.birds; nests += d.nests; count++; col.top_species?.forEach(s => spp.add(s)); }
      });
      if (actualYearsSet.has(yr)) {
        yearlyActual[yr] = { year: yr, totalBirds: birds, totalNests: nests, coloniesCount: count, speciesCount: spp.size, isActual: true };
      }
    }

    const all = [];
    for (let yr = MIN_YEAR; yr <= MAX_YEAR; yr++) {
      if (yr <= 2021) {
        if (yearlyActual[yr]) {
          all.push({ ...yearlyActual[yr], isPrediction: false, isInterpolated: false });
        } else {
          const before = Object.keys(yearlyActual).map(Number).filter(y => y < yr).sort((a, b) => b - a);
          const after  = Object.keys(yearlyActual).map(Number).filter(y => y > yr).sort((a, b) => a - b);
          if (before.length && after.length) {
            const b = yearlyActual[before[0]], a = yearlyActual[after[0]];
            const r = (yr - before[0]) / (after[0] - before[0]);
            all.push({
              year: yr,
              totalBirds:    Math.round(b.totalBirds    + (a.totalBirds    - b.totalBirds)    * r),
              totalNests:    Math.round(b.totalNests    + (a.totalNests    - b.totalNests)    * r),
              coloniesCount: Math.round(b.coloniesCount + (a.coloniesCount - b.coloniesCount) * r),
              speciesCount:  Math.round(b.speciesCount  + (a.speciesCount  - b.speciesCount)  * r),
              isActual: false, isPrediction: false, isInterpolated: true,
            });
          }
        }
      } else {
        const recent = Object.keys(yearlyActual).map(Number).filter(y => y >= 2017 && y <= 2021).sort((a, b) => a - b);
        if (recent.length >= 2) {
          const f = yearlyActual[recent[0]], l = yearlyActual[recent[recent.length - 1]];
          const diff = recent[recent.length - 1] - recent[0];
          const yrs  = yr - recent[recent.length - 1];
          const cf   = Math.max(0.6, 1 - yrs * 0.08);
          all.push({
            year: yr,
            totalBirds:    Math.max(0, Math.round(l.totalBirds    + ((l.totalBirds    - f.totalBirds)    / diff) * yrs * cf)),
            totalNests:    Math.max(0, Math.round(l.totalNests    + ((l.totalNests    - f.totalNests)    / diff) * yrs * cf)),
            coloniesCount: l.coloniesCount,
            speciesCount:  Math.max(0, Math.round(l.speciesCount  + ((l.speciesCount  - f.speciesCount)  / diff) * yrs * cf)),
            isActual: false, isPrediction: true, isInterpolated: false,
            confidence: Math.round(cf * 100),
          });
        }
      }
    }
    return all;
  }, [coloniesData]);

  const yearStats = useMemo(() =>
    completeYearData.find(y => y.year === selectedYear) || completeYearData[completeYearData.length - 1],
    [completeYearData, selectedYear]
  );

  const comparisonStats = useMemo(() => {
    const y10 = completeYearData.find(y => y.year === 2010);
    const y21 = completeYearData.find(y => y.year === 2021);
    if (!y10 || !y21) return null;
    return {
      year2010: y10, year2021: y21,
      birdChange: y10.totalBirds > 0 ? ((y21.totalBirds - y10.totalBirds) / y10.totalBirds) * 100 : 0,
      nestChange: y10.totalNests > 0 ? ((y21.totalNests - y10.totalNests) / y10.totalNests) * 100 : 0,
    };
  }, [completeYearData]);

  // ── Play logic ──────────────────────────────────────────────────────────────
  const playMs = SPEEDS[speedIdx].ms;

  const tick = useCallback(() => {
    onYearChange(prev => {
      if (prev >= MAX_YEAR) { setIsPlaying(false); return MAX_YEAR; }
      return prev + 1;
    });
  }, [onYearChange]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tick, playMs);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playMs, tick]);

  const handleReset = () => { setIsPlaying(false); onYearChange(MIN_YEAR); };
  const cycleSpeed  = () => setSpeedIdx(i => (i + 1) % SPEEDS.length);
  const handleSlider = e => { setIsPlaying(false); onYearChange(parseInt(e.target.value)); };

  const sliderPct = ((selectedYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
  const sliderBg  = `linear-gradient(to right, #10b981 0%, #10b981 ${sliderPct}%, #374151 ${sliderPct}%, #374151 100%)`;

  return (
    <div className="bg-gray-950">
      {/* ── Compact bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5">

        {/* Play controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleReset}
            title="Reset to 2010"
            className="p-1.5 rounded-md hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPlaying(p => !p)}
            title={isPlaying ? 'Pause' : 'Play timeline'}
            className={`p-1.5 rounded-md transition-colors ${
              isPlaying
                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                : 'hover:bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {isPlaying
              ? <Pause className="w-3.5 h-3.5" />
              : <Play  className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={cycleSpeed}
            className="text-[11px] font-mono text-gray-500 hover:text-primary px-1.5 py-1 rounded transition-colors w-8 text-center"
            title="Cycle playback speed"
          >
            {SPEEDS[speedIdx].label}
          </button>
        </div>

        {/* Year badge */}
        <div className="flex flex-col items-center flex-shrink-0 w-14">
          <span className="text-lg font-bold text-primary leading-none">{selectedYear}</span>
          {yearStats?.isPrediction && (
            <div className="flex items-center gap-0.5 mt-0.5">
              <Sparkles className="w-2.5 h-2.5 text-sky-400" />
              <span className="text-[9px] text-sky-400">{yearStats.confidence}%</span>
            </div>
          )}
          {yearStats?.isInterpolated && (
            <span className="text-[9px] text-yellow-500 mt-0.5">interp.</span>
          )}
        </div>

        {/* Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={selectedYear}
            onChange={handleSlider}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            style={{ background: sliderBg }}
          />
          {/* Zone ticks */}
          <div className="flex justify-between mt-1 px-0.5">
            {[2010, 2013, 2016, 2019, 2021, 2024, 2026].map(yr => (
              <span
                key={yr}
                className={`text-[9px] hidden sm:inline ${
                  yr === selectedYear ? 'text-primary font-bold'
                  : yr > 2021        ? 'text-sky-600'
                  : 'text-gray-700'
                }`}
              >
                {yr}
              </span>
            ))}
            {/* Mobile: fewer ticks */}
            {[2010, 2021, 2026].map(yr => (
              <span
                key={`m-${yr}`}
                className={`text-[9px] sm:hidden ${
                  yr === selectedYear ? 'text-primary font-bold'
                  : yr > 2021        ? 'text-sky-600'
                  : 'text-gray-700'
                }`}
              >
                {yr}
              </span>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        {yearStats && (
          <div className="hidden lg:flex items-center gap-4 text-xs flex-shrink-0">
            <div>
              <span className="text-gray-600">Birds </span>
              <span className="text-white font-semibold">{(yearStats.totalBirds / 1000).toFixed(0)}K</span>
            </div>
            <div>
              <span className="text-gray-600">Nests </span>
              <span className="text-primary font-semibold">{(yearStats.totalNests / 1000).toFixed(0)}K</span>
            </div>
            <div>
              <span className="text-gray-600">Colonies </span>
              <span className="text-sky-400 font-semibold">{yearStats.coloniesCount}</span>
            </div>
            <div>
              <span className="text-gray-600">Species </span>
              <span className="text-orange-400 font-semibold">{yearStats.speciesCount}</span>
            </div>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex-shrink-0 p-1.5 rounded-md hover:bg-gray-800 text-gray-600 hover:text-gray-300 transition-colors"
          title={expanded ? 'Collapse' : 'Show comparison'}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Expanded comparison panel ────────────────────────────────────── */}
      {expanded && comparisonStats && (
        <div className="border-t border-gray-800 px-4 py-4 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Birds comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Birds · 2010 → 2021</span>
                <span className={`font-bold ${comparisonStats.birdChange >= 0 ? 'text-primary' : 'text-red-400'}`}>
                  {comparisonStats.birdChange >= 0 ? '+' : ''}{comparisonStats.birdChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">2010</span>
                    <span className="text-gray-300">{comparisonStats.year2010.totalBirds.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">2021</span>
                    <span className="text-gray-300">{comparisonStats.year2021.totalBirds.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${comparisonStats.birdChange >= 0 ? 'bg-primary' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((comparisonStats.year2021.totalBirds / comparisonStats.year2010.totalBirds) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Nests comparison */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total Nests · 2010 → 2021</span>
                <span className={`font-bold ${comparisonStats.nestChange >= 0 ? 'text-primary' : 'text-red-400'}`}>
                  {comparisonStats.nestChange >= 0 ? '+' : ''}{comparisonStats.nestChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">2010</span>
                    <span className="text-gray-300">{comparisonStats.year2010.totalNests.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gray-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">2021</span>
                    <span className="text-gray-300">{comparisonStats.year2021.totalNests.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${comparisonStats.nestChange >= 0 ? 'bg-primary' : 'bg-red-500'}`}
                      style={{ width: `${Math.min((comparisonStats.year2021.totalNests / comparisonStats.year2010.totalNests) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-gray-400">
              <span className="text-primary font-semibold">Key Insight: </span>
              {comparisonStats.nestChange >= 0
                ? `Louisiana's coastal restoration shows positive results — nesting activity up ${comparisonStats.nestChange.toFixed(1)}% over the decade.`
                : `Nesting activity declined ${Math.abs(comparisonStats.nestChange).toFixed(1)}% from 2010–2021, signalling critical habitats needing intervention.`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
