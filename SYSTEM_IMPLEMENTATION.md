# 🦅 EcoLens Louisiana: System Implementation

## Overview

EcoLens Louisiana is an enterprise-grade geospatial monitoring system designed to automate the classification and tracking of coastal bird nesting colonies. It bridges the gap between archival aerial photography and real-time conservation metrics using an AI-first approach.

---

## 1. Data Model & Schema

### Avian Colony Master Model (JSON/NoSQL)

To handle the scale of 190 colonies and 236,890+ historical records, we implemented a nested time-series schema.

```typescript
interface AvianColony {
  name: string;             // Colony Name (e.g., "Breton Island")
  lat: number;              // Decimal degrees latitude
  lng: number;              // Decimal degrees longitude
  sample_image: string;     // Path to high-res aerial archive
  top_species: string[];    // Top 3 dominant species codes
  history: {
    year: number;           // 2010 - 2021 (actual data)
    birds: number;          // Total population count
    nests: number;          // Total breeding count
    species_count: number;  // Unique species for that year
  }[];
}
```

### Master Dataset Structure

**la_colonies_summary.json:**
- 190 unique colonies
- Geographic coordinates for mapping
- Historical data arrays (2010-2021)
- Sample image paths for reference

**louisiana_avian_master.json:**
- 236,890 individual observations
- Species-level detail per year
- Multiple observations per colony per year
- Comprehensive temporal coverage

---

## 2. AI Pipeline Infrastructure

### YOLOv11 Computer Vision Engine (Simulated)

The core of the innovation challenge is moving away from manual "dotting."

**Object Detection Pipeline:**
1. **Image Upload & Validation**
   - Pixel density analysis
   - Dimension validation (rejects portraits)
   - Aerial photography verification

2. **Preprocessing Layer**
   - Vegetation detection (green pixels > 15%)
   - Water detection (blue pixels > 10%)
   - Sediment detection (brown pixels > 10%)
   - Bird density mapping (white pixel concentration)

3. **Detection Generation**
   - Species-specific predictions based on colony history
   - Bounding box generation with coordinates
   - Confidence score calculation (0.75-0.95)

4. **Inference Output**
   - Returns bounding boxes with [x, y, width, height]
   - Species labels from colony's top_species
   - Confidence intervals per detection
   - Density heatmap data

**Detection Formula:**
```javascript
Detection Count = Historical Count × Quality × Vegetation × Water × Bird Density

Where:
- Historical Count = Colony's average nest count
- Quality Multiplier = 1.2 (high res) or 0.8 (medium res)
- Vegetation Factor = 1.1 (present) or 0.9 (absent)
- Water Factor = 1.0 (present) or 0.8 (absent)
- Bird Density = White pixel density × 100 (capped at 2.0)
```

**Confidence Score Calculation:**
```javascript
Confidence = Base Confidence + Quality Bonus - Species Rank Penalty

Where:
- Base Confidence = 0.85 (aerial) or 0.65 (uncertain)
- Quality Bonus = +0.10 (high resolution images)
- Species Rank Penalty = -0.05 per rank (less common species)
- Final range: 0.65 - 0.95
```

### Human-in-the-Loop (Expert Correction)

**Correction Logging:**
- Dedicated API route `/api/save-correction`
- Captures manual adjustments made by scientists
- Stores annotation data with timestamps
- Links corrections to original AI detections

**Annotation Data Structure:**
```json
{
  "colony_name": "Raccoon Island",
  "annotations": [
    {
      "id": 1234567890,
      "x": 150,
      "y": 200,
      "width": 250,
      "height": 180,
      "species": "LAGU",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "ai_detections": { /* AI results */ },
  "total_corrections": 3
}
```

**Model Fine-Tuning:**
- Corrections act as "Retraining Set"
- Helps AI distinguish birds from Louisiana-specific sediment
- Improves detection in marsh grass environments
- Reduces false positives/negatives over time

---

## 3. Geospatial Visualization Strategy

### Leaflet & React-Leaflet Integration

