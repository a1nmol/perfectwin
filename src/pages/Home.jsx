import { Link } from 'react-router-dom';
import { useColonies } from '../context/ColoniesContext';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo } from '../context/GameContext';
import {
  ArrowRight, Bird, Wind, DollarSign, Cpu, Shield,
  BarChart3, MapPin, Zap, Eye, Globe, ChevronRight,
  Upload, Satellite, Trophy, Camera, Star, Users
} from 'lucide-react';

const SEED_LEADERBOARD = [
  { username: 'pelican_pete',   xp: 2840, emoji: '🦅' },
  { username: 'bayou_birder',   xp: 2210, emoji: '🐦' },
  { username: 'marsh_maven',    xp: 1890, emoji: '🦩' },
  { username: 'tern_tracker',   xp: 1540, emoji: '🐤' },
  { username: 'spoonbill_sara', xp: 1230, emoji: '🕊️' },
];

/* ── Animated hero background ─────────────────────────────── */
function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#020b18] via-[#042a1a] to-[#020b18] animate-gradient-shift" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/8 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/8 blur-[120px] animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-400/5 blur-[100px] animate-pulse-slow" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <svg className="absolute top-32 left-20 animate-bird-fly opacity-20" width="48" height="24" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      <svg className="absolute top-48 right-32 animate-bird-fly-2 opacity-15" width="36" height="18" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      <svg className="absolute top-60 left-1/2 animate-bird-fly-3 opacity-10" width="30" height="15" viewBox="0 0 48 24">
        <path d="M0 12 C6 4 12 0 24 6 C36 12 42 8 48 0" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full bg-emerald-400/30 animate-particle"
          style={{ left: `${5 + (i * 4.7) % 90}%`, top: `${10 + (i * 7.3) % 80}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${4 + (i % 5)}s` }} />
      ))}
    </div>
  );
}

