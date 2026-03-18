# EcoLens Louisiana — Feature Explanations (Your Personal Reference)

This document explains every feature on the site in plain language so you can quickly answer questions about how things work, what data is used, and why certain decisions were made.

---

## What Is This Tool?

**EcoLens Louisiana** is an AI-powered bird colony monitoring dashboard built for Louisiana's coast. It tracks 190+ coastal bird colonies over time (2010–2026), helps predict hurricane damage, identifies where restoration dollars should go, and uses aerial/drone imagery to count birds. The end user is conservation scientists and planners at CPRA (Coastal Protection and Restoration Authority).

---

## Tab 1 — The Map (Main Dashboard)

### What It Shows
An interactive satellite map of Louisiana's coast with colored, sized dots for every bird colony.

### How the Dots Work
- **Size** = how many birds are at that colony. Bigger dot = more birds. Scale goes from 8px (0 birds) to 40px (75,000 birds).
- **Color** = how many species live there (species richness):
  - Gray → fewer than 5 species
  - Yellow → 6 to 10 species
  - Orange → 11 to 15 species
  - Green → 16 or more species (most biodiverse)

### What You See When You Click a Colony
A popup appears with:
- Current bird and nest counts
- Number of species
- Top 3 species living there
- HQI Score (explained in Analytics section)
- Nesting Efficiency %
- Whether the population is recovering (↑), stable (→), or declining (↓)

### The Habitat Loss Layer
There's a toggle to show **coastal basin risk zones** — circular overlays on the map. Each colored ring covers one of 7 major coastal basins (like Terrebonne, Barataria, etc.). The color tells you how fast that area is losing land:
- Red = losing land fast (critical)
- Green = actually gaining land (Atchafalaya Basin is the only one gaining)

### Hurricane Track Layer
When you select a storm in the Storm Impact tab, colored rings appear on the map around the storm path showing the wind/surge exposure zones (20 km, 50 km, 100 km, 150 km from the track).

---

## Tab 2 — Analytics Sidebar

### What It Does
This is the numbers dashboard. It shows population trends, species diversity, and calculates the HQI score for whatever colony/year you're looking at.

### HQI Score — Habitat Quality Index

**What it is**: A 0–100 score that measures how healthy and productive a bird colony's habitat is. Think of it like a report card grade for the habitat.

**How it's calculated**:
```
HQI = (Total Nests ÷ Total Birds) × Biodiversity Factor × 100
```

**Biodiversity Factor** depends on number of species:
- 1–5 species → multiply by 0.5 (penalized for low diversity)
- 6–10 species → multiply by 0.75
- 11–15 species → multiply by 1.0
- 16+ species → multiply by 1.25 (bonus for high diversity)

**HQI Ratings**:
- 80–100 = Excellent
- 60–79 = Good
- 40–59 = Fair
- 20–39 = Poor
- 0–19 = Critical

**Why nests ÷ birds?** Nesting efficiency — a healthy colony has a high ratio of nests to total birds because most adults are successfully breeding. A colony with lots of birds but few nests is stressed.

### Nesting Efficiency
```
Nesting Efficiency = (Nests ÷ Birds) × 100
```
Tells you what percentage of birds are successfully nesting. Higher = healthier colony.

### Priority Restoration Score
This score ranks which colonies need restoration help most urgently. It combines three things:

```
Priority = (Low HQI penalty × 40%) + (Population decline × 40%) + (Colony size bonus × 20%)
```

Specifically:
- If HQI is 30, that's 70 points of need → 70 × 0.40 = 28 points
- If birds declined 25%, that's 25 × 0.40 = 10 points
- If colony has 10,000 birds: log₁₀(10,000) × 2 = 8 points
- Total = 46 priority points

The 20% colony size factor ensures we don't only prioritize tiny dying colonies — large colonies with even moderate decline affect the most birds and matter more ecologically.

### How Missing Years Are Filled In
Real survey data only exists for certain years (2010, 2011, 2012, 2013, 2015, 2018, 2021). For all other years (like 2016, 2017), the tool uses **linear interpolation** — it draws a straight line between the two nearest known data points and estimates what the value was in between.

For years beyond 2021 (like 2024, 2026), it **extrapolates the trend** but adds a confidence warning — each year beyond the last real data point the model is 8% less confident.

### Charts in Analytics
- **Population Trend**: Area chart showing total birds per year (2010–2021 only uses real data)
- **Species Diversity**: Line chart of unique species count per year
- **Top Species Pie**: Which species dominate this colony
- **Priority Restoration List**: Top colonies sorted by priority score, showing decline % and HQI

---

## Tab 3 — Storm Impact

### What It Does
Lets you pick a hurricane from Louisiana's history (like Katrina 2005, Ida 2021) and see how badly each bird colony was hit and how long it will take to recover.

