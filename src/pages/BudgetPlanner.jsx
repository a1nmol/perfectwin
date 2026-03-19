import { useState } from 'react';
import { DollarSign } from 'lucide-react';
import FeatureLayout from '../components/FeatureLayout';
import RestorationBudgetPlanner from '../components/RestorationBudgetPlanner';
import { useColonies } from '../context/ColoniesContext';

export default function BudgetPlanner() {
  const { coloniesData } = useColonies();
  const [selectedYear, setSelectedYear] = useState(2021);

  return (
    <FeatureLayout
      title="Restoration Budget Planner"
      accentColor="text-violet-400"
      icon={<DollarSign className="w-4 h-4" />}
      showTimeline={true}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      panel={
        <RestorationBudgetPlanner coloniesData={coloniesData} selectedYear={selectedYear} />
      }
    />
  );
}
