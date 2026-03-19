import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import AnalyticsSidebar from '../components/AnalyticsSidebar';
import { useColonies } from '../context/ColoniesContext';

export default function Analytics() {
  const { coloniesData } = useColonies();
  const [selectedYear, setSelectedYear] = useState(2021);

  return (
    <FeatureLayout
      title="Colony Analytics"
      accentColor="text-amber-400"
      icon={<BarChart3 className="w-4 h-4" />}
      showTimeline={true}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      panel={
        <AnalyticsSidebar coloniesData={coloniesData} selectedYear={selectedYear} />
      }
    />
  );
}
