import { useState, useEffect, useRef, useCallback } from 'react';
import MapDashboard from './components/MapDashboardLeaflet';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import TimelineSlider from './components/TimelineSlider';
import AIDetectionPanel from './components/AIDetectionPanel';
import AnnotationOverlay from './components/AnnotationOverlay';
import ReportGenerator from './components/ReportGenerator';
import StormImpactPanel from './components/StormImpactPanel';
import ColonyProfile from './components/ColonyProfile';
import SpeciesIntelligence from './components/SpeciesIntelligence';
import RestorationBudgetPlanner from './components/RestorationBudgetPlanner';
import HabitatLossPanel from './components/HabitatLossPanel';
import {
  Satellite, BarChart3, Cpu, MousePointer, FileText,
  Wind, Bird, DollarSign, Search, X,
  ChevronLeft, ChevronRight, MapPin, Layers, PanelRight
} from 'lucide-react';

function App() {
  const [coloniesData, setColoniesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2021);
  const [selectedColony, setSelectedColony] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [showStormImpact, setShowStormImpact] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [showColonyProfile, setShowColonyProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [detectionGeoPoints, setDetectionGeoPoints] = useState([]);
  const [showHabitatLayer, setShowHabitatLayer] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Load colony data
  useEffect(() => {
    import('./data/la_colonies_summary.json')
      .then(module => {
        setColoniesData(module.default);
        setLoading(false);
      })
      .catch(() => {
        fetch('/data/la_colonies_summary.json')
          .then(r => r.json())
          .then(data => { setColoniesData(data); setLoading(false); })
          .catch(() => setLoading(false));
      });
  }, []);

  const handleColonySelect = useCallback((colony) => {
    setSelectedColony(colony);
    setShowColonyProfile(true);
    setRightPanelOpen(true);
  }, []);

  useEffect(() => {
    window.handleColonySelect = handleColonySelect;
    return () => { delete window.handleColonySelect; };
  }, [handleColonySelect]);

  const handleCloseProfile = () => {
    setShowColonyProfile(false);
  };

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.length > 1 && coloniesData.length) {
      const q = query.toLowerCase();
      setSearchResults(
        coloniesData.filter(c => c.name.toLowerCase().includes(q)).slice(0, 8)
      );
    } else {
      setSearchResults([]);
    }
  }, [coloniesData]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowColonyProfile(false);
    setRightPanelOpen(true);
  };

  const tabs = [
    { id: 'analytics',    label: 'Analytics',  icon: BarChart3 },
    { id: 'hurricane',    label: 'Hurricane',  icon: Wind },
    { id: 'species',      label: 'Species',    icon: Bird },
    { id: 'budget',       label: 'Budget',     icon: DollarSign },
    { id: 'ai-detection', label: 'AI Detect',  icon: Cpu },
    { id: 'annotation',   label: 'Annotate',   icon: MousePointer },
    { id: 'habitat',      label: 'Habitat',    icon: Layers },
    { id: 'reports',      label: 'Reports',    icon: FileText },
  ];

  // Shared panel content — rendered in both desktop right panel and mobile bottom sheet
  const renderPanelContent = () => {
    if (showColonyProfile && selectedColony) {
      return (
        <ColonyProfile
          colony={selectedColony}
          selectedYear={selectedYear}
          onClose={handleCloseProfile}
          onViewAI={() => {
            setShowColonyProfile(false);
            setActiveTab('ai-detection');
          }}
        />
      );
    }
    return (
      <>
        {activeTab === 'analytics'    && <AnalyticsSidebar coloniesData={coloniesData} selectedYear={selectedYear} />}
        {activeTab === 'hurricane'    && <StormImpactPanel coloniesData={coloniesData} onStormSelect={setSelectedStorm} onShowImpact={setShowStormImpact} />}
        {activeTab === 'species'      && <SpeciesIntelligence coloniesData={coloniesData} selectedYear={selectedYear} />}
        {activeTab === 'budget'       && <RestorationBudgetPlanner coloniesData={coloniesData} selectedYear={selectedYear} />}
        {activeTab === 'habitat'      && <HabitatLossPanel coloniesData={coloniesData} />}
        {activeTab === 'ai-detection' && <AIDetectionPanel coloniesData={coloniesData} selectedColony={selectedColony} uploadedImage={uploadedImage} setUploadedImage={setUploadedImage} detectionResults={detectionResults} setDetectionResults={setDetectionResults} onDetectionGeoPoints={setDetectionGeoPoints} />}
        {activeTab === 'annotation'   && <AnnotationOverlay uploadedImage={uploadedImage} selectedColony={selectedColony} detectionResults={detectionResults} />}
        {activeTab === 'reports'      && <ReportGenerator coloniesData={coloniesData} selectedYear={selectedYear} />}
      </>
    );
  };

  if (loading) {
    return (
      <div className="h-[100dvh] bg-gray-950 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-primary text-xl font-semibold">Loading EcoLens Louisiana...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing AI-Driven Avian Monitoring</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-gray-950 overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-3 md:px-4 bg-gray-950 border-b border-gray-800 z-50 flex-shrink-0 gap-2 md:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Satellite className="w-5 h-5 md:w-6 md:h-6 text-primary pulse-glow" />
          <div>
            <h1 className="text-sm md:text-base font-bold text-white leading-none">EcoLens</h1>
            <p className="hidden md:block text-[10px] text-gray-600 leading-none mt-0.5">AI-Driven Avian Monitoring</p>
          </div>
        </div>

        {/* Search — full on desktop, icon toggle on mobile */}
        <div className="relative flex-1 max-w-xs md:max-w-sm" ref={searchRef}>
          {/* Desktop search */}
          <div className="hidden md:flex items-center bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 gap-2 focus-within:border-primary/50 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search colonies… (e.g. Breton)"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1 min-w-0"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
                <X className="w-3 h-3 text-gray-600 hover:text-white" />
              </button>
            )}
          </div>
          {/* Mobile search — collapsible */}
          {mobileSearchOpen ? (
            <div className="flex md:hidden items-center bg-gray-900 border border-gray-700 rounded-lg px-2.5 py-1.5 gap-2 focus-within:border-primary/50 transition-colors">
              <Search className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search colonies…"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                className="bg-transparent text-sm text-white placeholder-gray-600 outline-none flex-1 min-w-0"
              />
              <button onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
              </button>
            </div>
          ) : (
            <button
              className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 transition-colors"
              onClick={() => setMobileSearchOpen(true)}
            >
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[9999] overflow-hidden">
              {searchResults.map(colony => (
                <button
                  key={colony.name}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors flex items-center gap-2"
                  onClick={() => {
                    handleColonySelect(colony);
                    setSearchQuery('');
                    setSearchResults([]);
                    setMobileSearchOpen(false);
                  }}
                >
                  <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="truncate">{colony.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right header area */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 md:px-3 py-1.5 rounded-lg">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-medium hidden sm:inline">Live · </span>
            <span className="text-xs text-primary font-medium">{coloniesData.length}</span>
            <span className="text-xs text-primary font-medium hidden sm:inline"> Colonies</span>
          </div>
          {/* Mobile panel toggle */}
          <button
            className="flex md:hidden items-center justify-center w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 hover:border-primary/40 transition-colors"
            onClick={() => setRightPanelOpen(v => !v)}
            title="Toggle panel"
          >
            <PanelRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </header>

      {/* ── Mobile horizontal tab bar ─────────────────────────── */}
      <div className="md:hidden flex-shrink-0 border-b border-gray-800 bg-gray-950 overflow-x-auto no-scrollbar">
        <div className="flex items-center px-2 py-1.5 gap-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !showColonyProfile;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left icon nav — desktop only */}
        <nav className="hidden md:flex w-[76px] flex-col items-center py-4 bg-gray-950 border-r border-gray-800 gap-1.5 z-40 flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !showColonyProfile;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={tab.label}
                className={`w-14 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary ring-1 ring-primary/30'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] mt-1 leading-none font-medium tracking-wide">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Center: Map + Timeline ───────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Map layer toggle bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-950 border-b border-gray-800 flex-shrink-0">
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Layers:</span>
            <button
              onClick={() => setShowHabitatLayer(v => !v)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                showHabitatLayer
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-gray-800/60 border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <Layers className="w-3 h-3" />
              Land Change
            </button>
          </div>

          {/* Map — fills remaining height */}
          <div className="flex-1 relative overflow-hidden min-h-0">
            <MapDashboard
              coloniesData={coloniesData}
              selectedYear={selectedYear}
              onColonySelect={handleColonySelect}
              selectedStorm={selectedStorm}
              showStormImpact={showStormImpact}
              detectionGeoPoints={detectionGeoPoints}
              showHabitatLayer={showHabitatLayer}
            />
          </div>

          {/* Timeline bar — pinned to bottom */}
          <div className="border-t border-gray-800 bg-gray-950 flex-shrink-0">
            <TimelineSlider
              coloniesData={coloniesData}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </div>
        </div>

        {/* ── Right panel — desktop only ───────────────────────── */}
        {rightPanelOpen ? (
          <div className="hidden md:flex w-[460px] flex-col border-l border-gray-800 bg-gray-950 flex-shrink-0 z-[900]">
            {/* Panel top bar with collapse button */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 flex-shrink-0 bg-gray-950">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {showColonyProfile && selectedColony
                  ? selectedColony.name
                  : tabs.find(t => t.id === activeTab)?.label ?? activeTab}
              </span>
              <button
                onClick={() => setRightPanelOpen(false)}
                title="Collapse panel"
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-800 text-gray-500 hover:text-gray-200 transition-colors text-xs"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {renderPanelContent()}
            </div>
          </div>
        ) : (
          /* Expand handle — desktop: thin strip flush with map edge */
          <button
            onClick={() => setRightPanelOpen(true)}
            title="Expand panel"
            className="hidden md:flex w-7 items-center justify-center bg-gray-950 border-l border-gray-700 hover:bg-gray-900 hover:border-primary/40 transition-colors flex-shrink-0 z-[900] group"
          >
            <div className="flex flex-col items-center gap-1.5">
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-primary transition-colors" />
              <div className="w-0.5 h-8 bg-gray-700 rounded-full group-hover:bg-primary/50 transition-colors" />
            </div>
          </button>
        )}
      </div>

      {/* ── Mobile bottom sheet ──────────────────────────────────── */}
      {/* Backdrop */}
      {rightPanelOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[1900] backdrop-blur-sm"
          onClick={() => setRightPanelOpen(false)}
        />
      )}
      {/* Sheet */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-[2000] bg-gray-950 border-t border-gray-700 rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          rightPanelOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '72vh', maxHeight: '72vh' }}
      >
        {/* Drag handle + header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gray-700 rounded-full mx-auto" />
          </div>
          <span className="text-sm font-semibold text-gray-200 capitalize">
            {showColonyProfile && selectedColony
              ? selectedColony.name
              : tabs.find(t => t.id === activeTab)?.label ?? activeTab}
          </span>
          <button
            onClick={() => setRightPanelOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ height: 'calc(72vh - 56px)' }}>
          {renderPanelContent()}
        </div>
      </div>
    </div>
  );
}

export default App;
