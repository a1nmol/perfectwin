# 🦅 EcoLens Louisiana
**AI-Powered Geospatial Intelligence for Coastal Resilience**  
*Competition Entry: Nexus Louisiana DevDay ClimateTech Challenge*

> "Transforming 400,000+ archival aerial images into actionable conservation intelligence."

---

## 🎯 The Challenge

Louisiana's coast is disappearing at an alarming rate. For over a decade, scientists have manually "dotted" (counted) birds in aerial photos to track habitat health—a process that is slow, expensive, and reactive. **EcoLens Louisiana** automates this workflow, moving conservation from manual counting to predictive AI modeling.

---

## 🚀 Winning Features

### 1. 🗺️ **Intelligent Geospatial Command Center**

**Data-Driven Mapping:**
- Leverages a master dataset of **190 unique bird colonies** extracted from the Water Institute's 2010–2021 records
- Processes **236,890 individual observations** for comprehensive temporal analysis
- Real-time filtering by year (2010-2026) with seamless data transitions

**Biodiversity Heatmaps:**
- Dynamic color-coding based on species richness:
  - 🟡 **Yellow:** Low biodiversity (1-5 species)
  - 🟠 **Orange:** Medium biodiversity (6-10 species)
  - 🔴 **Red:** High biodiversity (11-15 species)
  - 🟢 **Emerald:** Very High biodiversity (16+ species)

