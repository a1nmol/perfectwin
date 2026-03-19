import { useState } from 'react';
import { Layers } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import HabitatLossPanel from '../components/HabitatLossPanel';
import { useColonies } from '../context/ColoniesContext';

export default function HabitatLoss() {
  const { coloniesData } = useColonies();

  return (
    <FeatureLayout
      title="Habitat Loss Analysis"
      accentColor="text-amber-400"
      icon={<Layers className="w-4 h-4" />}
      showTimeline={false}
      extraMapProps={{ showHabitatLayer: true }}
      panel={
        <HabitatLossPanel coloniesData={coloniesData} />
      }
    />
  );
}
