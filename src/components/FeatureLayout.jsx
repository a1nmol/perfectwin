import { useState, useRef, useCallback } from 'react';
import { X, PanelRight, Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import MapDashboard from './MapDashboardLeaflet';
import TimelineSlider from './TimelineSlider';
import ColonyProfile from './ColonyProfile';
import { useColonies } from '../context/ColoniesContext';

/**
 * Shared full-viewport layout for all map-based feature pages.
 * - Left: Leaflet map (fills remaining width)
 * - Right: collapsible panel (440px on desktop, bottom sheet on mobile)
 * - Bottom: optional year timeline
 *
 * Props:
 *   title        – page label shown in top bar
 *   icon         – lucide icon element
 *   accentColor  – tailwind text color class for icon/active states
 *   panel        – React node rendered inside the right panel
 *   extraMapProps – additional props forwarded to MapDashboard
 *   showTimeline – show the year slider (default true)
 *   headerRight  – optional extra controls for the top bar
 */
export default function FeatureLayout({
  title,
  icon,
  accentColor = 'text-emerald-400',
  panel,
  extraMapProps = {},
  showTimeline = true,
  headerRight,
  onColonySelect: externalColonySelect,
  onYearChange: externalYearChange,
  selectedYear: externalYear,
}) {
  const { coloniesData } = useColonies();
  const [selectedYear, setSelectedYear]       = useState(externalYear ?? 2021);
  const [selectedColony, setSelectedColony]   = useState(null);
  const [showColonyProfile, setShowColonyProfile] = useState(false);
  const [rightOpen, setRightOpen]             = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const searchRef = useRef(null);

  const handleYear = (yr) => {
    setSelectedYear(yr);
    externalYearChange?.(yr);
  };

  const handleColonySelect = useCallback((colony) => {
    setSelectedColony(colony);
    setShowColonyProfile(true);
    setRightOpen(true);
    setMobileSheetOpen(true);
    externalColonySelect?.(colony);
  }, [externalColonySelect]);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (q.length > 1 && coloniesData.length) {
      setSearchResults(coloniesData.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
    } else {
      setSearchResults([]);
    }
  }, [coloniesData]);

  const resolvedPanel = showColonyProfile && selectedColony
    ? (
        <ColonyProfile
          colony={selectedColony}
          selectedYear={selectedYear}
          onClose={() => setShowColonyProfile(false)}
          onViewAI={() => setShowColonyProfile(false)}
        />
      )
    : panel;

  return (
    <div className="flex flex-col bg-[#020b18]" style={{ height: 'calc(100vh - 5rem)', marginTop: '5rem' }} /* navbar is h-20 = 5rem */>

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 md:px-4 h-11 border-b border-white/6 bg-[#020b18]/95 backdrop-blur-sm flex-shrink-0 z-50">
        <div className={`flex items-center gap-2 ${accentColor}`}>
          {icon}
          <span className="text-white font-semibold text-sm hidden sm:inline">{title}</span>
        </div>

        {/* Colony search */}
        <div className="relative flex-1 max-w-xs hidden md:block" ref={searchRef}>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1 gap-2 focus-within:border-emerald-500/40 transition-colors">
            <Search className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search colonies…"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-slate-600 outline-none flex-1"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                <X className="w-3 h-3 text-slate-500 hover:text-white" />
              </button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a1628] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden">
              {searchResults.map(c => (
                <button
                  key={c.name}
                  onClick={() => { handleColonySelect(c); setSearchQuery(''); setSearchResults([]); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live badge */}
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium hidden sm:inline">Live · </span>
          <span className="text-emerald-400 text-xs font-medium">{coloniesData.length}</span>
          <span className="text-emerald-400 text-xs font-medium hidden sm:inline"> colonies</span>
        </div>

        {headerRight}

        {/* Mobile panel toggle */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-slate-400"
          onClick={() => setMobileSheetOpen(v => !v)}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main split ───────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Map */}
        <div className="flex-1 relative overflow-hidden min-w-0">
          <MapDashboard
            coloniesData={coloniesData}
            selectedYear={selectedYear}
            onColonySelect={handleColonySelect}
            {...extraMapProps}
          />
        </div>

        {/* Right panel — desktop */}
        {rightOpen ? (
          <div className="hidden md:flex w-[440px] flex-col flex-shrink-0 border-l border-white/6 bg-[#020b18] z-40">
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/6 flex-shrink-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {showColonyProfile && selectedColony ? selectedColony.name : title}
              </span>
              <button onClick={() => setRightOpen(false)} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors text-xs">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {resolvedPanel}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setRightOpen(true)}
            className="hidden md:flex w-6 items-center justify-center bg-[#020b18] border-l border-white/8 hover:bg-white/3 transition-colors flex-shrink-0 z-40 group"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
          </button>
        )}
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className="border-t border-white/6 bg-[#020b18] flex-shrink-0">
          <TimelineSlider coloniesData={coloniesData} selectedYear={selectedYear} onYearChange={handleYear} />
        </div>
      )}

      {/* ── Mobile bottom sheet ──────────────────────────────── */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[1900]" onClick={() => setMobileSheetOpen(false)} />
      )}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[2000] bg-[#0a1628] border-t border-white/8 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          mobileSheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '70vh' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
          <span className="text-sm font-semibold text-white">
            {showColonyProfile && selectedColony ? selectedColony.name : title}
          </span>
          <button onClick={() => setMobileSheetOpen(false)} className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto custom-scrollbar" style={{ height: 'calc(70vh - 56px)' }}>
          {resolvedPanel}
        </div>
      </div>
    </div>
  );
}
