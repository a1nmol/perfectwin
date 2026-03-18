import React, { useState } from 'react';
import { FileText, Download, Printer, Mail } from 'lucide-react';
import { calculateAggregateHQI, identifyCriticalHabitats, calculateRecoveryTrend } from '../utils/hqiCalculator';
import { getSpeciesName } from '../utils/speciesMapping';
import { fillMissingYears, calculateNestingEfficiency } from '../utils/dataProcessor';
import jsPDF from 'jspdf';

const ReportGenerator = ({ coloniesData, selectedYear }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('executive');

  const generatePDFReport = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;

      // Generate complete year range (2010-2026)
      const allYears = Array.from({ length: 17 }, (_, i) => 2010 + i);
      
      // Fill missing years for comprehensive analysis
      const coloniesWithFilledYears = coloniesData.map(colony => ({
        ...colony,
        history: fillMissingYears(colony, allYears)
      }));

      // Header
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, pageWidth, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('EcoLens Louisiana', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text('CPRA Habitat Quality Report', pageWidth / 2, 23, { align: 'center' });

      yPos = 45;
      doc.setTextColor(0, 0, 0);

      // Executive Summary
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Executive Summary', 15, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const hqi = calculateAggregateHQI(coloniesWithFilledYears, selectedYear);
      
      // Get year-specific data
      const yearData = coloniesWithFilledYears.reduce((acc, colony) => {
        const data = colony.history.find(h => h.year === selectedYear);
        if (data && data.birds > 0) {
          acc.birds += data.birds;
          acc.nests += data.nests;
          acc.colonies++;
          acc.species += data.species_count;
        }
        return acc;
      }, { birds: 0, nests: 0, colonies: 0, species: 0 });
      
      const nestingEfficiency = calculateNestingEfficiency(yearData.birds, yearData.nests);
      
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 15, yPos);
      yPos += 6;
      doc.text(`Analysis Year: ${selectedYear || 'Latest Available'}`, 15, yPos);
      yPos += 6;
      doc.text(`Colonies Analyzed: ${hqi.coloniesAnalyzed}`, 15, yPos);
      yPos += 6;
      doc.text(`Data Type: ${selectedYear > 2021 ? 'AI Predicted' : selectedYear <= 2021 ? 'Observed/Interpolated' : 'Observed'}`, 15, yPos);
      yPos += 10;

      // HQI Score Box
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos, pageWidth - 30, 25, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Habitat Quality Index (HQI)', 20, yPos + 8);
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text(`${hqi.score}`, 20, yPos + 18);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rating: ${hqi.rating}`, 60, yPos + 18);
      yPos += 35;

      // Key Metrics - Year Specific
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Key Metrics for ${selectedYear || 2021}`, 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Birds: ${yearData.birds.toLocaleString()}`, 15, yPos);
      yPos += 6;
      doc.text(`Total Nests: ${yearData.nests.toLocaleString()}`, 15, yPos);
      yPos += 6;
      doc.text(`Active Colonies: ${yearData.colonies}`, 15, yPos);
      yPos += 6;
      doc.text(`Average Species per Colony: ${(yearData.species / yearData.colonies).toFixed(1)}`, 15, yPos);
      yPos += 6;
      doc.text(`Nesting Efficiency: ${nestingEfficiency}%`, 15, yPos);
      yPos += 6;
      doc.text(`Biodiversity Factor: ${hqi.biodiversityFactor ? hqi.biodiversityFactor.toFixed(2) : 'N/A'}`, 15, yPos);
      yPos += 12;

      // Population Trends Section
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Population Trends (2010-2026)', 15, yPos);
      yPos += 8;

      // Calculate trends for all years
      const trendYears = [2010, 2013, 2015, 2018, 2021, 2024, 2026];
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      trendYears.forEach(year => {
        const yearStats = coloniesWithFilledYears.reduce((acc, colony) => {
          const data = colony.history.find(h => h.year === year);
          if (data && data.birds > 0) {
            acc.birds += data.birds;
            acc.nests += data.nests;
          }
          return acc;
        }, { birds: 0, nests: 0 });
        
        const dataType = year > 2021 ? ' (Predicted)' : year <= 2021 && !coloniesData.some(c => c.history.some(h => h.year === year)) ? ' (Interpolated)' : '';
        
        doc.text(`${year}${dataType}: ${yearStats.birds.toLocaleString()} birds, ${yearStats.nests.toLocaleString()} nests`, 15, yPos);
        yPos += 5;
      });
      
      yPos += 5;

      // Critical Habitats - Year Specific
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Top 5 Critical Habitats (${selectedYear || 2021})`, 15, yPos);
      yPos += 8;

      const criticalHabitats = identifyCriticalHabitats(coloniesWithFilledYears, 5);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      criticalHabitats.forEach((habitat, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${habitat.name}`, 15, yPos);
        yPos += 5;
        doc.setFont(undefined, 'normal');
        doc.text(`   HQI: ${habitat.hqi.toFixed(1)} | Birds: ${habitat.birds.toLocaleString()} | Nests: ${habitat.nests.toLocaleString()} | Species: ${habitat.species}`, 15, yPos);
        yPos += 5;
        const efficiency = calculateNestingEfficiency(habitat.birds, habitat.nests);
        doc.text(`   Nesting Efficiency: ${efficiency}% | Location: ${habitat.lat.toFixed(4)}, ${habitat.lng.toFixed(4)}`, 15, yPos);
        yPos += 7;
      });

      yPos += 5;

      // Restoration Priorities
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Priority Restoration Areas (${selectedYear || 2021})`, 15, yPos);
      yPos += 8;

      // Calculate restoration priorities
      const restorationPriorities = coloniesWithFilledYears
        .map(colony => {
          const currentYearData = colony.history.find(h => h.year === selectedYear);
          const referenceYear = Math.max((selectedYear || 2021) - 5, 2010);
          const referenceData = colony.history.find(h => h.year === referenceYear);
          
          if (!currentYearData || !referenceData || referenceData.nests === 0 || currentYearData.birds === 0) return null;
          
          const change = ((currentYearData.nests - referenceData.nests) / referenceData.nests) * 100;
          
          return {
            name: colony.name,
            change,
            currentNests: currentYearData.nests,
            referenceNests: referenceData.nests,
            priority: change < -50 ? 'High' : change < -20 ? 'Medium' : 'Low'
          };
        })
        .filter(c => c !== null && c.change < -10)
        .sort((a, b) => a.change - b.change)
        .slice(0, 5);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      if (restorationPriorities.length > 0) {
        restorationPriorities.forEach((area, index) => {
          if (yPos > pageHeight - 25) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFont(undefined, 'bold');
          doc.text(`${index + 1}. ${area.name} [${area.priority} Priority]`, 15, yPos);
          yPos += 5;
          doc.setFont(undefined, 'normal');
          doc.text(`   Decline: ${Math.abs(area.change).toFixed(1)}% | Nests: ${area.referenceNests} -> ${area.currentNests}`, 15, yPos);
          yPos += 7;
        });
      } else {
        doc.text('No critical declines detected - All habitats stable', 15, yPos);
        yPos += 7;
      }

      yPos += 5;

      // Recommendations
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Recommendations', 15, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const recommendations = [
        'Continue monitoring critical habitats with HQI scores above 80',
        'Prioritize restoration efforts for colonies showing declining trends',
        'Implement AI-assisted monitoring to reduce manual dotting workload',
        'Expand citizen science programs for ground-truthing AI detections',
        'Allocate additional resources to habitats with high biodiversity'
      ];

      recommendations.forEach(rec => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${rec}`, 15, yPos);
        yPos += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Generated by EcoLens Louisiana - AI-Driven Avian Monitoring System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save PDF
      doc.save(`EcoLens_CPRA_Report_${selectedYear || 'Latest'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating report. Please try again.');
      setIsGenerating(false);
    }
  };

  const generateCSVReport = () => {
    setIsGenerating(true);

    try {
      const hqi = calculateAggregateHQI(coloniesData, selectedYear);
      const criticalHabitats = identifyCriticalHabitats(coloniesData, 10);

      let csv = 'Colony Name,Latitude,Longitude,Birds,Nests,Species Count,HQI Score,HQI Rating,Top Species\n';

      criticalHabitats.forEach(habitat => {
        const colony = coloniesData.find(c => c.name === habitat.name);
        const topSpecies = colony ? colony.top_species.map(getSpeciesName).join('; ') : '';
        
        csv += `"${habitat.name}",${habitat.lat},${habitat.lng},${habitat.birds},${habitat.nests},${habitat.species},${habitat.hqi.toFixed(1)},"${habitat.rating}","${topSpecies}"\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EcoLens_Data_Export_${selectedYear || 'Latest'}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Error generating CSV. Please try again.');
      setIsGenerating(false);
    }
  };

  const hqi = calculateAggregateHQI(coloniesData, selectedYear);

  return (
    <div className="command-panel space-y-6 h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-white">Report Generator</h2>
          <p className="text-sm text-gray-400">Professional Agency Reporting</p>
        </div>
      </div>

      {/* Report Preview */}
      <div className="glass-panel p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-bold text-white">Report Preview</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Report Type:</span>
            <span className="text-white font-semibold">CPRA Habitat Quality Assessment</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Analysis Period:</span>
            <span className="text-white font-semibold">{selectedYear || 'Latest Data'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Colonies Included:</span>
            <span className="text-white font-semibold">{hqi.coloniesAnalyzed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Overall HQI Score:</span>
            <span className="text-primary font-bold text-lg">{hqi.score}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Report will include:</p>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>✓ Executive Summary with HQI Analysis</li>
            <li>✓ Population Trends (2010-2021)</li>
            <li>✓ Top 5 Critical Habitats</li>
            <li>✓ Species Distribution Analysis</li>
            <li>✓ Restoration Recommendations</li>
            <li>✓ Georeferenced Colony Data</li>
          </ul>
        </div>
      </div>

      {/* HQI Formula Explanation */}
      <div className="glass-panel p-4 rounded-lg bg-primary/10 border border-primary/30">
        <h3 className="text-sm font-bold text-primary mb-2">Habitat Quality Index (HQI)</h3>
        <p className="text-xs text-gray-300 mb-3">
          HQI = (Total Nests / Total Birds) × Biodiversity Factor
        </p>
        <div className="space-y-1 text-xs text-gray-400">
          <p>• Nesting Efficiency: {hqi.nestingEfficiency}%</p>
          <p>• Biodiversity Factor: {hqi.biodiversityFactor ? hqi.biodiversityFactor.toFixed(2) : 'N/A'}</p>
          <p>• Final Score: {hqi.score} ({hqi.rating})</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Export Format</h3>
        
        <button
          onClick={generatePDFReport}
          disabled={isGenerating}
          className="w-full glass-button py-4 rounded-lg hover:bg-primary/10 transition-all group"
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-white font-semibold">PDF Report</p>
                <p className="text-xs text-gray-400">Professional formatted document</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </button>

        <button
          onClick={generateCSVReport}
          disabled={isGenerating}
          className="w-full glass-button py-4 rounded-lg hover:bg-ocean/10 transition-all group"
        >
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-ocean group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="text-white font-semibold">CSV Data Export</p>
                <p className="text-xs text-gray-400">Raw data for analysis</p>
              </div>
            </div>
            <Download className="w-5 h-5 text-gray-400 group-hover:text-ocean transition-colors" />
          </div>
        </button>
      </div>

      {/* Additional Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="glass-button py-3 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-colors">
          <div className="flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            Print
          </div>
        </button>
        <button className="glass-button py-3 rounded-lg text-sm font-semibold text-gray-300 hover:text-white transition-colors">
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </div>
        </button>
      </div>

      {/* Usage Note */}
      <div className="glass-panel p-3 rounded-lg bg-ocean/10 border border-ocean/30">
        <p className="text-xs text-ocean">
          <strong>For CPRA Use:</strong> These reports provide actionable data for coastal restoration 
          planning and demonstrate the effectiveness of restoration investments through quantifiable 
          habitat quality metrics.
        </p>
      </div>
    </div>
  );
};

export default ReportGenerator;