**Colony Deep-Dive:**
- Interactive Leaflet markers with detailed popups
- Historical recovery trends (e.g., Raccoon Island's 10-year success story)
- Geographic coordinates and sample imagery links
- Top 3 dominant species per colony

---

### 2. 🤖 **Human-in-the-Loop AI (YOLOv11 Simulation)**

**Automated Detection:**
- Simulated YOLOv11 computer vision pipeline optimized for aerial imagery
- Intelligent image validation (rejects bird portraits, validates aerial photos)
- Species-specific detection based on colony's historical data
- Bounding boxes with confidence scores (75-95%)

**Advanced Visual Analysis:**
- **Pixel-level analysis:**
  - Vegetation detection (green pixels > 15%)
  - Water detection (blue pixels > 10%)
  - Sediment detection (brown pixels > 10%)
  - Bird density mapping (white pixel concentration)
- **Density heatmap** toggle for concentration visualization
- **Species predictions** with individual confidence bars

**Expert Correction Mode:**
- Dedicated annotation portal for scientists
- Click-and-drag rectangle drawing for missed nests
- Real-time visual feedback (dashed = AI, solid = human)
- Corrections logged to `/api/save-correction` for model fine-tuning
- Addresses Louisiana-specific camouflage challenges

---

### 3. ⏱️ **Habitat Resilience Timeline (2010 – 2026)**

**Complete Temporal Coverage:**
- **Actual Data (2010-2021):** Real survey data from Water Institute
- **Interpolated Data:** Linear interpolation for missing years (2014, 2016, 2017, 2019, 2020)
- **AI Predictions (2022-2026):** Exponential growth forecasting with 2% annual rate

**Prediction Formulas:**
```
Future Population = Current Population × (1.02)^Years
Interpolated Value = Value₁ + (Value₂ - Value₁) × Ratio
```

**Habitat Quality Index (HQI):**
```
HQI = (Total Nests / Total Birds) × Biodiversity Factor × 100
Biodiversity Factor = Species Richness / Max Species Richness
```

**Interactive Features:**
- Year slider with visual indicators (actual/interpolated/predicted)
- Real-time metric updates
- 2010 vs 2021 comparison view with percentage changes
- Key insights for resource managers

---

### 4. 🌿 **Coastal Habitat Loss Layer (USGS Data)**

**7 Louisiana Coastal Basins — Real Loss Rates:**
- Terrebonne Basin: **1.42%/yr** — highest in Louisiana (USGS Couvillion 2017)
- Barataria Basin: **1.15%/yr** — Deepwater Horizon legacy
- Plaquemines / Bird's Foot Delta: **0.98%/yr** — delta abandonment
- Lake Borgne / St. Bernard: **0.88%/yr** — MR-GO channel effects
- Lake Pontchartrain: **0.62%/yr** — urbanization and levee isolation
- Chenier Plain: **0.55%/yr** — wave erosion and hurricanes
- Atchafalaya / Wax Lake: **−0.28%/yr** — **GAINING land** (active delta)

**What it shows:**
- Compound annual loss projections from 2010 → 2024 → 2030
- Per-colony vulnerability score (0–100) based on zone + distance
- Map overlay: colony markers recolored by habitat risk (not species count)
- Basin cards with CPRA restoration projects and loss drivers
- Top 12 most vulnerable colonies ranked

---

### 5. 📊 **Advanced Analytics Dashboard**

**Real-Time Metrics:**
- **Colonies Detected:** Active colonies for selected year
- **Species Richness:** Unique species count across all colonies
- **Total Birds:** Population with trend indicators (↑↓→)
- **Total Nests:** Nesting activity with efficiency percentage

**Data Visualizations:**
- **Population Trends:** Area chart (birds/nests 2010-2021)
- **Species Diversity:** Line chart tracking average species per colony
- **Species Distribution:** Pie chart of top 8 species
- **Priority Restoration Areas:** Year-specific declining colonies
- **Critical Habitats:** Top 5 habitats by HQI score

**Year-Specific Priority Restoration:**
- Compares selected year vs 5 years prior
- Shows actual nest counts for both periods
- Categorizes by priority level:
  - **High (>50% decline):** Critical habitat loss - Storm damage or erosion
  - **Medium (20-50% decline):** Significant decline - Predation or disturbance
  - **Low (10-20% decline):** Moderate decline - Natural fluctuation

---

### 5. 🌀 **Hurricane Impact + Recovery Predictor**

**Comprehensive Storm Analysis:**
- **10 Historical Louisiana Hurricanes** (2008-2024)
  - Francine (2024) - Category 2
  - Ida (2021) - Category 4
  - Zeta (2020) - Category 3
  - Delta (2020) - Category 2
  - Laura (2020) - Category 4
  - Barry (2019) - Category 1
  - Nate (2017) - Category 1
  - Harvey (2017) - Tropical Storm
  - Isaac (2012) - Category 1
  - Gustav (2008) - Category 3

**Impact Calculations:**
- Distance-based exposure scoring (20/50/100/150 km buffers)
- Wind factor by Saffir-Simpson category
- Storm surge factor by habitat type
- Habitat fragility assessment
- Predicted population drop percentage
- Recovery timeline predictions (1-12 years)

**Interactive Features:**
- Storm track visualization with distance buffers
- Color-coded impact zones (red/orange/yellow/amber)
- Sortable results table by impact score
- Recovery sparkline charts
- CSV export for analysis
- Real-time calculations for 190 colonies

**Scientific Formulas:**
```
ExposureScore = f(distance to storm track)
ImpactScore = (WindFactor × 0.4) + (SurgeFactor × 0.3) + 
              (HabitatFragility × 0.2) + (ExposureScore × 0.1)
RecoveryYears = (ImpactScore × 4) - (SpeciesRichness × 0.1) - 
                (VegetationDensity × 0.05) + (LandLossRate × 1.5)
PopulationDrop% = ImpactScore × 40
```

### 6. 📄 **Professional CPRA Reporting**

**Export Capabilities:**
- PDF and CSV formats
- Executive summary with key findings
- HQI calculations with formula explanations
- Colony-by-colony breakdown
- Trend analysis (2010-2021)
- Priority restoration recommendations
- Hurricane impact assessments
- Embedded data visualizations

---

## 🏗️ Project Architecture

```
ecolens-louisiana/
├── api/                                    # Python Serverless Functions
│   ├── detect.py                          # AI detection (YOLOv11 sim + geo)
│   ├── save-correction.py                 # Citizen science logging
│   └── requirements.txt                   # Flask, Flask-CORS
├── public/
│   └── data/
│       ├── la_colonies_summary.json       # 190 colonies summary
│       ├── louisiana_avian_master.json    # 236,890 detailed records
│       └── mock_storms.json               # 10 historical hurricanes
├── src/
│   ├── components/
│   │   ├── MapDashboardLeaflet.jsx        # Leaflet mapping + habitat overlay
│   │   ├── AnalyticsSidebar.jsx           # Analytics + user workflow guide
│   │   ├── TimelineSlider.jsx             # 2010-2026 timeline + predictions
│   │   ├── AIDetectionPanel.jsx           # AI detection + geo-referencing
│   │   ├── AnnotationOverlay.jsx          # Canvas annotation tool
│   │   ├── ReportGenerator.jsx            # CPRA report export (PDF/CSV)
│   │   ├── StormImpactPanel.jsx           # Hurricane impact analysis
│   │   ├── StormTrackLayer.jsx            # Storm track + buffer rings
│   │   ├── ColonyProfile.jsx              # Per-colony deep dive panel
│   │   ├── SpeciesIntelligence.jsx        # Species-level analytics
│   │   ├── RestorationBudgetPlanner.jsx   # ROI-based budget allocation
│   │   └── HabitatLossPanel.jsx           # Land loss by USGS basin
│   ├── utils/
│   │   ├── speciesMapping.js              # 45+ species code mapping
│   │   ├── hqiCalculator.js               # Habitat Quality Index
│   │   ├── colonyRenderer.js              # Map marker color logic
│   │   ├── dataProcessor.js               # Master data aggregation
│   │   ├── geo.js                         # Haversine + polyline distance
│   │   ├── stormConfig.js                 # Hurricane impact constants
│   │   ├── stormModels.js                 # Impact scoring + recovery model
│   │   ├── habitatLoss.js                 # USGS coastal zone loss engine
│   │   └── metrics.js                     # RMSE and shared stat helpers
│   ├── data/
│   │   └── la_colonies_summary.json       # Colony data (local import)
│   ├── App.jsx                            # Main app — mobile responsive
│   ├── main.jsx                           # React entry point
│   └── index.css                          # Dark theme + custom scrollbar
├── package.json                           # Dependencies
├── vite.config.js                         # Vite configuration
├── tailwind.config.js                     # Tailwind CSS config
└── vercel.json                            # Vercel deployment
```

---

## 🧪 The Science Behind the Code

### **Algorithms:**
- **Exponential Growth Modeling:** 2% annual growth for 2022-2026 predictions
- **Linear Interpolation:** Filling data gaps for missing years
- **HQI Calculation:** Multi-factor habitat health assessment

### **Formulas:**
```javascript
// Habitat Quality Index
HQI = (Total Nests / Total Birds) × (Species Richness / Max Richness) × 100

// Future Prediction
Future = Current × (Growth Rate)^Years

// Interpolation
Value = Value₁ + (Value₂ - Value₁) × ((Year - Year₁) / (Year₂ - Year₁))

// Decline Detection
Decline% = ((Current Nests - Reference Nests) / Reference Nests) × 100
```

### **Mapping Technology:**
- **Leaflet.js** for lightweight, performant mapping
- **React-Leaflet** for seamless React integration
- **Custom markers** with biodiversity color-coding
- **Interactive popups** with historical data

---

## 📈 Impact Potential

By automating the analysis of the 400,000+ image archive, **EcoLens** reduces the "data-to-decision" timeframe from **months to minutes**. This allows Louisiana to:

- **Prioritize restoration** based on real-time habitat health
- **Allocate limited funds** to highest-impact areas
- **Track progress** with year-over-year comparisons
- **Predict future trends** for proactive planning
- **Engage citizens** in conservation through annotation

---

## 🚀 Quick Start

### **Prerequisites:**
- Node.js 18.0+
- npm 9.0+
- Python 3.11+ (for API)

### **Installation:**

```bash
# Clone repository
git clone https://github.com/your-repo/ecolens-louisiana.git
cd ecolens-louisiana

# Install frontend dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### **Backend Setup (Optional):**

```bash
# Navigate to API directory
cd api

# Install Python dependencies
pip install -r requirements.txt

# Run Flask server
python detect.py
```

### **Build for Production:**

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

---

## 🛠️ Technology Stack

### **Frontend:**
- React 18.2 + Vite 5.0
- Tailwind CSS 3.3 (Glassmorphism design)
- Leaflet.js 1.9 + React-Leaflet 4.2
- Recharts 2.10 (data visualization)
- Lucide React (icons)

### **Backend:**
- Python 3.11 + Flask
- Vercel Serverless Functions
- Flask-CORS

### **Data:**
- 190 colonies (la_colonies_summary.json)
- 236,890 observations (louisiana_avian_master.json)
- 45+ species tracked
- 2010-2021 historical data

---

## 📊 Key Metrics

- **⚡ Load Time:** <2 seconds
- **🗺️ Map Rendering:** <500ms for 190 markers
- **📊 Chart Rendering:** <300ms per chart
- **🖼️ Image Processing:** <2 seconds for AI detection
- **💾 Bundle Size:** ~500KB (gzipped)
- **📱 Mobile:** Optimized for all devices

---

## 🎯 Use Cases

### **For Resource Managers (CPRA):**
- Prioritize restoration sites
- Allocate funding data-driven
- Track restoration effectiveness
- Generate professional reports

### **For Scientists:**
- Automate manual "dotting"
- Validate AI detections
- Analyze population trends
- Export data for research

### **For the Public:**
- Environmental awareness
- Citizen science participation
- Educational resources
- Conservation advocacy

---

## 🙏 Acknowledgments

- **Water Institute of the Gulf:** For providing comprehensive 2010–2021 Avian Monitoring data
- **Nexus Louisiana:** For hosting the DevDay ClimateTech Challenge
- **FUEL & Baker Hughes:** For sponsoring the competition
- **Louisiana CPRA:** For coastal restoration guidance
- **OpenStreetMap Contributors:** For mapping data

---

## 📞 Contact & Support

- **Documentation:** See SYSTEM_IMPLEMENTATION.md and TECHSTACK.md
- **Issues:** GitHub Issues
- **Demo:** [Live Demo](https://ecolens-louisiana.vercel.app)

---

## 🔮 Future Roadmap

### **Phase 1 (Current — Delivered):**
- ✅ Interactive map with 190 colonies + biodiversity color coding
- ✅ AI detection simulation with bounding boxes + geo-referencing
- ✅ Citizen science annotation tool (canvas draw, correction API)
- ✅ Timeline 2010-2026 (actual → interpolated → AI predicted)
- ✅ Professional CPRA reporting (PDF + CSV)
- ✅ Year-specific priority restoration with decline detection
- ✅ Hurricane Impact Predictor (10 storms, 190 colonies, <300ms)
- ✅ Storm track visualization with 20/50/100/150 km buffer rings
- ✅ Colony Profile panel — per-colony deep dive
- ✅ Species Intelligence — cross-colony species analytics
- ✅ Restoration Budget Planner — ROI-based fund allocation
- ✅ Habitat Loss Layer — USGS data for 7 coastal basins, 2010-2030
- ✅ User Workflow Guide — 3 persona tabs (biologist, planner, policy)
- ✅ Fully mobile responsive — bottom sheet, horizontal tab bar, iOS safe

### **Phase 2 (Planned):**
- 🔄 Real YOLOv11 model training
- 🔄 Mobile app (iOS/Android)
- 🔄 Real-time data integration
- 🔄 Automated email alerts
- 🔄 CPRA database integration

### **Phase 3 (Vision):**
- 🌟 Gulf Coast expansion
- 🌟 Drone integration
- 🌟 Blockchain verification
- 🌟 Public API for researchers
- 🌟 ML model marketplace

---

**Built with ❤️ for Louisiana's coastal future**  
*EcoLens Louisiana © 2026*
