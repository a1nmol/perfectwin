import { Link } from 'react-router-dom';
import { AlertTriangle, TrendingDown, Shield, Globe, Droplets, Flame, Wind, ArrowRight, Heart } from 'lucide-react';

const threats = [
  {
    icon: TrendingDown,
    title: 'Coastal Land Loss',
    stat: '25 mi²/year',
    desc: 'Louisiana loses approximately 25 square miles of coastal land annually — one of the fastest rates on Earth. Wetlands that took millennia to form disappear in decades, eliminating the nesting habitat that colonial waterbirds depend on.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Wind,
    title: 'Hurricane Intensification',
    stat: 'Cat 5 frequency +40%',
    desc: 'Warmer Gulf waters are fueling more intense storms. Katrina, Rita, Ike, and Ida each devastated nesting colonies — some were never recolonized. The recovery window between major storms is shrinking.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
  },
  {
    icon: Droplets,
    title: 'Oil Spill Contamination',
    stat: '2,100 km² affected',
    desc: 'The 2010 Deepwater Horizon spill impacted over 8,000 birds from 102 species. Chronic oiling from pipelines and shipping continues to affect bird health, reproduction, and feather insulation.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: Flame,
    title: 'Climate-Driven Changes',
    stat: '+0.6°C since 2000',
    desc: 'Rising temperatures alter prey availability, shift migration timing, and bleach coral reefs that support the fish populations birds depend on. Earlier springs throw off the synchrony between hatching and peak food abundance.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
];

const actions = [
  { num: '01', title: 'Colony Monitoring', desc: 'Annual aerial surveys of 190+ nesting sites provide baseline population data to detect declines before they become catastrophic.' },
  { num: '02', title: 'Habitat Restoration', desc: 'Strategic marsh restoration and artificial nesting island construction create resilient habitat outside storm surge zones.' },
  { num: '03', title: 'AI-Assisted Detection', desc: 'Machine learning accelerates species identification, enabling near real-time monitoring at scales impossible with traditional fieldwork.' },
  { num: '04', title: 'Policy Advocacy', desc: 'Our data is used by the Louisiana CPRA and LDWF to prioritize coastal protection spending and regulatory decisions.' },
  { num: '05', title: 'Community Science', desc: 'Citizen naturalists contribute observations through our upload tool, dramatically expanding our geographic coverage.' },
  { num: '06', title: 'Cross-Species Modeling', desc: 'Birds as bioindicators — population trends predict ecosystem health across fisheries, water quality, and invertebrate communities.' },
];

const successStories = [
  {
    species: 'Brown Pelican',
    before: 'Near extinction in Louisiana by 1963 due to DDT',
    after: 'Population recovered to 650,000+ after pesticide ban',
    lesson: 'Conservation works when grounded in data and policy change.',
    emoji: '🐦',
  },
  {
    species: 'Roseate Spoonbill',
    before: 'Hunted to near-extirpation for plume trade by 1900s',
    after: 'Now stable at ~110,000 birds with protected wetlands',
    lesson: 'Habitat protection is the most effective long-term strategy.',
    emoji: '🦩',
  },
  {
    species: 'Great Egret',
    before: 'Symbol of Audubon Society — saved by early 20th century advocacy',
    after: '750,000+ birds, stable across North America',
    lesson: 'Public awareness and legal protection can reverse even severe declines.',
    emoji: '🕊️',
  },
];

export default function Conservation() {
  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">

      {/* Hero */}
      <div className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a08] to-[#020b18]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-emerald-500/6 blur-[100px] rounded-full" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-4">Our Cause</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Louisiana's Coast is
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Disappearing Fast
            </span>
          </h1>
          <p className="text-slate-400 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Louisiana contains 40% of the contiguous United States' coastal wetlands. It's also losing land faster than anywhere else in the country. The birds that call this coast home are running out of time.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/upload" className="flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-emerald-500/30">
              <Heart className="w-5 h-5" />
              Contribute Data
            </Link>
            <Link to="/gallery" className="flex items-center gap-2 px-7 py-4 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all duration-300">
              Meet the Species <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Threats */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-rose-400 text-sm font-semibold uppercase tracking-widest block mb-3">The Crisis</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Four Critical Threats</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">Understanding the pressures on Louisiana's coastal birds is the first step to protecting them.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {threats.map(({ icon: Icon, title, stat, desc, color, bg }) => (
              <div key={title} className={`p-6 rounded-2xl border ${bg} hover:-translate-y-0.5 transition-all duration-300`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 ${color} flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">{title}</h3>
                    <span className={`text-2xl font-black ${color}`}>{stat}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Our Response</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">How EcoLens Fights Back</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {actions.map(({ num, title, desc }) => (
              <div key={num} className="p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/20 transition-all duration-300 hover:-translate-y-1">
                <span className="text-4xl font-black text-emerald-500/30 block mb-3">{num}</span>
                <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-sky-400 text-sm font-semibold uppercase tracking-widest block mb-3">Reasons for Hope</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Conservation Wins</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">These recoveries prove that with data, policy, and persistence — we can reverse even catastrophic declines.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {successStories.map(({ species, before, after, lesson, emoji }) => (
              <div key={species} className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/15 hover:-translate-y-1 transition-all duration-300">
                <div className="text-5xl mb-4">{emoji}</div>
                <h4 className="text-emerald-400 font-bold text-lg mb-4">{species}</h4>
                <div className="space-y-3 mb-4">
                  <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Before</p>
                    <p className="text-slate-400 text-sm">{before}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                    <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Today</p>
                    <p className="text-slate-300 text-sm">{after}</p>
                  </div>
                </div>
                <p className="text-emerald-400/70 text-xs italic">"{lesson}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)]" />
            <div className="relative z-10">
              <Globe className="w-16 h-16 text-emerald-400 mx-auto mb-5" />
              <h2 className="text-3xl font-bold text-white mb-4">The Coast Needs Your Eyes</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Every aerial photo you upload, every observation you record, adds to the dataset that informs conservation policy across Louisiana. Science is only as powerful as the data behind it.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/upload" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all hover:scale-105">
                  <Shield className="w-5 h-5" /> Upload Bird Image
                </Link>
                <Link to="/analytics" className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold transition-all">
                  View Live Data
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
