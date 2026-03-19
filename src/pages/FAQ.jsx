import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Bird, Mail } from 'lucide-react';

const faqs = [
  {
    q: 'What is EcoLens?',
    a: "EcoLens is an AI-powered avian monitoring and conservation platform focused on Louisiana's coastal ecosystems. It combines YOLOv11 computer vision, 16 years of aerial survey data, and real-time storm modeling to help ecologists, researchers, and conservationists understand and protect the region's bird populations.",
    category: 'General',
  },
  {
    q: 'How does the AI bird classification work?',
    a: 'Our classification pipeline uses a fine-tuned YOLOv11 model trained on thousands of Louisiana coastal bird images. When you upload an aerial photo, the model detects individual birds, draws bounding boxes, assigns species labels, and produces confidence scores. Results are geo-referenced so detections can be mapped to exact colony coordinates.',
    category: 'Technology',
  },
  {
    q: 'What data does the platform provide?',
    a: 'EcoLens provides: colony-level population counts from 2010–2026, species richness and Habitat Quality Index (HQI) scores, hurricane impact modeling with recovery projections, coastal land-loss rates across seven Louisiana basins, and restoration budget optimization tools. Data is sourced from USGS, LDWF aerial surveys, and NOAA storm records.',
    category: 'Data',
  },
  {
    q: 'Which bird species are tracked?',
    a: 'We track 40+ Louisiana coastal species including Brown Pelican, Roseate Spoonbill, Great Egret, Snowy Egret, Great Blue Heron, Tricolored Heron, Neotropic Cormorant, White Ibis, Sandwich Tern, Royal Tern, Laughing Gull, Forster\'s Tern, Reddish Egret, and Black-crowned Night Heron, among others.',
    category: 'Species',
  },
  {
    q: 'How accurate is the bird identification AI?',
    a: "The model achieves 92–97% accuracy for the most common Louisiana coastal species in good-quality aerial imagery. Accuracy decreases for rare species (limited training samples) and poor-quality images. The platform displays confidence scores for every detection so you can gauge reliability. Manual annotation and correction features allow researchers to fine-tune the model further.",
    category: 'Technology',
  },
  {
    q: 'How do I get involved or contribute data?',
    a: 'Researchers can contribute by uploading field images through the Bird AI Detection page, which adds to our training dataset. Organizations can request API access for programmatic data integration. Volunteer naturalists can participate through the annotation tool to help verify AI detections. Contact us to learn about formal data-sharing partnerships.',
    category: 'General',
  },
  {
    q: 'Is the platform free to use?',
    a: 'Yes — EcoLens is free and open access for researchers, students, wildlife agencies, and conservation organizations. We believe conservation data should be a public good. Advanced features like bulk API access and custom report generation may require organizational registration.',
    category: 'General',
  },
  {
    q: 'What is the Habitat Quality Index (HQI)?',
    a: 'The HQI is a composite metric (0–100) calculated from nest count, bird count, and species richness for each colony in a given year. Scores are rated: 80–100 = Excellent, 60–80 = Good, 40–60 = Fair, 20–40 = Poor, 0–20 = Critical. It provides a single at-a-glance indicator of a colony\'s ecological health.',
    category: 'Data',
  },
  {
    q: 'How does the Hurricane Impact modeling work?',
    a: 'Each historical hurricane track (from NOAA records) is compared against colony locations. The model calculates minimum storm-to-colony distance, assigns an exposure score based on storm category and proximity, and estimates recovery years using species-specific resilience coefficients. Cumulative multi-storm impact scores are also computed.',
    category: 'Technology',
  },
  {
    q: "Why does Louisiana's coastal bird data matter?",
    a: "Louisiana's coast contains over 40% of the contiguous US's coastal wetlands and is a critical flyway for millions of migratory birds. It's also one of the fastest disappearing coastlines on Earth — losing over 25 square miles per year. Colonial waterbirds are ecological indicators: their population trends signal ecosystem health across the entire food web, from fisheries to human communities.",
    category: 'Conservation',
  },
];

const categories = ['All', ...new Set(faqs.map(f => f.category))];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
      isOpen
        ? 'bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
        : 'bg-white/3 border-white/8 hover:border-white/15'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className={`font-semibold text-base leading-snug transition-colors ${isOpen ? 'text-emerald-400' : 'text-white'}`}>
          {item.q}
        </span>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-emerald-500/20 text-emerald-400 rotate-180' : 'bg-white/5 text-slate-400'
        }`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-5">
          <div className="h-px bg-emerald-500/20 mb-4" />
          <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
          <span className="inline-block mt-3 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            {item.category}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">

      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#042a1a] to-[#020b18]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-emerald-500/8 blur-[80px] rounded-full" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-emerald-400 text-sm font-semibold uppercase tracking-widest block mb-3">Support</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            Frequently Asked <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Questions</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Everything you need to know about EcoLens's platform, AI technology, and conservation data.
          </p>
        </div>
      </div>

      {/* Category filters */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIdx(null); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-white/3 text-slate-400 border border-white/8 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ list */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openIdx === i}
              onToggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-emerald-500/8 to-sky-500/8 border border-emerald-500/15 text-center">
          <Bird className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">Still have questions?</h3>
          <p className="text-slate-400 text-sm mb-6">Our team of ecologists and engineers is happy to help.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm transition-all duration-300 hover:scale-105"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </Link>
            <Link
              to="/analytics"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-300"
            >
              Explore the Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
