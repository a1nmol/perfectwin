import { Link } from 'react-router-dom';
import { useColonies } from '../context/ColoniesContext';
import {
  ArrowRight, Bird, Wind, DollarSign, Cpu, Shield,
  BarChart3, MapPin, Zap, Eye, Globe, ChevronRight, Upload, Satellite
} from 'lucide-react';

/* ── Animated hero background ─────────────────────────────── */
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020b18] via-[#042a1a] to-[#020b18] animate-gradient-shift" />
      {/* Large ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/8 blur-[120px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-400/5 blur-[100px] animate-pulse-slow" />
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Bird silhouettes */}
      <svg className="absolute top-32 left-20 animate-bird-fly opacity-20" width="48" height="24" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      <svg className="absolute top-48 right-32 animate-bird-fly-2 opacity-15" width="36" height="18" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      <svg className="absolute top-60 left-1/2 animate-bird-fly-3 opacity-10" width="30" height="15" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      {/* Particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-400/30 animate-particle"
          style={{
            left: `${5 + (i * 4.7) % 90}%`,
            top: `${10 + (i * 7.3) % 80}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${4 + (i % 5)}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────── */
function StatCard({ value, label, icon: Icon, color }) {
  return (
    <div className={`flex flex-col items-center p-5 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm hover:bg-white/5 transition-all duration-300 group`}>
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-slate-400 text-xs mt-1 text-center">{label}</span>
    </div>
  );
}

/* ── Feature card ──────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, description, href, color, delay }) {
  return (
    <Link
      to={href}
      className="group relative p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/30 backdrop-blur-sm hover:bg-white/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 block"
      style={{ animationDelay: delay }}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      <div className="flex items-center gap-1 mt-4 text-emerald-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Explore <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}

/* ── How it works step ─────────────────────────────────────── */
function Step({ num, title, desc, icon: Icon }) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="relative mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 group-hover:border-emerald-400/60 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
          <Icon className="w-7 h-7 text-emerald-400" />
        </div>
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">{num}</span>
      </div>
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <p className="text-slate-400 text-sm leading-relaxed max-w-[180px]">{desc}</p>
    </div>
  );
}