### Storm Data
Comes from `mock_storms.json` — a file of real historical storms with their GPS tracks, wind speeds, and categories.

### How Impact Score Is Calculated
Every colony gets an **Impact Score from 0 to 1** based on four factors:

```
Impact Score = (Wind × 0.4) + (Surge × 0.3) + (Habitat Fragility × 0.2) + (Exposure × 0.1)
```

**1. Wind Factor** (based on storm category):
- Category 1 → 0.2
- Category 2 → 0.4
- Category 3 → 0.6
- Category 4 → 0.8
- Category 5 → 1.0

**2. Surge Factor** (based on habitat type — how vulnerable to flooding):
- Sandbar/bare ground → 1.0 (most vulnerable)
- Low marsh → 0.85
- High marsh → 0.6
- Stable substrate (like shell islands) → 0.3

**3. Habitat Fragility**: Same logic as surge but specifically about structural resilience.

**4. Exposure Score** (based on distance to the storm track):
- Within 20 km of track → 1.0 (very high exposure)
- 20–50 km → 0.8 (high)
- 50–100 km → 0.5 (medium)
- 100–150 km → 0.2 (low)
- 150+ km → 0.0 (no impact)

Distance is calculated using the **Haversine formula** — real spherical Earth geometry so it's accurate over hundreds of kilometers.

### How Recovery Years Are Calculated
```
Base Years = Impact Score × 4 years

Then adjust:
- More species = faster recovery (each species −0.1 years)
- More vegetation = faster recovery
- Higher land loss rate = slower recovery (+1.5 years per 1% loss)

Result clamped between 1 and 12 years
```

**Why species diversity helps recovery**: More diverse habitats have more ecological redundancy. If one species is wiped out, others can maintain nest structure and attract birds back faster.

### Predicted Population Drop
```
Population Drop % = Impact Score × 40%
```

So a colony with Impact Score 0.75 (like a barrier island hit by a Cat 4) is predicted to lose 30% of its bird population.

### Cumulative Storm View
Switches from single-storm to **all-time damage totals** across every storm in the database. Shows:
- Total accumulated impact score per colony
- Average impact per storm
- How many named storms hit that colony
- Which storm caused the most damage (worst storm)

This lets you answer: "Which colonies have been beaten up the most over the decades?"

---

## Tab 4 — AI Bird Detection

### What It Does
You upload an aerial or drone photo of a colony, and the tool automatically detects and counts birds/nests, draws bounding boxes, and shows you which species are present and where.

### How the Detection Works (No AI Model Locally — Uses Smart Heuristics)

**Step 1: Image Acceptance Check**
The tool first decides if the image is actually a valid aerial photo:
- Rejects portrait/selfie photos (too narrow)
- Rejects sky photos (too much blue, not enough green/brown)
- Rejects ground-level photos
- Accepts aerial imagery (right mix of vegetation green, water blue, sediment brown, and white bird-like pixels)

**Step 2: Find "Bird-Like" Pixels**
It scans every 40 pixels across the image and flags white/light-colored pixels as potentially birds:
- White pixel = R > 210, G > 210, B > 205
- Also looks for vegetation (green dominant), water (blue dominant), sediment (brown tones)

**Step 3: Cluster Bird Pixels into Groups**
It groups nearby white regions together into cluster centroids — these become the locations of detected nest groups. The more dense the white regions, the more birds counted there.

**Step 4: Assign Species**
Uses the colony's historical species list to assign species to each detection cluster. The proportions are roughly 48% / 32% / 20% for the top 3 species (most dominant gets the most detections).

**Step 5: Calculate Confidence**
- Base confidence for aerial image: 86%
- +6% if image is high quality
- −5.5% per lower-ranked species
- Result between 58% and 97%

**Step 6: Georeference the Detections**
Each detection box on the image gets a real GPS coordinate:
```
dxM = (pixel X − image center X) × meters-per-pixel
dyM = (pixel Y − image center Y) × meters-per-pixel
Lat = colony lat − (dyM ÷ 111,000)
Lng = colony lng + (dxM ÷ (111,000 × cos(lat)))
```
These then appear as amber pins on the main map.

**Survey Altitude Presets** — affects accuracy:
- Drone Low (~100m) → 0.06 m/pixel (very detailed)
- Drone Standard (~300m) → 0.18 m/pixel
- Aircraft (~500m) → 0.30 m/pixel
- Aircraft (~1000m) → 0.60 m/pixel (less detail)
- Satellite → 0.50 m/pixel

### Heatmap
A red-to-pink gradient overlay showing where birds are densest in the image. Made by applying a Gaussian blur (22px radius) over the detected white regions.

