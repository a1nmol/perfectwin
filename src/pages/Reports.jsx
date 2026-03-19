import { useState } from 'react';
import { FileText } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import ReportGenerator from '../components/ReportGenerator';
import { useColonies } from '../context/ColoniesContext';

export default function Reports() {
  const { coloniesData } = useColonies();
  const [selectedYear, setSelectedYear] = useState(2021);

  return (
    <FeatureLayout
      title="Report Generator"
      accentColor="text-rose-400"
      icon={<FileText className="w-4 h-4" />}
      showTimeline={true}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      panel={
        <ReportGenerator coloniesData={coloniesData} selectedYear={selectedYear} />
      }
    />
  );
}
