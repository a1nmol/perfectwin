import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bird, Menu, X, ChevronDown, User, Trophy, Camera, Zap, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLevelInfo } from '../context/GameContext';

const features = [
  { label: 'Colony Analytics',     href: '/analytics', icon: '📊', desc: 'Population trends & HQI scores' },
  { label: 'Bird AI Detection',    href: '/upload',    icon: '🦅', desc: 'Upload images · YOLOv11 identify' },
  { label: 'Hurricane Tracker',    href: '/hurricane', icon: '🌀', desc: 'Storm impact & recovery modeling' },
  { label: 'Restoration Budget',   href: '/budget',    icon: '💰', desc: 'Allocate conservation resources' },
  { label: 'Species Intelligence', href: '/species',   icon: '🐦', desc: 'Richness indices & species data' },
  { label: 'Habitat Loss Analysis',href: '/habitat',   icon: '🌿', desc: 'Coastal land-loss projections' },
  { label: 'Report Generator',     href: '/reports',   icon: '📄', desc: 'Export executive PDF reports' },
];

const navLinks = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '/about' },
  { label: 'Gallery',      href: '/gallery' },
  { label: 'Features',     href: '#', children: features },
  { label: 'Conservation', href: '/conservation' },
  { label: 'Leaderboard',  href: '/leaderboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [featuresOpen, setFeaturesOpen]   = useState(false);
  const [mobileFeatures, setMobileFeatures] = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);

  const location     = useLocation();
  const dropdownRef  = useRef(null);
  const userMenuRef  = useRef(null);
  const featureTimeout = useRef(null);

  const { user, profile, signOut } = useAuth();
  const xp        = profile?.xp || 0;
  const levelInfo = getLevelInfo(xp);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setFeaturesOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const isActive   = (href) => location.pathname === href;
  const openFeatures  = () => { clearTimeout(featureTimeout.current); setFeaturesOpen(true); };
  const closeFeatures = () => { featureTimeout.current = setTimeout(() => setFeaturesOpen(false), 120); };

  async function handleSignOut() {
    await signOut();
    setUserMenuOpen(false);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
      scrolled
        ? 'bg-[#020b18]/92 backdrop-blur-2xl border-b border-white/6 shadow-2xl shadow-black/40'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ───────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-500/30 group-hover:border-emerald-400/60 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
              <Bird className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Eco<span className="text-emerald-400">Lens</span></span>
              <p className="text-[10px] text-slate-500 leading-none tracking-wider uppercase hidden md:block">Louisiana · Citizen Science</p>
            </div>
          </Link>

          {/* ── Desktop nav links ───────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(link =>
              link.children ? (
                <div
                  key="features"
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={openFeatures}
                  onMouseLeave={closeFeatures}
                >
                  <button
                    onClick={() => setFeaturesOpen(v => !v)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      featuresOpen || features.some(f => isActive(f.href))
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {featuresOpen && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] rounded-2xl bg-[#0a1628]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden"
                      onMouseEnter={openFeatures}
                      onMouseLeave={closeFeatures}
                    >
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Platform Features</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1 p-3">
                        {link.children.map(child => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-150 group ${
                              isActive(child.href) ? 'bg-emerald-500/15 border border-emerald-500/20' : 'hover:bg-white/5'
                            }`}
                          >
                            <span className="text-xl mt-0.5 flex-shrink-0">{child.icon}</span>
                            <div>
                              <p className={`text-sm font-medium leading-snug transition-colors ${isActive(child.href) ? 'text-emerald-400' : 'text-slate-200 group-hover:text-white'}`}>
                                {child.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{child.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="px-4 pb-4">
                        <Link to="/ai-tools" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors">
                          View All Tools Overview →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* ── Right side ─────────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-2">

            {user ? (
              /* ── Logged-in: user avatar + click dropdown ──── */
              <div className="flex items-center gap-2">

                {/* Avatar button — CLICK to open/close */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(v => !v)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                      userMenuOpen
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                    }`}
                  >
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-base font-bold text-emerald-300 flex-shrink-0">
                      {(profile?.username || user.email)[0].toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-white text-xs font-semibold leading-none">
                        @{profile?.username || user.email.split('@')[0]}
                      </p>
                      <p className="text-emerald-400 text-[10px] leading-none mt-0.5">
                        {xp} XP · Lv.{levelInfo.level}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-[#0a1628]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">

                      {/* XP progress bar */}
                      <div className="px-4 py-3 border-b border-white/6">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-emerald-400 text-xs font-semibold">{levelInfo.title}</span>
                          <span className="text-slate-500 text-[10px]">{xp} XP</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${levelInfo.progress}%` }} />
                        </div>
                        {levelInfo.next && (
                          <p className="text-slate-600 text-[10px] mt-1">{levelInfo.next.min - xp} XP to {levelInfo.next.title}</p>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5">
                        {[
                          { icon: User,    label: 'My Profile',       href: '/profile',     color: 'text-slate-300' },
                          { icon: Settings,label: 'Edit Profile',     href: '/profile?edit=1', color: 'text-slate-300' },
                          { icon: Trophy,  label: 'Leaderboard',      href: '/leaderboard', color: 'text-slate-300' },
                          { icon: Camera,  label: 'Log a Sighting',   href: '/submit',      color: 'text-slate-300' },
                          { icon: Zap,     label: 'Weekly Challenge', href: '/challenge',   color: 'text-slate-300' },
                        ].map(({ icon: Icon, label, href, color }) => (
                          <Link
                            key={href}
                            to={href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-white/5 transition-all group"
                          >
                            <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                            <span className={`${color} group-hover:text-white transition-colors`}>{label}</span>
                          </Link>
                        ))}

                        <div className="border-t border-white/6 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                          >
                            <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Logged out: Sign In + Join Now ─────────────── */
              <>
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all">
                  Sign In
                </Link>
                <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105">
                  <Bird className="w-4 h-4" /> Join Now
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ───────────────────────────────── */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────────────────── */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-[90vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-[#0a1628]/98 backdrop-blur-2xl border-t border-white/5 px-4 py-4 space-y-1 overflow-y-auto max-h-[80vh]">

          {/* Logged-in mobile user card */}
          {user && (
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15 hover:border-emerald-500/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/40 to-teal-500/30 border border-emerald-500/40 flex items-center justify-center text-lg font-bold text-emerald-300 flex-shrink-0">
                {(profile?.username || user.email)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">@{profile?.username || user.email.split('@')[0]}</p>
                <p className="text-emerald-400 text-xs">{xp} XP · {levelInfo.title}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-500" />
            </Link>
          )}

          {navLinks.map(link =>
            link.children ? (
              <div key="features-mobile">
                <button
                  onClick={() => setMobileFeatures(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Features
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileFeatures ? 'rotate-180' : ''}`} />
                </button>
                {mobileFeatures && (
                  <div className="mt-1 space-y-0.5 pl-2">
                    {link.children.map(child => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive(child.href) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{child.icon}</span> {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.href) ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          )}

          <div className="pt-2 border-t border-white/5 space-y-2">
            {user ? (
              <>
                <Link to="/submit"    onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold"><Camera className="w-4 h-4" /> Log a Sighting</Link>
                <Link to="/challenge" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold"><Zap className="w-4 h-4" /> Weekly Challenge</Link>
                <Link to="/profile"   onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold"><User className="w-4 h-4" /> My Profile</Link>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/3 border border-white/8 text-red-400 text-sm font-semibold"><LogOut className="w-4 h-4" /> Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold"><Bird className="w-4 h-4" /> Join Now</Link>
                <Link to="/login" className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
