# Hurricane Impact Predictor — Update Task

## Steps

- [x] 1. Update `src/components/StormImpactPanel.jsx`
  - [x] 1a. Add `impactTiming` state (default: `'next'`)
  - [x] 1b. Update storm-load `useEffect`: sort by year desc, auto-select most recent, call `onStormSelect` to pre-render track
  - [x] 1c. Update dropdown `onChange`: call `onStormSelect`, reset results/impact layer
  - [x] 1d. Update `runImpactAnalysis`: compute `impactYear` / `baselineYear` from `impactTiming`
  - [x] 1e. Add Impact Timing radio control + footnote directly above "Run Impact Analysis" button

- [x] 2. Update `src/components/MapDashboardLeaflet.jsx`
  - [x] 2a. Render `StormTrackLayer` when `selectedStorm` is set (not gated on `showStormImpact`); pass `showBuffers={showStormImpact}`

## Phase 2 — Client-side lag computation

- [x] 3. Update `src/utils/stormModels.js`
  - [x] 3a. Add `exposureDistanceKm` to import from stormConfig
  - [x] 3b. Export `haversineDistanceKm(lat1,lon1,lat2,lon2)`
  - [x] 3c. Export `minDistanceToTrack(lat,lon,track)`
  - [x] 3d. Export `classifyExposureScore(minDistKm)`

- [x] 4. Update `src/components/StormImpactPanel.jsx`
  - [x] 4a. Import new geo functions + `impactScore`, `recoveryYears` from stormModels
  - [x] 4b. Replace Flask API call with client-side computation
  - [x] 4c. Build `totals[colonyName][year]` from coloniesData
  - [x] 4d. Compute `beforeYear = t-1`, `impactYear = lagMode ? t+1 : t`
  - [x] 4e. Per colony: pctDrop from actual birds, exposureScore, impactScore, recoveryYears
  - [x] 4f. Add `beforeYear`, `impactYear`, `birdsBefore`, `birdsAfter` to result rows
  - [x] 4g. Update CSV export: add `beforeYear` and `impactYear` columns
  - [x] 4h. Update sparkline: 3 labeled points (Before/t-1, Impact/impactYear, Recovery/impactYear+1)

## Do NOT change
- Scoring weights (`stormConfig.js`)
- Map buffer distances, colors
- `StormTrackLayer.jsx`
- `App.jsx`
- Any other panel/route/section