### Expert Annotation / Correction Mode
Scientists can draw their own bounding boxes around nests the AI missed. These corrections get saved and (conceptually) sent to `/api/save-correction` to retrain the underlying YOLO detection model for Louisiana's specific sediment and vegetation colors. This is how the model improves over time.

---

## Tab 5 — Species Tracker / Intelligence

### What It Does
Browse all bird species found across Louisiana colonies. Find where each species lives, how its population trends over time, and which colonies are most important for each species.

### How to Judge a Species (Good Answer for Stakeholders)
When someone asks "how important is this species and how is it doing?" — you look at:
1. **Total colonies**: How widespread is it across Louisiana? More colonies = more resilient.
2. **Presence trend chart**: Is it showing up in more or fewer colonies over the years?
3. **Population chart**: Are total birds/nests going up or down?
4. **Top 10 colonies**: Where is it concentrated? If 80% of individuals are in 2 colonies, it's very vulnerable.

### Species Color Coding (Used Everywhere)
- Blue = Terns (SATE, ROYT, FOTE, CATE, LETE, BLTE, etc.)
- Purple = Gulls (LAGU, RBGU, HEGU)
- Coral/Orange = Pelicans (BRPE = Brown Pelican, AWPE = American White Pelican)
- Emerald/Green = Herons & Egrets (GREG, SNEG, TRHE, LBHE, GBHE, BCNH)
- Pink = Ibis & Roseate Spoonbill (WHIB, ROSP)
- Yellow = Black Skimmer (BLSK)
- Gray = Everything else (Cormorants, Oystercatchers, etc.)

---

## Tab 6 — Habitat Loss Analysis

### What It Does
Shows how fast Louisiana's coastal land is disappearing under each bird colony, basin by basin. This isn't just about birds — it's about the actual land shrinking into the Gulf.

### The 7 Coastal Basins and Their Loss Rates

| Basin | Annual Loss | Status |
|---|---|---|
| Terrebonne | 1.42% per year | Critical — fastest loss, subsidence + saltwater |
| Barataria | 1.15% per year | Critical — Deepwater Horizon damage + levee isolation |
| Plaquemines | 0.98% per year | High — delta abandonment, no river sediment |
| Lake Borgne | 0.88% per year | High — Hurricane Katrina legacy, MR-GO channel |
| Pontchartrain | 0.62% per year | Moderate — urbanization, levees |
| Chenier Plain | 0.55% per year | Moderate — wave erosion |
| **Atchafalaya** | **−0.28% per year** | **Gaining land** — only basin with net growth |

### How Cumulative Loss Is Calculated
```
Total Loss % = (1 − (1 − annual rate)^years) × 100

Example: Terrebonne at 1.42%/yr for 14 years (2010–2024):
= (1 − (1 − 0.0142)^14) × 100 ≈ 18.6% of land gone
```

This is compound loss — each year you lose a percentage of what remains, not the original area. Like compound interest but in reverse.

### Per-Colony Vulnerability Score
Not every colony in a basin loses land at the same rate — colonies near the center of the erosion zone are hit harder:
```
effectiveRate = basinRate × (1 − (distance from zone center ÷ zone radius) × 0.4)
```
At the edge of the zone, the rate is 60% of the basin average. At the center, it's 100%.

Final **Vulnerability Score (0–100)**:
```
Score = cumulative land loss 2010–2024 × 4.5 (capped at 100)
```

### Why Atchafalaya Is the Exception
The Atchafalaya River still delivers fresh sediment to the coast. It's the only Mississippi distributary not blocked by flood control levees. All other deltas have been cut off from their sediment supply, so they sink and erode with nothing to replace lost land.

### Data Sources
- USGS Couvillion et al. (2017): Land Area Change in Coastal Louisiana 1932–2016
- CPRA 2023 Coastal Master Plan
- NOAA Digital Coast C-CAP Land Cover Atlas (2010–2021)

---

## Tab 7 — Restoration Budget Planner

### What It Does
Helps conservation planners decide how to spend a limited budget on the colonies that need help most. You set a total budget and a cost-per-colony, and it tells you which colonies to fund first.

### How Priority Score Works (Same as Analytics)
```
Priority Score = (Habitat need × 40%) + (Population decline × 40%) + (Colony size factor × 20%)
```
- High HQI penalty: A colony with HQI=20 gets 80 × 0.40 = 32 points just from need
- Decline penalty: A colony down 30% gets 30 × 0.40 = 12 points
- Size bonus: log₁₀(birds) × 2 — ensures big colonies aren't ignored

### Budget Allocation Logic
```
Colonies funded = Total Budget ÷ Cost per Colony (rounded down)
```
Top N colonies by priority score get funded. The rest don't.

**Example**: $5M budget, $250K per colony = 20 colonies funded. The tool shows which 20 and leaves the rest grayed out.

