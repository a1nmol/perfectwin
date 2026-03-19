import { useState } from 'react';
import { Search, X, Info, MapPin, Leaf, Utensils, Globe } from 'lucide-react';

/* Wikimedia Commons Special:FilePath URLs — free, stable, no API key needed */
const WM = (file, w = 400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

const ALL_BIRDS = [
  {
    code: 'BRPE', name: 'Brown Pelican', latin: 'Pelecanus occidentalis',
    status: 'Least Concern', category: 'Waterbird',
    photo: WM('Flying_Brown_Pelican.JPG'),
    fallback: '🐦', gradient: 'from-amber-600/20 to-amber-800/10',
    habitat: 'Coastal waters, estuaries, mangroves',
    diet: 'Fish (menhaden, mullet, anchovies)',
    behavior: 'Plunge-diving for fish from heights of 30–60 ft. Colonial nester on barrier islands.',
    region: 'Gulf Coast, Atlantic Coast', seasonal: 'Year-round resident',
    fact: "Louisiana's state bird. Recovered from near-extinction after DDT ban in 1972.",
    population: '650,000+',
  },
  {
    code: 'ROSP', name: 'Roseate Spoonbill', latin: 'Platalea ajaja',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Roseate_Spoonbill_-_Myakka_River_State_Park.jpg'),
    fallback: '🦩', gradient: 'from-rose-500/20 to-pink-700/10',
    habitat: 'Mangroves, shallow coastal bays, freshwater marshes',
    diet: 'Crustaceans, small fish, insects',
    behavior: 'Distinctive side-to-side bill sweeping through water. Highly social nester.',
    region: 'Gulf Coast, Caribbean', seasonal: 'Year-round in South Louisiana',
    fact: 'Pink coloration comes from carotenoids in their crustacean diet.',
    population: '~110,000',
  },
  {
    code: 'GREG', name: 'Great Egret', latin: 'Ardea alba',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Great_egret_-_natures_pics.jpg'),
    fallback: '🕊️', gradient: 'from-slate-300/15 to-slate-400/5',
    habitat: 'Wetlands, marshes, rivers, lake edges',
    diet: 'Fish, frogs, small mammals, invertebrates',
    behavior: 'Slow, deliberate stalking hunter. Extends elegant plumes in breeding season.',
    region: 'Throughout North America', seasonal: 'Year-round in Louisiana',
    fact: 'The Great Egret is the symbol of the National Audubon Society.',
    population: '~750,000',
  },
  {
    code: 'SNEG', name: 'Snowy Egret', latin: 'Egretta thula',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Snowy_egret_Bonaire.jpg'),
    fallback: '🦢', gradient: 'from-white/10 to-slate-200/5',
    habitat: 'Salt marshes, swamps, tidal flats',
    diet: 'Small fish, crustaceans, amphibians',
    behavior: 'Active forager — shuffles feet to disturb prey. Yellow feet visible in flight.',
    region: 'Americas', seasonal: 'Year-round Gulf Coast',
    fact: 'Their delicate breeding plumes were once worth twice their weight in gold.',
    population: '~143,000',
  },
  {
    code: 'GBHE', name: 'Great Blue Heron', latin: 'Ardea herodias',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('GreatBlueHeronTampaFL.JPG'),
    fallback: '🦅', gradient: 'from-blue-700/20 to-blue-900/10',
    habitat: 'Wetlands, coasts, lakes, rivers',
    diet: 'Fish, amphibians, small mammals, reptiles',
    behavior: 'Patient ambush predator. Stands motionless for long periods before striking.',
    region: 'North America', seasonal: 'Year-round in Louisiana',
    fact: "North America's largest heron, with a wingspan reaching 6.6 feet.",
    population: '~83,000',
  },
  {
    code: 'TRHE', name: 'Tricolored Heron', latin: 'Egretta tricolor',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Heron_tricol_01.JPG'),
    fallback: '🐤', gradient: 'from-indigo-500/20 to-blue-700/10',
    habitat: 'Salt marshes, mangroves, coastal lagoons',
    diet: 'Small fish, invertebrates',
    behavior: 'Energetic forager, often running or flying short distances to chase prey.',
    region: 'Gulf and Atlantic Coasts', seasonal: 'Year-round resident',
    fact: 'One of the few herons with a white belly contrasting with dark wings.',
    population: '~115,000',
  },
  {
    code: 'ROYT', name: 'Royal Tern', latin: 'Thalasseus maximus',
    status: 'Least Concern', category: 'Seabird',
    photo: WM('Royal_Tern_(Thalasseus_maximus)_feeding_youngster_with_a_fish_(2900231381).jpg'),
    fallback: '✈️', gradient: 'from-sky-400/15 to-sky-600/5',
    habitat: 'Beaches, bays, coastal waters',
    diet: 'Fish, shrimp, squid',
    behavior: 'Plunge-diver, hovers before diving. Colonial nester on sandy barrier islands.',
    region: 'Atlantic and Pacific Coasts', seasonal: 'Year-round Gulf Coast',
    fact: "The largest Royal Tern colony in the US is in Louisiana.",
    population: '~70,000',
  },
  {
    code: 'SATE', name: 'Sandwich Tern', latin: 'Thalasseus sandvicensis',
    status: 'Least Concern', category: 'Seabird',
    photo: WM('Juvenile_Sandwich_Tern_(Sterna_sandvicensis)_(11).JPG'),
    fallback: '🦤', gradient: 'from-teal-400/15 to-teal-600/5',
    habitat: 'Coastal beaches, open water',
    diet: 'Mainly small fish',
    behavior: 'Often nests alongside Royal Terns. Distinctive black-tipped yellow bill.',
    region: 'Atlantic Coast, Gulf of Mexico', seasonal: 'Breeding Apr–Aug',
    fact: 'Named for Sandwich, Kent, England — its European range discovery site.',
    population: '~300,000',
  },
  {
    code: 'LAGU', name: 'Laughing Gull', latin: 'Leucophaeus atricilla',
    status: 'Least Concern', category: 'Gull',
    photo: WM('Laughing_gull_St_Thomas.JPG'),
    fallback: '🦉', gradient: 'from-gray-400/15 to-gray-600/5',
    habitat: 'Beaches, marshes, estuaries',
    diet: 'Fish, invertebrates, eggs of other birds',
    behavior: 'Aggressive kleptoparasite. Named for its distinctive ha-ha-ha call.',
    region: 'Atlantic and Gulf Coasts', seasonal: 'Year-round Gulf Coast',
    fact: 'The only gull that regularly nests along the Gulf Coast.',
    population: '~130,000',
  },
  {
    code: 'WHIB', name: 'White Ibis', latin: 'Eudocimus albus',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('American_White_Ibis_(Eudocimus_albus).jpg'),
    fallback: '🦜', gradient: 'from-orange-400/15 to-red-600/5',
    habitat: 'Coastal wetlands, marshes, swamps',
    diet: 'Crayfish, crabs, fish, frogs, insects',
    behavior: 'Probes mud with curved bill. Forms large mixed-species colonies.',
    region: 'Gulf Coast, Caribbean', seasonal: 'Year-round',
    fact: 'Red face and bill intensify during breeding season.',
    population: '~150,000',
  },
  {
    code: 'DCCO', name: 'Double-crested Cormorant', latin: 'Nannopterum auritum',
    status: 'Least Concern', category: 'Waterbird',
    photo: WM('Double-crested_Cormorant_(Phalacrocorax_auritus)_-_Algonquin_Provincial_Park,_Ontario.jpg'),
    fallback: '🐧', gradient: 'from-slate-700/20 to-slate-900/10',
    habitat: 'Lakes, rivers, coastal bays, estuaries',
    diet: 'Fish — up to 12 oz per day',
    behavior: 'Dives from surface, swims underwater. Spreads wings to dry after swimming.',
    region: 'Throughout North America', seasonal: 'Year-round in Louisiana',
    fact: 'Unlike most waterbirds, their feathers are not waterproof.',
    population: '~2 million',
  },
  {
    code: 'BCNH', name: 'Black-crowned Night Heron', latin: 'Nycticorax nycticorax',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Black-crowned_night_heron_resting.jpg'),
    fallback: '🦚', gradient: 'from-stone-600/20 to-stone-800/10',
    habitat: 'Marshes, swamps, wooded streams',
    diet: 'Fish, frogs, crustaceans, small birds',
    behavior: 'Nocturnal hunter. Compact, stocky body. Roosts in trees during day.',
    region: 'Nearly worldwide', seasonal: 'Year-round in Louisiana',
    fact: 'The most widespread heron in the world.',
    population: '~700,000',
  },
  {
    code: 'REHE', name: 'Reddish Egret', latin: 'Egretta rufescens',
    status: 'Near Threatened', category: 'Wading Bird',
    photo: WM('Reddish_Egret_(Egretta_rufescens).jpg'),
    fallback: '🦢', gradient: 'from-red-700/20 to-red-900/10',
    habitat: 'Saltwater flats, mangroves, lagoons',
    diet: 'Fish, primarily mullet',
    behavior: 'Canopy feeding — spreads wings like an umbrella to create shade, attracting fish.',
    region: 'Gulf Coast, Caribbean', seasonal: 'Year-round resident',
    fact: "One of North America's rarest herons. Louisiana holds a key US breeding population.",
    population: '~7,200',
  },
  {
    code: 'LEBI', name: 'Little Blue Heron', latin: 'Egretta caerulea',
    status: 'Least Concern', category: 'Wading Bird',
    photo: WM('Little_Blue_Heron_RWD2.jpg'),
    fallback: '🐦', gradient: 'from-blue-800/20 to-blue-950/10',
    habitat: 'Freshwater marshes, mangroves, ponds',
    diet: 'Fish, amphibians, crustaceans',
    behavior: 'Young birds are entirely white; become blue-slate as adults.',
    region: 'Eastern North America to South America', seasonal: 'Year-round Gulf Coast',
    fact: 'Young white birds are sometimes mistaken for Snowy Egrets.',
    population: '~200,000',
  },
  {
    code: 'NECO', name: 'Neotropic Cormorant', latin: 'Nannopterum brasilianum',
    status: 'Least Concern', category: 'Waterbird',
    photo: WM('Neotropic_cormorant_(Chalalan).jpg'),
    fallback: '🐦', gradient: 'from-zinc-700/20 to-zinc-900/10',
    habitat: 'Inland lakes, rivers, coastal bays',
    diet: 'Small fish',
    behavior: 'Smaller than Double-crested. Often nests alongside ibis and herons.',
    region: 'Central and South America, S US', seasonal: 'Year-round Louisiana',
    fact: 'Range has expanded northward into Louisiana over the past 30 years.',
    population: '~4 million',
  },
  {
    code: 'FOTE', name: "Forster's Tern", latin: 'Sterna forsteri',
    status: 'Least Concern', category: 'Seabird',
    photo: WM("Forster's_Tern_(Sterna_forsteri)_(8600008119).jpg"),
    fallback: '🦅', gradient: 'from-sky-300/15 to-sky-500/5',
    habitat: 'Coastal marshes, bays, estuaries',
    diet: 'Small fish, insects',
    behavior: 'Plunge-diver and surface picker. Hovers before diving.',
    region: 'North America', seasonal: 'Year-round Gulf Coast',
    fact: "Named for Johann Reinhold Forster, naturalist on Captain Cook's second voyage.",
    population: '~60,000',
  },
  {
    code: 'AMAV', name: 'American Avocet', latin: 'Recurvirostra americana',
    status: 'Least Concern', category: 'Shorebird',
    photo: WM('American_Avocet_(Recurvirostra_americana)_(8513631186).jpg'),
    fallback: '🐤', gradient: 'from-orange-400/15 to-amber-600/10',
    habitat: 'Shallow lakes, mudflats, coastal lagoons',
    diet: 'Aquatic invertebrates, seeds, small fish',
    behavior: 'Sweeps long upturned bill side to side through shallow water.',
    region: 'Western North America', seasonal: 'Winter visitor Louisiana',
    fact: "Long orange neck and upturned bill make it one of North America's most elegant shorebirds.",
    population: '~500,000',
  },
  {
    code: 'BLSK', name: 'Black Skimmer', latin: 'Rynchops niger',
    status: 'Least Concern', category: 'Seabird',
    photo: WM('Black_Skimmer_(Rynchops_niger)_resting_on_a_sandbank.jpg'),
    fallback: '✂️', gradient: 'from-gray-700/20 to-red-900/10',
    habitat: 'Sandy beaches, coastal sandbars, estuaries',
    diet: 'Small fish caught at water surface',
    behavior: 'Unique lower mandible longer than upper — skims water surface with bill to catch fish.',
    region: 'Atlantic and Gulf Coasts', seasonal: 'Year-round Gulf Coast',
    fact: 'The only bird in the world with a lower bill longer than the upper.',
    population: '~60,000',
  },
];

const STATUSES    = ['All', 'Least Concern', 'Near Threatened', 'Vulnerable', 'Endangered'];
const CATEGORIES  = ['All', ...new Set(ALL_BIRDS.map(b => b.category))];

function StatusBadge({ status }) {
  const colors = {
    'Least Concern':  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Near Threatened':'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Vulnerable':     'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Endangered':     'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colors[status] || colors['Least Concern']}`}>
      {status}
    </span>
  );
}

function BirdCard({ bird, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <button
      onClick={() => onClick(bird)}
      className="group p-3 rounded-2xl bg-white/3 border border-white/8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 text-left w-full"
    >
      <div className={`w-full h-32 rounded-xl mb-3 overflow-hidden ${imgError ? `bg-gradient-to-br ${bird.gradient} flex items-center justify-center text-4xl` : ''}`}>
        {imgError ? (
          bird.fallback
        ) : (
          <img
            src={bird.photo}
            alt={bird.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <h4 className="text-white text-xs font-semibold leading-snug mb-0.5 group-hover:text-emerald-400 transition-colors">{bird.name}</h4>
      <p className="text-slate-500 text-[10px] italic mb-2 line-clamp-1">{bird.latin}</p>
      <StatusBadge status={bird.status} />
    </button>
  );
}

function BirdModal({ bird, onClose }) {
  const [imgError, setImgError] = useState(false);
  if (!bird) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0a1628] border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 overflow-hidden rounded-t-3xl">
          {imgError ? (
            <div className={`w-full h-full bg-gradient-to-br ${bird.gradient} flex items-center justify-center text-8xl`}>
              {bird.fallback}
            </div>
          ) : (
            <img
              src={bird.photo}
              alt={bird.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-black text-white mb-0.5">{bird.name}</h2>
            <p className="text-slate-400 text-sm italic">{bird.latin}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={bird.status} />
            <span className="px-2.5 py-0.5 rounded-full bg-white/8 text-slate-300 text-xs border border-white/10">{bird.category}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/8 text-slate-300 text-xs border border-white/10">{bird.seasonal}</span>
          </div>

          {[
            { icon: MapPin,   label: 'Habitat',  value: bird.habitat },
            { icon: Utensils, label: 'Diet',     value: bird.diet },
            { icon: Globe,    label: 'Behavior', value: bird.behavior },
            { icon: MapPin,   label: 'Range',    value: bird.region },
            { icon: Leaf,     label: 'Fun Fact', value: bird.fact },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-4">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-slate-300 text-sm leading-relaxed">{value}</p>
              </div>
            </div>
          ))}

          {bird.population && (
            <div className="p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Est. Population</p>
              <p className="text-emerald-400 text-2xl font-bold">{bird.population}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedBird, setSelectedBird]   = useState(null);

  const filtered = ALL_BIRDS.filter(b => {
    const q = search.toLowerCase();
    return (
      (!search || b.name.toLowerCase().includes(q) || b.latin.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || b.status === statusFilter) &&
      (categoryFilter === 'All' || b.category === categoryFilter)
    );
  });

  return (
    <div className="min-h-screen bg-[#020b18] pt-24 pb-16">
      <BirdModal bird={selectedBird} onClose={() => setSelectedBird(null)} />

      {/* Header */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#042a1a] to-[#020b18]" />
        <div className="absolute top-0 left-1/3 w-80 h-64 bg-teal-500/8 blur-[80px] rounded-full" />
        <div className="absolute top-0 right-1/3 w-80 h-64 bg-emerald-500/8 blur-[80px] rounded-full" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <span className="text-teal-400 text-sm font-semibold uppercase tracking-widest block mb-3">Species Database</span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5">
            Louisiana Bird <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Encyclopedia</span>
          </h1>
          <p className="text-slate-400 text-lg">{ALL_BIRDS.length} coastal bird species profiled with photos, habitat, diet & conservation data.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, species, or type…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-white text-sm placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-all"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-slate-500 hover:text-white" /></button>}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Status:</span>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${statusFilter === s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/3 text-slate-400 border border-white/8 hover:border-white/15 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500 text-xs uppercase tracking-widest">Type:</span>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${categoryFilter === c ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-white/3 text-slate-400 border border-white/8 hover:border-white/15 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
        <p className="text-slate-500 text-xs">{filtered.length} species</p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map(bird => (
            <BirdCard key={bird.code} bird={bird} onClick={setSelectedBird} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400">No species found.</p>
            <button onClick={() => { setSearch(''); setStatusFilter('All'); setCategoryFilter('All'); }} className="mt-4 text-emerald-400 text-sm hover:underline">Clear filters</button>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-8">
          <Info className="w-3.5 h-3.5" /> Click any card to view the full species profile · Photos via Wikimedia Commons
        </div>
      </div>
    </div>
  );
}