function StatCard({ value, label, icon: Icon, color }) {
  return (
    <div className="flex flex-col items-center p-5 rounded-2xl bg-white/3 border border-white/8 backdrop-blur-sm hover:bg-white/5 transition-all duration-300">
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">{value}</span>
      <span className="text-slate-400 text-xs mt-1 text-center">{label}</span>
    </div>
  );
}

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
      }`}>{status}</span>
    </Link>
  );
}

function XPMiniCard({ xp }) {
  const info = getLevelInfo(xp);
  return (
    <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
      {xp.toLocaleString()} XP
    </div>
  );
}

export default function Home() {
  const { coloniesData } = useColonies();
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-[#020b18]">

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <HeroBg />

        <div className="relative z-10 max-w-5xl mx-auto text-center pt-24 pb-16">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Citizen Science · Louisiana Coastal Monitoring · Live Data
          </div>

          {/* Title */}
          {user ? (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-4">
                <span className="block">Welcome back,</span>
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  @{profile?.username || user.email.split('@')[0]}
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
                {profile?.sightings_count > 0
                  ? `You've logged ${profile.sightings_count} observation${profile.sightings_count !== 1 ? 's' : ''}. Louisiana's birds thank you.`
                  : 'Log your first bird sighting and start earning XP today.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  to="/submit"
                  className="group flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                >
                  <Camera className="w-5 h-5" />
                  Log a Sighting
                  <span className="text-emerald-200 text-xs font-normal">+10 XP</span>
                </Link>
                <Link
                  to="/challenge"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/15 text-sky-300 font-semibold text-base transition-all duration-300"
                >
                  <Zap className="w-5 h-5" /> Weekly Challenge
                  <span className="text-sky-500 text-xs font-normal">+50 XP</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
                <span className="block">Become a</span>
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                  Coastal Guardian
                </span>
                <span className="block text-slate-200 text-4xl sm:text-5xl md:text-[3.5rem] font-bold mt-1">
                  for Louisiana's Birds
                </span>
              </h1>
              <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Join citizen scientists monitoring 190+ bird colonies. Log sightings, earn XP and badges, compete on the leaderboard, and power real conservation decisions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  to="/login"
                  className="group flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold text-base transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105"
                >
                  <Bird className="w-5 h-5" />
                  Join for Free
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
            </>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <StatCard value={`${coloniesData.length || '190'}+`} label="Monitored Colonies" icon={MapPin}   color="bg-emerald-500/15 text-emerald-400" />
            <StatCard value="40+"  label="Bird Species"    icon={Bird}    color="bg-sky-500/15 text-sky-400" />
            <StatCard value="16yr" label="Historical Data" icon={BarChart3} color="bg-violet-500/15 text-violet-400" />
            <StatCard value="99%"  label="AI Accuracy"    icon={Cpu}     color="bg-amber-500/15 text-amber-400" />
          </div>
        </div>

        {/* Floating tags */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-4 overflow-hidden pointer-events-none">
          {[
            { label: 'Earn XP & Badges',    icon: '⭐' },
            { label: 'Real-Time AI',         icon: '🦅' },
            { label: 'Colony Monitoring',    icon: '📊' },
            { label: 'Adopt a Colony',       icon: '🏡' },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-lg text-sm text-slate-300 whitespace-nowrap">
              <span>{icon}</span>{label}
            </div>
          ))}
        </div>

        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
          <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── HOW TO CONTRIBUTE ─────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Get Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How to Become a Citizen Scientist</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Four steps to start contributing and earning rewards</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
              <Step num="1" title="Create Account"    desc="Join free and set up your citizen science profile" icon={Users} />
              <Step num="2" title="Log Sightings"     desc="Submit bird observations from the field or coast"  icon={Camera} />
              <Step num="3" title="Earn XP & Badges"  desc="Gain points for every verified contribution"       icon={Star} />
              <Step num="4" title="Climb the Ranks"   desc="Compete and become an Expert Ornithologist"        icon={Trophy} />
            </div>
          </div>
          {!user && (
            <div className="text-center mt-12">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
              >
                Start Your Journey <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── LEADERBOARD PREVIEW ───────────────────────────────── */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-widest block mb-2">Community</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Top Citizen Scientists</h2>
              <p className="text-slate-400 text-sm mt-1">This week's most active conservation contributors</p>
            </div>
            <Link to="/leaderboard" className="flex items-center gap-2 text-amber-400 text-sm font-medium hover:gap-3 transition-all">
              Full Leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-2 mb-6">
            {SEED_LEADERBOARD.map((entry, idx) => (
              <div key={entry.username} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                idx === 0 ? 'bg-amber-500/6 border-amber-500/15' : 'bg-white/2 border-white/6'
              }`}>
                <span className="text-xl flex-shrink-0">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-slate-500 font-bold text-sm w-5 text-center">#{idx+1}</span>}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-base flex-shrink-0">
                  {entry.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">@{entry.username}</p>
                  <p className="text-slate-500 text-xs">{getLevelInfo(entry.xp).title}</p>
                </div>
                <XPMiniCard xp={entry.xp} />
              </div>
            ))}
          </div>

          {!user && (
            <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-center">
              <p className="text-slate-300 text-sm mb-3">Your name could be on this leaderboard. Join today and start earning XP.</p>
              <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all">
                Join Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── LIVE MAP CTA ──────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-950/10 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-sky-500/20 bg-gradient-to-br from-sky-500/5 via-emerald-500/5 to-sky-500/5">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: text */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6 self-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Live Satellite Data
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Explore the<br />
                  <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">Live Colony Map</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
                  {coloniesData.length || '190'}+ monitored colonies plotted on satellite imagery. Filter by species richness, toggle habitat loss zones, run hurricane impact simulations, and see real citizen sightings — all in one map.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/analytics"
                    className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all hover:scale-105 shadow-lg shadow-sky-500/30"
                  >
                    <Satellite className="w-4 h-4" />
                    Open Live Map
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/analytics"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/4 border border-white/10 hover:bg-white/8 text-slate-300 font-semibold text-sm transition-all"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    Adopt a Colony
                  </Link>
                </div>
              </div>
              {/* Right: stat tiles */}
              <div className="p-10 md:p-14 flex flex-col justify-center gap-4">
                {[
                  { icon: MapPin,   value: `${coloniesData.length || '190'}+`, label: 'Active colonies tracked',   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                  { icon: Eye,      value: '16yr',                             label: 'Historical population data', color: 'text-sky-400',     bg: 'bg-sky-500/10 border-sky-500/20' },
                  { icon: Shield,   value: '40+',                              label: 'Bird species monitored',     color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
                  { icon: Zap,      value: 'Live',                             label: 'Citizen sightings layer',    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
                ].map(({ icon: Icon, value, label, color, bg }) => (
                  <div key={label} className={`flex items-center gap-4 p-4 rounded-2xl border ${bg}`}>
                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className={`font-bold text-lg leading-none ${color}`}>{value}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ─────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Full Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything in One Place</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From storm tracking to AI detection — a complete conservation toolkit</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard icon={Cpu}       title="AI Bird Detection"        href="/upload"    description="Upload aerial images and let YOLOv11 identify species with confidence scores, bounding boxes, and geographic coordinates." color="bg-emerald-500/15 text-emerald-400" delay="0ms" />
            <FeatureCard icon={Wind}      title="Hurricane Tracker"        href="/hurricane" description="Model storm impacts on bird colonies. Visualize track paths, impact radii, and recovery projections." color="bg-sky-500/15 text-sky-400" delay="100ms" />
            <FeatureCard icon={DollarSign}title="Restoration Budget"       href="/budget"    description="Allocate conservation budgets with evidence-based ROI metrics across Louisiana's coast." color="bg-violet-500/15 text-violet-400" delay="200ms" />
            <FeatureCard icon={BarChart3} title="Analytics Dashboard"      href="/analytics" description="Explore 16 years of colony population trends, species richness indices, and habitat quality scores." color="bg-amber-500/15 text-amber-400" delay="300ms" />
            <FeatureCard icon={Globe}     title="Bird Encyclopedia"        href="/gallery"   description="Discover 40+ Louisiana coastal bird species with habitat, diet, behavior, and conservation status." color="bg-teal-500/15 text-teal-400" delay="400ms" />
            <FeatureCard icon={Zap}       title="AI Tools Suite"           href="/ai-tools"  description="Species intelligence, habitat loss analysis, model validation, and annotation tools in one platform." color="bg-rose-500/15 text-rose-400" delay="500ms" />
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
            <BirdPreviewCard name="Brown Pelican"     species="Pelecanus occidentalis" status="Least Concern" color="bg-gradient-to-br from-amber-500/15 to-amber-600/5" emoji="🐦" />
            <BirdPreviewCard name="Roseate Spoonbill" species="Platalea ajaja"         status="Least Concern" color="bg-gradient-to-br from-rose-500/15 to-pink-600/5"  emoji="🦩" />
            <BirdPreviewCard name="Great Blue Heron"  species="Ardea herodias"         status="Least Concern" color="bg-gradient-to-br from-blue-500/15 to-blue-600/5"  emoji="🦅" />
          </div>
        </div>
      </section>

      {/* ── MAIN CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
            <span className="text-4xl block mb-4">🌿</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Conservation Mission</h2>
            <p className="text-slate-300 text-lg mb-6 max-w-xl mx-auto leading-relaxed">
              Louisiana loses over 25 square miles of coastal habitat each year. Your bird observations power conservation decisions that protect thousands of nesting birds.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 max-w-xl mx-auto">
              {[['⭐','Earn XP'],['🏆','Leaderboard'],['🔭','Real Impact'],['🏡','Adopt Colony']].map(([icon,label]) => (
                <div key={label} className="p-3 rounded-xl bg-white/4 border border-white/8 text-center">
                  <span className="text-2xl block mb-1">{icon}</span>
                  <span className="text-slate-300 text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <>
                  <Link to="/submit"    className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"><Camera className="w-5 h-5" /> Log a Sighting</Link>
                  <Link to="/challenge" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all"><Zap className="w-5 h-5 text-sky-400" /> Weekly Challenge</Link>
                </>
              ) : (
                <>
                  <Link to="/login"        className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-500/30"><Bird className="w-5 h-5" /> Join Free</Link>
                  <Link to="/conservation" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all">Learn More <ArrowRight className="w-4 h-4" /></Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ─────────────────────────────────────────────── */}
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