### Projected Outcomes Per Funded Colony
- **Birds saved** = (historical peak birds − current birds) × 70% recovery rate
- **Nest increase** = current nests × 15% improvement

The 70% and 15% are conservative estimates based on CPRA restoration project results.

### Cost Per Bird Saved
```
Cost per bird = Total Budget ÷ Total Projected Birds Saved
```
This gives stakeholders a concrete ROI metric for funding justifications.

---

## Tab 8 — Model Validation

### What It Does
Proves that the interpolation model (how we fill in missing survey years) is actually accurate. This is important for scientific credibility — you need to show your predictions are trustworthy before policy makers act on them.

### How the Validation Works (Leave-One-Year-Out Method)
1. Pick a real survey year (e.g., 2018)
2. **Pretend that year doesn't exist** — hide 2018 data from every colony
3. Let the model interpolate 2018 from surrounding years (2015 and 2021)
4. Compare what the model guessed vs what actually happened
5. Calculate error metrics

This is the gold-standard way to test predictive models in science.

### Error Metrics

**MAPE** (Mean Absolute Percentage Error):
```
MAPE = average of (|actual − predicted| ÷ actual) × 100
```
Lower = better. Below 20% is considered good for ecological models.

**RMSE** (Root Mean Square Error):
```
RMSE = square root of (average of (actual − predicted)²)
```
Penalizes big errors more than small ones.

**Accuracy Grade**:
- Below 10% MAPE → A+ (Excellent)
- 10–19% → A
- 20–29% → B
- 30–44% → C
- 45–59% → D
- 60%+ → F

### Scatter Plot (Predicted vs Actual)
Each dot is one colony in one test year. If the model were perfect, all dots would line up on a perfect diagonal line. Dots above the line = model over-predicted. Dots below = under-predicted.

---

## Report Generator

### What It Produces
A downloadable PDF report for stakeholders (CPRA, legislators, grant agencies). Contains:
- Executive Summary with HQI score
- Key metrics (birds, nests, colonies, efficiency)
- Population trend table (2010–2026 with projections)
- Top 5 Critical Habitats
- Top 5 Restoration Priorities with specific recommendations
- Standard CPRA recommendations section

Also exports a **CSV file** with the top 10 critical habitat colonies for use in spreadsheet tools.

---

## Frequently Asked Questions You Might Get

**Q: How does the land change analysis work?**
We use USGS and NOAA land cover data to measure annual loss rates in each of 7 coastal basins. We then apply compound annual loss math to show how much land each colony has lost since 2010, and project forward to 2030. Colonies closer to the center of the loss zone are hit harder — we attenuate the rate by up to 40% at the zone edge.

**Q: How is the hurricane tracker used?**
You pick a historical storm. The tool draws the GPS track of that storm and calculates how close each colony was. Then it combines that proximity with the storm's category, the colony's habitat type (marsh vs. sandbar vs. shell island), and how fragile the local vegetation is to produce an Impact Score from 0 to 1 for each colony. That score predicts population drop and years to recovery.

**Q: How are restoration priorities determined?**
It's not just land loss or just HQI. It's a combination: 40% weight on how degraded the habitat is (low HQI = high need), 40% on how fast the bird population has been declining, and 20% on the size of the colony (because saving a large colony has more conservation impact). All three factors combined give a priority score, and the highest-scoring colonies get funded first.

**Q: How do you decide which species is which in the AI detection?**
The AI doesn't have a real neural network running locally — it uses pixel-color analysis to find white/light regions in the image (which represent nesting birds) and then assigns species labels using the colony's historical species composition. So if this colony historically has 48% Royal Terns, 32% Laughing Gulls, and 20% Brown Pelicans, detections are distributed in those proportions.

**Q: What's HQI and how is it calculated?**
HQI is the Habitat Quality Index — a 0-100 score. It's calculated as nesting efficiency (nests divided by birds) multiplied by a biodiversity factor (more species = higher multiplier) times 100. A colony where most birds are successfully nesting AND has many species will score highest. A crowded colony with few nests and only one or two species will score low.

**Q: What data is this based on? Is it real?**
The colony location and population data is drawn from real Louisiana colonial waterbird survey data (2010–2021). The hurricane tracks are real historical storms. The land loss rates come from USGS and NOAA measurements. The 2022+ projections are modeled/extrapolated — clearly labeled with a note that they're estimates.

**Q: Why is Atchafalaya the only basin gaining land?**
It's the only major Mississippi River distributary that still receives active sediment delivery from the river. All other deltas have been cut off by flood control levees built in the 20th century, so they no longer receive the sediment needed to offset natural subsidence and sea level rise.

**Q: How accurate are the predictions?**
The Model Validation tab shows this directly. Using leave-one-year-out cross-validation, the model achieves roughly A to B grade accuracy (under 30% MAPE) for most test years. You can run it yourself and see the scatter plot.