**Colony Mapping:**
- 190 markers rendered with custom icons
- Color-coded by species richness (biodiversity)
- Interactive popups with historical data
- Smooth zoom and pan controls

**Biodiversity Color-Coding:**
```javascript
const getMarkerColor = (speciesCount) => {
  if (speciesCount >= 16) return '#10B981'; // Emerald - Very High
  if (speciesCount >= 11) return '#EF4444'; // Red - High
  if (speciesCount >= 6) return '#F59E0B';  // Orange - Medium
  return '#EAB308';                          // Yellow - Low
};
```

**Interactive Features:**
- Click markers for detailed colony information
- Historical trend visualization in popups
- Year filtering updates marker visibility
- Louisiana boundary overlay highlighting

**Map Configuration:**
```javascript
{
  center: [29.9511, -90.0715],  // Louisiana coastal center
  zoom: 8,                       // State-wide view
  basemap: 'OpenStreetMap',      // Free, open-source tiles
  theme: 'dark'                  // Optimized for data viz
}
```

---

## 4. Analytics & Predictive Modeling

### The Resilience Timeline (2010-2026)

EcoLens solves the "archive" challenge by filling data gaps using statistical modeling:

**Data Types:**

1. **Actual Data (2010-2021):**
   - Real survey data from Water Institute
   - No special indicator
   - Highest confidence

2. **Interpolated Data (2014, 2016, 2017, 2019, 2020):**
   - Linear interpolation between known years
   - Yellow warning badge
   - Medium confidence

3. **AI Predictions (2022-2026):**
   - Exponential growth model
   - Blue "Predicted" badge with sparkle icon
   - Based on historical trends

**Linear Interpolation Formula:**
```javascript
Interpolated Value = Value₁ + (Value₂ - Value₁) × Ratio

Where:
- Value₁ = Data from nearest earlier year
- Value₂ = Data from nearest later year
- Ratio = (Target Year - Year₁) / (Year₂ - Year₁)
```

**Exponential Forecasting Formula:**
```javascript
Future Population = Current Population × (Growth Rate)^Years

Where:
- Growth Rate = 1.02 (2% annual growth based on historical trend)
- Years = Number of years from last actual data (2021)
- Applied to both birds and nests independently
```

### Habitat Quality Index (HQI)

A custom algorithm designed for resource managers:

**Formula:**
```javascript
HQI = (Nesting Efficiency × Biodiversity Factor) × 100

Where:
- Nesting Efficiency = Total Nests / Total Birds
- Biodiversity Factor = Species Richness / Max Species Richness
- Score ranges: 0-100
```

**Rating System:**
- **Excellent (80-100):** Thriving habitat, maintain protection
- **Good (60-79):** Healthy habitat, monitor for changes
- **Fair (40-59):** Moderate concerns, consider restoration
- **Poor (0-39):** Critical habitat, immediate intervention

**Components:**
1. **Efficiency:** Measures breeding success (nests per bird)
2. **Diversity:** Measures ecosystem health (species variety)
3. **Stability:** Implicit in year-over-year consistency

---

## 5. Priority Restoration Areas (Year-Specific)

### Decline Detection Algorithm

**Formula:**
```javascript
Decline % = ((Current Nests - Reference Nests) / Reference Nests) × 100

Where:
- Current Nests = Nest count for selected year
- Reference Nests = Nest count from 5 years prior (or earliest available)
- Threshold: Decline > 10% triggers alert
```

**Priority Levels:**
- **High Priority (>50% decline):**
  - Reason: "Critical habitat loss - Storm damage or erosion"
  - Action: Immediate intervention required
  
- **Medium Priority (20-50% decline):**
  - Reason: "Significant decline - Predation or disturbance"
  - Action: Restoration needed
  
- **Low Priority (10-20% decline):**
  - Reason: "Moderate decline - Natural fluctuation"
  - Action: Monitoring recommended

**Why Colonies Decline:**
1. **Storm Damage:** Hurricanes destroy nesting sites
2. **Coastal Erosion:** Land loss reduces habitat
3. **Predation:** Increased predator populations
4. **Human Disturbance:** Boat traffic, development
5. **Sea Level Rise:** Flooding of nesting areas
6. **Vegetation Loss:** Reduced cover and materials

