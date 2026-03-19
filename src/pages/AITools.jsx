import { Link } from 'react-router-dom';
import { Cpu, BarChart3, MousePointer, FileText, Layers, Bird, ArrowRight, ExternalLink, Zap } from 'lucide-react';

const tools = [
  {
    icon: Cpu,
    title: 'AI Bird Detection',
    description: 'Upload aerial imagery to YOLOv11 — identify bird species, map detections to GPS coordinates, and download annotated results.',
    tags: ['YOLOv11', 'Computer Vision', 'Species ID'],
    href: '/upload',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
    badge: 'Most Used',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    icon: BarChart3,
    title: 'Species Intelligence',
    description: 'Explore population trends, species richness indices, and Habitat Quality Index scores across 190+ colonies from 2010–2026.',
    tags: ['Population Analytics', 'HQI', 'Trends'],
    href: '/species',
    color: 'from-sky-500/20 to-sky-600/5',
    iconBg: 'bg-sky-500/20 text-sky-400',
    badge: null,
  },
  {
    icon: MousePointer,
    title: 'Manual Annotation',
    description: 'Correct AI detections by manually marking birds in images. Your annotations improve the model\'s future accuracy.',
    tags: ['Model Fine-tuning', 'RLHF', 'Annotation'],
    href: '/upload',
    color: 'from-violet-500/20 to-violet-600/5',
    iconBg: 'bg-violet-500/20 text-violet-400',
    badge: null,
  },
  {
    icon: FileText,
    title: 'Report Generator',
    description: 'Generate executive-quality PDF reports with population graphs, colony maps, and conservation recommendations.',
    tags: ['PDF Export', 'Executive Report', 'Charts'],
    href: '/reports',
    color: 'from-amber-500/20 to-amber-600/5',
    iconBg: 'bg-amber-500/20 text-amber-400',
    badge: null,
  },
  {
    icon: Layers,
    title: 'Habitat Loss Analyzer',
    description: 'Overlay coastal land-loss data across 7 Louisiana basins with colony vulnerability scores. Project losses through 2030.',
    tags: ['USGS Data', 'Land Loss', 'Projections'],
    href: '/habitat',
    color: 'from-teal-500/20 to-teal-600/5',
    iconBg: 'bg-teal-500/20 text-teal-400',
    badge: 'Updated',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
  },
  {
    icon: Bird,
    title: 'Colony Analytics',
    description: 'View colony population history, nesting trends, and interactive map with all 190+ monitored sites across Louisiana.',
    tags: ['Colony Map', 'Population', 'Trends'],
    href: '/analytics',
    color: 'from-rose-500/20 to-rose-600/5',
    iconBg: 'bg-rose-500/20 text-rose-400',
    badge: null,
  },
];

export default function AITools() {
  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">

      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0418] to-[#020b18]" />
        <div className="absolute top-0 left-1/4 w-80 h-64 bg-violet-500/8 blur-[80px] rounded-full" />
        <div className="absolute top-0 right-1/4 w-80 h-64 bg-emerald-500/8 blur-[80px] rounded-full" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Powered by AI & ML
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            AI Tools <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">Suite</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Six specialized AI and analytics tools built for conservation scientists, field ecologists, and data-driven decision makers.
          </p>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.title} className="group relative p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 flex flex-col">
                {/* Badge */}
                {tool.badge && (
                  <span className={`absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}

                {/* Gradient bg */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex flex-col flex-1">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl mb-4 ${tool.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-white">{tool.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">{tool.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {tool.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-xs border border-white/5">{tag}</span>
                    ))}
                  </div>

                  <Link
                    to={tool.href}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors group/btn"
                  >
                    Open Tool
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Integration note */}
        <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/8 to-violet-500/8 border border-white/8 text-center">
          <Cpu className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-3">All Tools Are Integrated</h3>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mb-6">
            Every AI tool feeds data into the central dashboard. A detection from the upload tool appears on the colony map in real time. Annotation corrections automatically queue for model retraining.
          </p>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold transition-all duration-300 hover:scale-105"
          >
            Open Full Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
