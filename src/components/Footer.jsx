import { Link } from 'react-router-dom';
import { Bird, Instagram, Linkedin, Mail, MapPin, Phone, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#020b18] border-t border-white/5 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      <div className="absolute top-0 left-1/4 w-80 h-40 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-40 bg-sky-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 border border-emerald-500/30">
                <Bird className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white">Eco<span className="text-emerald-400">Lens</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              AI-powered avian monitoring and conservation platform for Louisiana's coastal ecosystems. Protecting birds, one data point at a time.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/anmoleverywhere" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-pink-400 hover:border-pink-400/30 transition-all" title="@anmoleverywhere">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.linkedin.com/in/anmolsubedi/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-400/30 transition-all" title="Anmol Subedi">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:whoisanmolsubediii@gmail.com" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Bird AI Detection', href: '/upload' },
                { label: 'Hurricane Tracker', href: '/hurricane' },
                { label: 'Budget Planner', href: '/budget' },
                { label: 'AI Tools', href: '/ai-tools' },
              ].map(item => (
                <li key={item.href}>
                  <Link to={item.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Conservation', href: '/conservation' },
                { label: 'Bird Gallery', href: '/gallery' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Contact', href: '/contact' },
              ].map(item => (
                <li key={item.href}>
                  <Link to={item.href} className="text-slate-400 hover:text-emerald-400 text-sm transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">University of Louisiana at Monroe, Monroe, LA</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-400 text-sm">(408) 373-3254</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="mailto:whoisanmolsubediii@gmail.com" className="text-slate-400 hover:text-emerald-400 text-sm transition-colors">whoisanmolsubediii@gmail.com</a>
              </li>
            </ul>

            <div className="mt-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-semibold">Live Monitoring</span>
              </div>
              <p className="text-slate-400 text-xs">190+ colonies tracked in real time across Louisiana coast</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm flex items-center gap-1.5">
            © 2026 EcoLens. Built with <Heart className="w-3.5 h-3.5 text-emerald-400" /> for Louisiana wildlife.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Data Sources</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