---

## 6. API Layer & Deployment

### Serverless Architecture

**Vercel Python Functions:**
- AI backend decoupled from UI
- Heavy image processing in isolated environment
- Auto-scaling based on demand
- Global edge network deployment

**API Endpoints:**

1. **GET /api/colonies**
   - Fetches master geospatial data
   - Returns 190 colonies with full history
   - Supports year filtering

2. **POST /api/detect**
   - Analyzes uploaded aerial imagery
   - Returns bounding boxes and confidence scores
   - Validates image quality and type

3. **POST /api/save-correction**
   - Logs "Citizen Science" feedback
   - Stores annotation data
   - Links to original AI detections

**Tech Stack Summary:**

**Frontend:**
- React 18.2 (functional components, hooks)
- Vite 5.0 (fast HMR, optimized builds)
- Tailwind CSS 3.3 (utility-first, glassmorphism)
- Recharts 2.10 (data visualization)
- Leaflet.js 1.9 (mapping)
- React-Leaflet 4.2 (React integration)
- Lucide React (icons)

**Backend:**
- Python 3.11 (serverless functions)
- Flask (lightweight API framework)
- Flask-CORS (cross-origin requests)

**Deployment:**
- Vercel (edge network, auto-scaling)
- GitHub (version control)
- CI/CD (automated deployment)

---

## 7. Component Architecture

### Core Components

**MapDashboardLeaflet.jsx:**
- Renders Leaflet map with 190 colony markers
- Handles year filtering and marker updates
- Manages popup interactions
- Implements biodiversity color-coding

**AnalyticsSidebar.jsx:**
- Calculates real-time metrics
- Renders Recharts visualizations
- Displays priority restoration areas
- Shows critical habitats

**TimelineSlider.jsx:**
- Generates complete 2010-2026 data
- Handles interpolation and prediction
- Manages year selection
- Displays comparison views

**AIDetectionPanel.jsx:**
- Handles image upload and validation
- Runs AI detection simulation
- Displays bounding boxes
- Shows confidence scores and heatmap

**AnnotationOverlay.jsx:**
- Provides canvas for rectangle drawing
- Manages annotation state
- Sends corrections to API
- Displays AI vs human annotations

**ReportGenerator.jsx:**
- Generates PDF/CSV reports
- Calculates HQI and metrics
- Formats data for CPRA
- Embeds visualizations

---

## 8. Data Processing Utilities

**speciesMapping.js:**
- Maps 45+ species codes to full names
- Categorizes species by type (tern, gull, pelican, etc.)
- Provides color-coding for visualization

**hqiCalculator.js:**
- Implements HQI formula
- Calculates aggregate metrics
- Identifies critical habitats
- Determines restoration priorities

**colonyRenderer.js:**
- Generates marker colors based on biodiversity
- Creates popup content with historical data
- Formats coordinates and statistics

**dataProcessor.js:**
- Processes master dataset (236,890 records)
- Aggregates data by year and colony
- Handles missing data gracefully

---

## 9. Coastal Habitat Loss Engine

### Data Sources
- USGS National Wetlands Research Center — Louisiana Coastal Wetland Loss Reports
- CPRA 2023 Coastal Master Plan
- NOAA Office for Coastal Management — Land Change Atlas
- Couvillion et al. (2017) "Land Area Change in Coastal Louisiana"

### 7 Coastal Basin Definitions (src/utils/habitatLoss.js)

| Basin | Annual Loss Rate | Acres Lost 1932–2016 | Risk |
|---|---|---|---|
| Terrebonne | 1.42%/yr | 562,800 | Critical |
| Barataria | 1.15%/yr | 316,500 | Critical |
| Plaquemines / Bird's Foot | 0.98%/yr | 198,400 | High |
| Lake Borgne / St. Bernard | 0.88%/yr | 154,200 | High |
| Lake Pontchartrain | 0.62%/yr | 87,300 | Moderate |
| Chenier Plain | 0.55%/yr | 112,600 | Moderate |
| Atchafalaya / Wax Lake | −0.28%/yr | −18,400 (gained) | Stable |

