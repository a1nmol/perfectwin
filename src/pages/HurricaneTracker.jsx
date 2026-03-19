import { useState } from 'react';
import { Wind } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import StormImpactPanel from '../components/StormImpactPanel';
import { useColonies } from '../context/ColoniesContext';

export default function HurricaneTracker() {
  const { coloniesData } = useColonies();
  const [selectedStorm, setSelectedStorm] = useState(null);
  const [showStormImpact, setShowStormImpact] = useState(false);

  return (
    <FeatureLayout
      title="Hurricane Tracker"
      accentColor="text-sky-400"
      icon={<Wind className="w-4 h-4" />}
      showTimeline={true}
      extraMapProps={{
        selectedStorm,
        showStormImpact,
      }}
      panel={
        <StormImpactPanel
          coloniesData={coloniesData}
          onStormSelect={(storm) => { setSelectedStorm(storm); setShowStormImpact(true); }}
          onShowImpact={setShowStormImpact}
        />
      }
    />
  );
}
