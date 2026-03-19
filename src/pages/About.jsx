import { Link } from 'react-router-dom';
import { Bird, Target, Globe, Cpu, Users, ArrowRight, CheckCircle, Mail, Phone, MapPin, Code2 } from 'lucide-react';

const values = [
  { icon: Target, title: 'Data-Driven Conservation', desc: 'Every decision is backed by 16 years of rigorous field observations, satellite data, and AI-analyzed imagery.' },
  { icon: Globe, title: 'Ecosystem Thinking', desc: 'Birds are indicators of ecosystem health. Protecting them means protecting Louisiana\'s fisheries, wetlands, and communities.' },
  { icon: Cpu, title: 'AI for Good', desc: 'We democratize advanced computer vision — making species identification accessible to field researchers without deep ML expertise.' },
  { icon: Users, title: 'Open Collaboration', desc: 'Data is shared with USGS, LDWF, and Audubon Society to maximize conservation impact across organizations.' },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">

      {/* Page header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#042a1a] to-[#020b18]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/8 blur-[100px]" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Who We Are</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Protecting Louisiana's Skies<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">One Bird at a Time</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            EcoLens is an AI-powered avian monitoring platform built to protect Louisiana's extraordinary coastal bird diversity through data, technology, and conservation science.
          </p>
        </div>
      </div>

      {/* Mission statement */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed mb-5">
              Louisiana's coastal wetlands host one of North America's most biodiverse avian ecosystems — from Brown Pelicans and Roseate Spoonbills to Sandwich Terns and Great Blue Herons. Yet these habitats face existential threats: hurricane intensification, sea-level rise, oil spills, and urban encroachment.
            </p>
            <p className="text-slate-400 leading-relaxed mb-5">
              EcoLens bridges the gap between ecological fieldwork and modern AI. Raw aerial survey data is transformed into actionable intelligence — enabling researchers, policymakers, and conservationists to prioritize efforts where they matter most.
            </p>
            <ul className="space-y-2.5">
              {[
                'Monitor 190+ nesting colonies in near real time',
                'Identify species from aerial images in seconds',
                'Model hurricane impacts on vulnerable populations',
                'Guide restoration budget allocation with ROI metrics',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/20 transition-all duration-300">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-white text-sm font-semibold mb-1">{title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">The Creator</h2>
            <p className="text-slate-400 mt-3">EcoLens was designed and built by one person</p>
          </div>

          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/8 to-teal-500/5 border border-emerald-500/15 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-5xl">👨‍💻</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-black text-white mb-1">Anmol Subedi</h3>
                <p className="text-emerald-400 font-medium mb-1">Builder · Designer · Developer</p>
                <p className="text-slate-500 text-sm mb-4">University of Louisiana at Monroe</p>

                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  EcoLens is a solo project combining a passion for AI, conservation, and data visualization. Built to make Louisiana's coastal bird monitoring data accessible, beautiful, and actionable for researchers and the public alike.
                </p>

                <div className="flex flex-col sm:flex-row items-center md:items-start gap-3 flex-wrap justify-center md:justify-start">
                  <a
                    href="mailto:whoisanmolsubediii@gmail.com"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 text-slate-300 hover:text-white text-sm transition-all duration-200"
                  >
                    <Mail className="w-4 h-4 text-emerald-400" />
                    whoisanmolsubediii@gmail.com
                  </a>
                  <a
                    href="tel:+14083733254"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/30 hover:bg-sky-500/5 text-slate-300 hover:text-white text-sm transition-all duration-200"
                  >
                    <Phone className="w-4 h-4 text-sky-400" />
                    (408) 373-3254
                  </a>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-violet-400" />
                    University of Louisiana at Monroe
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
          <p className="text-slate-400 mb-8">Start monitoring bird populations and contributing to Louisiana's conservation future today.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/analytics" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 hover:scale-105">
              <Bird className="w-5 h-5" />
              Launch Dashboard
            </Link>
            <Link to="/contact" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all duration-300">
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