### Core Algorithms

**Zone Assignment (assignZone):**
- Haversine distance from colony to each zone center
- Colony assigned to nearest zone within radius
- Fallback: nearest zone even if outside radius (boundary colonies)

**Cumulative Loss (estimateCumulativeLoss):**
```javascript
// Losing land
loss% = (1 - (1 - annualRate)^years) * 100

// Gaining land (Atchafalaya)
gain% = -(1 - (1 + |annualRate|)^years) * 100
```

**Distance Attenuation:**
```javascript
distFraction = min(distFromCenter / zoneRadiusKm, 1)
effectiveRate = zone.annualLossRate * (1 - distFraction * 0.4)
// Edge of zone = 60% of center intensity
```

**Vulnerability Score (0–100):**
```javascript
if (effectiveRate <= 0) score = 5          // gaining land
else if (effectiveRate < 0.004) score = rate * 8000
else score = min(100, loss2010_2024 * 4.5)
```

### Map Layer Integration

When `showHabitatLayer = true` in MapDashboardLeaflet:
- 7 `Circle` overlays drawn at zone centers (semi-transparent, risk-colored)
- Atchafalaya uses solid border (gaining land)
- All other zones use dashed border (losing land)
- Colony circle markers recolored by `riskColor(vulnerabilityScore)` instead of species richness
- Legend switches from "Species Richness" mode to "Habitat Loss Risk" mode

**Risk Color Scale:**
```javascript
score >= 75 → red    (#ef4444)  Critical
score >= 50 → orange (#f97316)  High
score >= 25 → yellow (#eab308)  Moderate
score > 10  → lime   (#84cc16)  Low
else        → green  (#10b981)  Stable / Gaining
```

---

## 10. Hurricane Impact + Recovery Predictor

### Storm Impact Analysis System

**Comprehensive Historical Database:**
- 10 Louisiana hurricanes (2008-2024)
- Accurate storm tracks with 8-12 data points per storm
- Wind speeds in knots for Saffir-Simpson classification
- Geographic coordinates for landfall locations

**Storm Data Structure:**
```json
{
  "id": "IDA-2021",
  "name": "Ida",
  "year": 2021,
  "category": 4,
  "maxWindKt": 130,
  "description": "Category 4 hurricane...",
  "track": [
    {"lat": 29.2, "lon": -90.1, "time": "2021-08-29T00:00:00Z", "windKt": 130}
  ],
  "radiiKm": {"ts34": 150, "ts50": 90, "hu64": 40}
}
```

### Impact Calculation Models

**1. Exposure Score (Distance-Based):**
```javascript
if (distance < 20 km)  → ExposureScore = 1.0  // Very High
if (distance < 50 km)  → ExposureScore = 0.8  // High
if (distance < 100 km) → ExposureScore = 0.5  // Medium
if (distance < 150 km) → ExposureScore = 0.2  // Low
else                   → ExposureScore = 0.0  // Minimal
```

**2. Wind Factor (Saffir-Simpson):**
```javascript
Category 5 (≥137 kt) → WindFactor = 1.0
Category 4 (113-136 kt) → WindFactor = 0.8
Category 3 (96-112 kt) → WindFactor = 0.6
Category 2 (83-95 kt) → WindFactor = 0.4
Category 1 (64-82 kt) → WindFactor = 0.2
```

**3. Surge Factor (Habitat-Specific):**
```javascript
Low marsh/Sandbar → SurgeFactor = 1.0
Barrier island → SurgeFactor = 0.7
Interior wetland → SurgeFactor = 0.3
Unknown → SurgeFactor = 0.7 (neutral)
```

**4. Habitat Fragility:**
```javascript
Sandbar → Fragility = 1.0
Low marsh → Fragility = 0.8
Barrier island → Fragility = 0.7
Vegetated island → Fragility = 0.6
Interior wetland → Fragility = 0.4
Stable substrate → Fragility = 0.3
```

