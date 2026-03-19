import { useState } from 'react';
import { Cpu, MousePointer } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import AIDetectionPanel from '../components/AIDetectionPanel';
import AnnotationOverlay from '../components/AnnotationOverlay';
import { useColonies } from '../context/ColoniesContext';

const TABS = [
  { id: 'detect',   label: 'AI Detection', icon: Cpu },
  { id: 'annotate', label: 'Annotate',     icon: MousePointer },
];

export default function BirdUpload() {
  const { coloniesData } = useColonies();
  const [activeTab, setActiveTab]               = useState('detect');
  const [uploadedImage, setUploadedImage]       = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [detectionGeoPoints, setDetectionGeoPoints] = useState([]);
  const [selectedColony, setSelectedColony]     = useState(null);

  const panel = (
    <div className="flex flex-col h-full">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-0 flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === id
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        {/* Annotation hint — only shown when no image is loaded */}
        {activeTab === 'annotate' && !uploadedImage && (
          <span className="ml-auto text-slate-500 text-[10px] pr-1">
            Run detection first
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/6 mx-3 mt-2 flex-shrink-0" />

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'detect' ? (
          <AIDetectionPanel
            coloniesData={coloniesData}
            selectedColony={selectedColony}
            onColonySelect={setSelectedColony}
            uploadedImage={uploadedImage}
            setUploadedImage={(img) => {
              setUploadedImage(img);
              // auto-switch to annotate once image is cleared (reset flow)
              if (!img) setDetectionResults(null);
            }}
            detectionResults={detectionResults}
            setDetectionResults={(res) => {
              setDetectionResults(res);
              // auto-switch to annotate tab once results arrive
              if (res) setActiveTab('annotate');
            }}
            onDetectionGeoPoints={setDetectionGeoPoints}
          />
        ) : (
          <AnnotationOverlay
            uploadedImage={uploadedImage}
            selectedColony={selectedColony}
            detectionResults={detectionResults}
          />
        )}
      </div>
    </div>
  );

  return (
    <FeatureLayout
      title="AI Detection & Annotation"
      accentColor="text-emerald-400"
      icon={<Cpu className="w-4 h-4" />}
      showTimeline={false}
      onColonySelect={setSelectedColony}
      extraMapProps={{ detectionGeoPoints }}
      panel={panel}
    />
  );
}
