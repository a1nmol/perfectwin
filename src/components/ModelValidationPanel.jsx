import React, { useState, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
  ScatterChart, Scatter, ZAxis, Line, LineChart
} from 'recharts';
import { CheckSquare, Square, Download, FlaskConical, TrendingUp, AlertCircle, Info, Award } from 'lucide-react';
import { getValidationData } from '../utils/dataProcessor';
import { mape, median, rmse } from '../utils/metrics';

// All selectable years that exist in the dataset
const ALL_YEARS = [2011, 2012, 2013, 2015, 2018, 2021];
const DEFAULT_TEST_YEARS = [2012, 2015, 2018, 2021];

// Color scale for MAPE bars: green → yellow → red
const getMapeColor = (value) => {
  if (value == null) return '#6b7280';
  if (value < 20) return '#10b981';
  if (value < 40) return '#eab308';
  if (value < 60) return '#f97316';
  return '#ef4444';
};

const fmt = (v, decimals = 1) =>
  v == null ? '—' : `${Number(v).toFixed(decimals)}%`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white font-bold mb-1">Year {label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const ModelValidationPanel = ({ coloniesData }) => {
  const [selectedYears, setSelectedYears] = useState(new Set(DEFAULT_TEST_YEARS));

  const toggleYear = useCallback((year) => {
    setSelectedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) {
        if (next.size > 1) next.delete(year); // keep at least one
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  // Sorted array of selected years
  const testYears = useMemo(
    () => [...selectedYears].sort((a, b) => a - b),
    [selectedYears]
  );

  // Core validation computation — cached via useMemo
  const rawValidation = useMemo(
    () => getValidationData(coloniesData, testYears),
    [coloniesData, testYears]
  );

  // Enrich each row with computed MAPE + RMSE values
  const validationRows = useMemo(() => {
    return rawValidation.map(row => {
      const mapeBirds = mape([row.actualTotalBirds], [row.predTotalBirds]);
      const mapeNests = mape([row.actualTotalNests], [row.predTotalNests]);
      const medianColonyMape = median(row.colonyBirdsMAPEs);
      const rowRmse = rmse(
        row.colonyPoints.map(p => p.actual),
        row.colonyPoints.map(p => p.predicted)
      );
      return { ...row, mapeBirds, mapeNests, medianColonyMape, rmse: rowRmse };
    });
  }, [rawValidation]);

  // Overall accuracy metric (average MAPE birds across selected years)
  const overallMapeBirds = useMemo(() => {
    const valid = validationRows.filter(r => r.mapeBirds != null);
    if (!valid.length) return null;
    return valid.reduce((s, r) => s + r.mapeBirds, 0) / valid.length;
  }, [validationRows]);

  // Overall RMSE across all colony points
  const overallRmse = useMemo(() => {
    const allActual = validationRows.flatMap(r => r.colonyPoints.map(p => p.actual));
    const allPred   = validationRows.flatMap(r => r.colonyPoints.map(p => p.predicted));
    return rmse(allActual, allPred);
  }, [validationRows]);

  // Accuracy grade
  const accuracy = overallMapeBirds != null
    ? Math.max(0, 100 - overallMapeBirds).toFixed(1)
    : null;

  const grade = overallMapeBirds == null ? '—'
    : overallMapeBirds < 10 ? 'A+'
    : overallMapeBirds < 20 ? 'A'
    : overallMapeBirds < 30 ? 'B'
    : overallMapeBirds < 45 ? 'C'
    : overallMapeBirds < 60 ? 'D'
    : 'F';

  const gradeColor = ['A+','A'].includes(grade) ? '#10b981'
    : grade === 'B' ? '#0ea5e9'
    : grade === 'C' ? '#eab308'
    : grade === 'D' ? '#f97316'
    : '#ef4444';

  // Scatter data: predicted vs actual birds per colony (all test years combined)
  const scatterData = useMemo(() =>
    validationRows.flatMap(r =>
      r.colonyPoints.map(p => ({ x: p.actual, y: p.predicted, name: p.name, year: r.year }))
    ),
    [validationRows]
  );

  // Perfect prediction reference line extent
  const scatterMax = useMemo(() => {
    if (!scatterData.length) return 1000;
    return Math.max(...scatterData.map(d => Math.max(d.x, d.y))) * 1.05;
  }, [scatterData]);

  // Chart data
  const chartData = useMemo(() =>
    validationRows.map(r => ({
      year: r.year,
      'MAPE Birds': r.mapeBirds != null ? parseFloat(r.mapeBirds.toFixed(1)) : null,
      'MAPE Nests': r.mapeNests != null ? parseFloat(r.mapeNests.toFixed(1)) : null,
      'Median Colony': r.medianColonyMape != null ? parseFloat(r.medianColonyMape.toFixed(1)) : null,
    })),
    [validationRows]
  );

  // CSV export
  const handleExportCSV = useCallback(() => {
    const headers = ['Year', 'Valid Colonies', 'Actual Birds', 'Pred Birds',
      'MAPE Birds (%)', 'Actual Nests', 'Pred Nests',
      'MAPE Nests (%)', 'Median Colony MAPE (%)'];
    const rows = validationRows.map(r => [
      r.year,
      r.validColonies,
      r.actualTotalBirds,
      r.predTotalBirds,
      r.mapeBirds != null ? r.mapeBirds.toFixed(2) : '',
      r.actualTotalNests,
      r.predTotalNests,
      r.mapeNests != null ? r.mapeNests.toFixed(2) : '',
      r.medianColonyMape != null ? r.medianColonyMape.toFixed(2) : '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_validation.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [validationRows]);

  if (!coloniesData || coloniesData.length === 0) {
    return (
      <div className="command-panel h-full flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading data…</p>
      </div>
    );
  }

  return (
    <div className="command-panel h-full overflow-y-auto custom-scrollbar">
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="border-b border-gray-700 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">Model Validation</h2>
          </div>
          <p className="text-xs text-gray-400">
            Leave-one-year-out interpolation accuracy test
          </p>
        </div>

        {/* ── Year Selector ── */}
        <div className="glass-panel p-3 rounded-lg">
          <p className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Select test years
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_YEARS.map(year => {
              const active = selectedYears.has(year);
              return (
                <button
                  key={year}
                  onClick={() => toggleYear(year)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all border ${
                    active
                      ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {active
                    ? <CheckSquare className="w-3 h-3" />
                    : <Square className="w-3 h-3" />}
                  {year}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Each selected year is hidden from the dataset and re-predicted via linear interpolation.
          </p>
        </div>

        {/* ── Accuracy Metric Card ── */}
        <div className={`glass-panel p-4 rounded-lg border-2 ${
          accuracy != null && parseFloat(accuracy) >= 70
            ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent'
            : accuracy != null && parseFloat(accuracy) >= 50
            ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 to-transparent'
            : 'border-red-500/40 bg-gradient-to-br from-red-500/10 to-transparent'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Interpolation Accuracy
              </p>
              <p className={`text-4xl font-bold ${
                accuracy != null && parseFloat(accuracy) >= 70
                  ? 'text-emerald-400'
                  : accuracy != null && parseFloat(accuracy) >= 50
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {accuracy != null ? `${accuracy}%` : '—'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                100 − avg MAPE (total birds)
              </p>
            </div>
            <div className="text-right space-y-2">
              {/* Grade badge */}
              <div className="flex items-center justify-end gap-1.5">
                <Award className="w-3.5 h-3.5" style={{ color: gradeColor }} />
                <span className="text-2xl font-black" style={{ color: gradeColor }}>{grade}</span>
              </div>
              <p className="text-xs text-gray-400">
                Avg MAPE:{' '}
                <span className="text-white font-semibold">
                  {overallMapeBirds != null ? `${overallMapeBirds.toFixed(1)}%` : '—'}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                RMSE:{' '}
                <span className="text-white font-semibold">
                  {overallRmse != null ? Math.round(overallRmse).toLocaleString() : '—'}
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Test years:{' '}
                <span className="text-white font-semibold">{testYears.length}</span>
              </p>
            </div>
          </div>
          {/* Progress bar */}
          {accuracy != null && (
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(parseFloat(accuracy), 100)}%`,
                  backgroundColor: gradeColor,
                }}
              />
            </div>
          )}
        </div>

        {/* ── Bar Chart ── */}
        <div className="glass-panel p-3 rounded-lg">
          <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />
            MAPE by Year
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                  width={38}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={20} stroke="#10b981" strokeDasharray="4 2" strokeOpacity={0.5} />
                <Bar dataKey="MAPE Birds" name="MAPE Birds" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-birds-${index}`}
                      fill={getMapeColor(entry['MAPE Birds'])}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
                <Bar dataKey="MAPE Nests" name="MAPE Nests" radius={[3, 3, 0, 0]} fill="#0ea5e9" fillOpacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-gray-500 text-xs">
              No validation data available
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm inline-block bg-emerald-500" /> Birds
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-2 rounded-sm inline-block bg-sky-500 opacity-60" /> Nests
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <span className="w-4 border-t border-dashed border-emerald-500/60 inline-block" /> 20% threshold
            </span>
          </div>
        </div>

        {/* ── Scatter: Predicted vs Actual ── */}
        <div className="glass-panel p-3 rounded-lg">
          <h3 className="text-xs font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
            Predicted vs Actual — Per Colony
          </h3>
          <p className="text-xs text-gray-500 mb-3">Points on the diagonal = perfect prediction</p>
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 4, right: 8, bottom: 20, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name="Actual"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  label={{ value: 'Actual Birds', position: 'insideBottom', offset: -12, fill: '#9ca3af', fontSize: 10 }}
                  domain={[0, scatterMax]}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="Predicted"
                  stroke="#9ca3af"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  width={36}
                  domain={[0, scatterMax]}
                />
                <ZAxis range={[30, 30]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs shadow-xl">
                        <p className="text-white font-bold truncate max-w-[160px]">{d?.name}</p>
                        <p className="text-emerald-400">Actual: {d?.x?.toLocaleString()}</p>
                        <p className="text-sky-400">Predicted: {d?.y?.toLocaleString()}</p>
                        <p className="text-gray-400">Year: {d?.year}</p>
                      </div>
                    );
                  }}
                />
                {/* Perfect prediction line */}
                <Line
                  data={[{ x: 0, y: 0 }, { x: scatterMax, y: scatterMax }]}
                  dataKey="y"
                  dot={false}
                  stroke="#10b981"
                  strokeDasharray="6 3"
                  strokeOpacity={0.5}
                  strokeWidth={1.5}
                  type="linear"
                  legendType="none"
                  isAnimationActive={false}
                />
                <Scatter
                  data={scatterData}
                  fill="#0ea5e9"
                  fillOpacity={0.7}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-500 text-xs">
              No colony-level data available
            </div>
          )}
        </div>

        {/* ── Results Table ── */}
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700">
            <h3 className="text-xs font-bold text-white">Validation Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-3 py-2 text-left text-gray-400 font-semibold">Year</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Colonies</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">MAPE Birds</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">MAPE Nests</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Median Colony</th>
                </tr>
              </thead>
              <tbody>
                {validationRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      No data — select test years above
                    </td>
                  </tr>
                ) : (
                  validationRows.map((row, i) => (
                    <tr
                      key={row.year}
                      className={`border-b border-gray-800 hover:bg-gray-800/40 transition-colors ${
                        i % 2 === 0 ? 'bg-gray-900/20' : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-white">{row.year}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{row.validColonies}</td>
                      <td className="px-3 py-2 text-right font-semibold"
                        style={{ color: getMapeColor(row.mapeBirds) }}>
                        {fmt(row.mapeBirds)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold"
                        style={{ color: getMapeColor(row.mapeNests) }}>
                        {fmt(row.mapeNests)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold"
                        style={{ color: getMapeColor(row.medianColonyMape) }}>
                        {fmt(row.medianColonyMape)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Actual vs Predicted Detail ── */}
        <div className="glass-panel rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-700">
            <h3 className="text-xs font-bold text-white">Actual vs Predicted Totals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-800/50">
                  <th className="px-3 py-2 text-left text-gray-400 font-semibold">Year</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Act. Birds</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Pred. Birds</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Act. Nests</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-semibold">Pred. Nests</th>
                </tr>
              </thead>
              <tbody>
                {validationRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      No data
                    </td>
                  </tr>
                ) : (
                  validationRows.map((row, i) => (
                    <tr
                      key={row.year}
                      className={`border-b border-gray-800 hover:bg-gray-800/40 transition-colors ${
                        i % 2 === 0 ? 'bg-gray-900/20' : ''
                      }`}
                    >
                      <td className="px-3 py-2 font-bold text-white">{row.year}</td>
                      <td className="px-3 py-2 text-right text-emerald-400">
                        {row.actualTotalBirds.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {row.predTotalBirds.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-sky-400">
                        {row.actualTotalNests.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right text-gray-300">
                        {row.predTotalNests.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Methodology Note ── */}
        <div className="glass-panel p-3 rounded-lg border border-gray-700/50">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="text-gray-400 font-semibold">Methodology: </span>
            For each test year, colonies with actual survey data for that year have it
            withheld. The app's linear interpolation is applied using the nearest
            preceding and following survey years. MAPE is computed between the
            interpolated and actual values. Colonies without bracketing data points
            are excluded from that year's calculation.
          </p>
        </div>

        {/* ── Export Button ── */}
        <button
          onClick={handleExportCSV}
          disabled={validationRows.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
            bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40
            text-purple-300 text-sm font-semibold transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export Validation CSV
        </button>

      </div>
    </div>
  );
};

export default ModelValidationPanel;
