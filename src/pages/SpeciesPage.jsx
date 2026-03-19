import { useState } from 'react';
import { Bird } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import SpeciesIntelligence from '../components/SpeciesIntelligence';
import { useColonies } from '../context/ColoniesContext';

export default function SpeciesPage() {
  const { coloniesData } = useColonies();
  const [selectedYear, setSelectedYear] = useState(2021);

  return (
    <FeatureLayout
      title="Species Intelligence"
      accentColor="text-teal-400"
      icon={<Bird className="w-4 h-4" />}
      showTimeline={true}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      panel={
        <SpeciesIntelligence coloniesData={coloniesData} selectedYear={selectedYear} />
      }
    />
  );
}