/* ── Bird preview card ─────────────────────────────────────── */
function BirdPreviewCard({ name, species, status, color, emoji }) {
  return (
    <Link to="/gallery" className="group block p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-full h-32 rounded-xl mb-4 flex items-center justify-center text-5xl ${color} transition-transform duration-300 group-hover:scale-110`}>
        {emoji}
      </div>
      <h4 className="text-white font-semibold text-sm">{name}</h4>
      <p className="text-slate-500 text-xs mt-0.5">{species}</p>
      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        status === 'Endangered' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
        status === 'Vulnerable' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
      }`}>
        {status}
      </span>
    </Link>
  );
}

export default function Home() {
  const { coloniesData } = useColonies();

  return (
    <div className="min-h-screen bg-[#020b18]">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <HeroBg />

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered · Louisiana Coastal Monitoring · Live Data
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            <span className="block">EcoLens:</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              AI-Powered Bird
            </span>
            <span className="block text-slate-200 text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-bold mt-1">
              Detection & Conservation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time monitoring of 190+ avian colonies across Louisiana's coastline. Harness AI to identify species, track storm impacts, and power evidence-based conservation.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/upload"
              className="group flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
            >
              <Upload className="w-5 h-5" />
              Upload Bird Image
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-white font-semibold text-base transition-all duration-300 backdrop-blur-sm"
            >
              <Satellite className="w-5 h-5 text-emerald-400" />
              Open Live Map
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <StatCard value={`${coloniesData.length || '190'}+`} label="Monitored Colonies" icon={MapPin} color="bg-emerald-500/15 text-emerald-400" />
            <StatCard value="40+" label="Bird Species" icon={Bird} color="bg-sky-500/15 text-sky-400" />
            <StatCard value="16yr" label="Historical Data" icon={BarChart3} color="bg-violet-500/15 text-violet-400" />
            <StatCard value="99%" label="AI Accuracy" icon={Cpu} color="bg-amber-500/15 text-amber-400" />
          </div>
        </div>

        {/* Floating feature cards */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4 overflow-hidden pointer-events-none">
          {[
            { label: 'Real-Time AI Detection', icon: '🦅' },
            { label: 'Bird Ecology Insights', icon: '🌿' },
            { label: 'Conservation Tracking', icon: '📊' },
            { label: 'Species Database', icon: '🗂️' },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg text-sm text-slate-300 whitespace-nowrap">
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How EcoLens Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Four simple steps from image upload to actionable conservation insight</p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              <Step num="1" title="Upload Bird Image" desc="Drag & drop your aerial or field photo of birds" icon={Upload} />
              <Step num="2" title="AI Analyzes & Identifies" desc="YOLOv11 model detects and classifies each species" icon={Cpu} />
              <Step num="3" title="View Bird Details" desc="Habitat, diet, behavior, and conservation status" icon={Eye} />
              <Step num="4" title="Support Conservation" desc="Data feeds into regional monitoring and policy" icon={Shield} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Full Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything You Need</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From storm tracking to budget planning — a complete conservation toolkit</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Cpu} title="AI Bird Detection" href="/upload"
              description="Upload aerial images and let YOLOv11 identify species with confidence scores, bounding boxes, and geographic coordinates."
              color="bg-emerald-500/15 text-emerald-400" delay="0ms"
            />
            <FeatureCard
              icon={Wind} title="Hurricane Tracker" href="/hurricane"
              description="Model storm impacts on bird colonies. Visualize track paths, impact radii, and recovery projections for each hurricane season."
              color="bg-sky-500/15 text-sky-400" delay="100ms"
            />
            <FeatureCard
              icon={DollarSign} title="Restoration Budget Planner" href="/budget"
              description="Allocate conservation budgets with evidence-based ROI metrics. Plan habitat restoration projects across Louisiana's coast."
              color="bg-violet-500/15 text-violet-400" delay="200ms"
            />
            <FeatureCard
              icon={BarChart3} title="Analytics Dashboard" href="/analytics"
              description="Explore 16 years of colony population trends, species richness indices, and habitat quality scores in interactive charts."
              color="bg-amber-500/15 text-amber-400" delay="300ms"
            />
            <FeatureCard
              icon={Globe} title="Bird Encyclopedia" href="/gallery"
              description="Discover 40+ Louisiana coastal bird species with detailed profiles — habitat, diet, behavior, and conservation status."
              color="bg-teal-500/15 text-teal-400" delay="400ms"
            />
            <FeatureCard
              icon={Zap} title="AI Tools Suite" href="/ai-tools"
              description="Access species intelligence, habitat loss analysis, model validation, and annotation tools all in one integrated platform."
              color="bg-rose-500/15 text-rose-400" delay="500ms"
            />
          </div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ───────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#042a1a]/20 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-2">Avian Gallery</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Meet Louisiana's Birds</h2>
            </div>
            <Link to="/gallery" className="flex items-center gap-2 text-emerald-400 text-sm font-medium hover:gap-3 transition-all">
              View All Species <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <BirdPreviewCard name="Brown Pelican" species="Pelecanus occidentalis" status="Least Concern" color="bg-gradient-to-br from-amber-500/15 to-amber-600/5" emoji="🐦" />
            <BirdPreviewCard name="Roseate Spoonbill" species="Platalea ajaja" status="Least Concern" color="bg-gradient-to-br from-rose-500/15 to-pink-600/5" emoji="🦩" />
            <BirdPreviewCard name="Great Blue Heron" species="Ardea herodias" status="Least Concern" color="bg-gradient-to-br from-blue-500/15 to-blue-600/5" emoji="🦅" />
          </div>
        </div>
      </section>

      {/* ── CONSERVATION CTA ──────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <span className="text-4xl block mb-4">🌿</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Conservation Mission</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Louisiana loses over 25 square miles of coastal habitat each year. Every bird observation contributes to a richer dataset that powers conservation policy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/upload" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/30">
                <Upload className="w-5 h-5" />
                Upload a Bird Photo
              </Link>
              <Link to="/conservation" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all duration-300">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ─────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-8">Trusted Data Sources & Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['USGS Coastal Research', 'LDWF', 'Audubon Society', 'LSU Coastal Lab', 'NOAA'].map(org => (
              <span key={org} className="text-slate-500 text-sm font-medium hover:text-slate-300 transition-colors cursor-default">{org}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