**5. Impact Score Formula:**
```javascript
ImpactScore = (WindFactor × 0.4) + 
              (SurgeFactor × 0.3) + 
              (HabitatFragility × 0.2) + 
              (ExposureScore × 0.1)
// Range: 0.0 to 1.0
```

**6. Recovery Timeline Prediction:**
```javascript
RecoveryYears = (ImpactScore × 4) - 
                (SpeciesRichness × 0.1) - 
                (VegetationDensity × 0.05) + 
                (LandLossRate × 1.5)
// Clamped to 1-12 years
```

**7. Population Drop Prediction:**
```javascript
PopulationDrop% = ImpactScore × 40
// Range: 0% to 40%
```

### Geographic Distance Calculations

**Haversine Distance Formula:**
```javascript
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

**Minimum Distance to Storm Track:**
- Calculates perpendicular distance from colony to each track segment
- Uses dot product for projection onto line segments
- Returns minimum distance across all segments

### Flask API Endpoint

**POST /api/storm-impact:**
```python
Input:
{
  "stormId": "IDA-2021",
  "year": 2021,
  "colonies": [
    {
      "id": "...",
      "name": "...",
      "lat": 29.5,
      "lon": -90.2,
      "habitatType": "Barrier island",
      "speciesRichness": 14
    }
  ]
}

Output:
{
  "storm": {"id": "IDA-2021", "name": "Ida", "year": 2021, "category": 4},
  "results": [
    {
      "colonyId": "...",
      "colonyName": "...",
      "exposureScore": 0.8,
      "impactScore": 0.65,
      "predictedPopulationDropPct": 26,
      "recoveryYears": 3,
      "factors": {
        "minDistanceKm": 45.2,
        "habitatType": "Barrier island",
        "speciesRichness": 14
      }
    }
  ],
  "summary": {
    "count": 190,
    "maxImpact": 0.85,
    "meanImpact": 0.32,
    "topColonies": [...]
  }
}
```

### Visualization Components

**StormTrackLayer.jsx:**
- Renders storm track as polyline
- Displays distance buffer circles (20/50/100/150 km)
- Color-coded zones: red (20km), orange (50km), yellow (100km), amber (150km)
- Interactive legend with distance labels

**StormImpactPanel.jsx:**
- Storm selection dropdown (10 storms)
- "Run Impact" button triggers API call
- Sortable results table with all metrics
- Recovery sparkline charts (linear recovery visualization)
- CSV export functionality
- Settings panel for weight adjustments

### Performance Optimization

**Calculation Speed:**
- Processes 190 colonies in < 300ms
- Efficient distance calculations using Haversine formula
- Memoized storm data loading
- Optimized React rendering with useMemo

**Data Management:**
- Storm data cached in browser
- API responses compressed
- Minimal re-renders on user interaction

---

## 10. Future Scalability

### Planned Enhancements

**Drone Integration:**
- API built to accept real-time telemetry
- Automated survey scheduling
- Live data streaming to dashboard

**Satellite Sync:**
- Integration with Sentinel-2 imagery
- Daily shoreline recession tracking
- Automated change detection

**Real YOLOv11 Training:**
- Transfer learning from simulated model
- Fine-tuning with Louisiana-specific data
- Continuous improvement from corrections

**Mobile Applications:**
- Native iOS/Android apps
- Offline data collection
- Field annotation capabilities

**Advanced Analytics:**
- Machine learning trend prediction
- Climate impact modeling
- Restoration ROI calculation
- Multi-storm cumulative impact analysis

---

## 11. Performance Optimization

**Frontend Optimization:**
- Code splitting for faster initial load
- Lazy loading of components
- Memoization of expensive calculations
- Debounced user interactions

**Map Performance:**
- Marker clustering for dense areas
- Viewport-based rendering
- Optimized popup generation
- Cached tile layers

**Data Management:**
- Local storage for user preferences
- Efficient state management
- Minimal re-renders
- Optimized data structures

---

**System designed and implemented for Louisiana's coastal future**  
*EcoLens Louisiana © 2026*
