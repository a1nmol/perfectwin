"""
Storm Impact API
Flask endpoint for hurricane impact calculations
Run with: python api/storm_impact.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import math
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration constants
EXPOSURE_DISTANCE_KM = {
    'veryHigh': 20,
    'high': 50,
    'medium': 100,
    'low': 150
}

WEIGHTS = {
    'wind': 0.4,
    'surge': 0.3,
    'fragility': 0.2,
    'exposure': 0.1
}

SAFFIR_SIMPSON = {
    1: {'min': 64, 'max': 82, 'factor': 0.2},
    2: {'min': 83, 'max': 95, 'factor': 0.4},
    3: {'min': 96, 'max': 112, 'factor': 0.6},
    4: {'min': 113, 'max': 136, 'factor': 0.8},
    5: {'min': 137, 'max': float('inf'), 'factor': 1.0}
}

SURGE_FACTORS = {
    'Low marsh': 1.0,
    'Sandbar': 1.0,
    'Barrier island': 0.7,
    'Interior wetland': 0.3,
    'Vegetated island': 0.5,
    'Stable substrate': 0.3,
    'Unknown': 0.7
}

HABITAT_FRAGILITY = {
    'Sandbar': 1.0,
    'Low marsh': 0.8,
    'Barrier island': 0.7,
    'Vegetated island': 0.6,
    'Interior wetland': 0.4,
    'Stable substrate': 0.3,
    'Unknown': 0.6
}

RECOVERY_CONFIG = {
    'impactMultiplier': 4,
    'speciesCoeff': 0.1,
    'vegCoeff': 0.05,
    'landLossCoeff': 1.5,
    'minYears': 1,
    'maxYears': 12
}

DEFAULTS = {
    'speciesRichness': 8,
    'vegetationDensity': 0.30,
    'landLossRate': 0.05,
    'habitatType': 'Unknown'
}

DROP_SCALE = 0.4


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculate haversine distance between two points"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def min_distance_to_track(point, track):
    """Calculate minimum distance from point to storm track"""
    if not track or len(track) == 0:
        return float('inf')
    
    if len(track) == 1:
        return haversine_distance_km(
            point['lat'], point['lon'],
            track[0]['lat'], track[0]['lon']
        )
    
    min_dist = float('inf')
    
    for i in range(len(track) - 1):
        # Distance to segment endpoints
        dist_start = haversine_distance_km(
            point['lat'], point['lon'],
            track[i]['lat'], track[i]['lon']
        )
        dist_end = haversine_distance_km(
            point['lat'], point['lon'],
            track[i + 1]['lat'], track[i + 1]['lon']
        )
        
        min_dist = min(min_dist, dist_start, dist_end)
    
    return min_dist


def classify_exposure_score(min_distance_km):
    """Classify exposure score based on distance"""
    if min_distance_km < EXPOSURE_DISTANCE_KM['veryHigh']:
        return 1.0
    elif min_distance_km < EXPOSURE_DISTANCE_KM['high']:
        return 0.8
    elif min_distance_km < EXPOSURE_DISTANCE_KM['medium']:
        return 0.5
    elif min_distance_km < EXPOSURE_DISTANCE_KM['low']:
        return 0.2
    else:
        return 0.0


def category_from_wind_kt(wind_kt):
    """Derive Saffir-Simpson category from wind speed"""
    for cat in [5, 4, 3, 2, 1]:
        if wind_kt >= SAFFIR_SIMPSON[cat]['min']:
            return cat
    return 0


def wind_factor_from_category(category):
    """Get wind factor from category"""
    if category in SAFFIR_SIMPSON:
        return SAFFIR_SIMPSON[category]['factor']
    return 0.0


def surge_factor_from_habitat(habitat_type):
    """Get surge factor from habitat type"""
    if not habitat_type:
        return SURGE_FACTORS['Unknown']
    
    if habitat_type in SURGE_FACTORS:
        return SURGE_FACTORS[habitat_type]
    
    # Try partial match
    habitat_lower = habitat_type.lower()
    for key, value in SURGE_FACTORS.items():
        if key.lower() in habitat_lower or habitat_lower in key.lower():
            return value
    
    return SURGE_FACTORS['Unknown']


def habitat_fragility(habitat_type):
    """Get habitat fragility score"""
    if not habitat_type:
        return HABITAT_FRAGILITY['Unknown']
    
    if habitat_type in HABITAT_FRAGILITY:
        return HABITAT_FRAGILITY[habitat_type]
    
    # Try partial match
    habitat_lower = habitat_type.lower()
    for key, value in HABITAT_FRAGILITY.items():
        if key.lower() in habitat_lower or habitat_lower in key.lower():
            return value
    
    return HABITAT_FRAGILITY['Unknown']


def calculate_impact_score(category, exposure_score, habitat_type):
    """Calculate impact score"""
    wind_factor = wind_factor_from_category(category)
    surge_factor = surge_factor_from_habitat(habitat_type)
    fragility = habitat_fragility(habitat_type)
    
    score = (
        wind_factor * WEIGHTS['wind'] +
        surge_factor * WEIGHTS['surge'] +
        fragility * WEIGHTS['fragility'] +
        exposure_score * WEIGHTS['exposure']
    )
    
    return max(0.0, min(1.0, score))


def calculate_recovery_years(impact_score, species_richness, vegetation_density, land_loss_rate):
    """Calculate recovery years"""
    base_years = impact_score * RECOVERY_CONFIG['impactMultiplier']
    species_reduction = species_richness * RECOVERY_CONFIG['speciesCoeff']
    veg_reduction = vegetation_density * RECOVERY_CONFIG['vegCoeff']
    land_loss_increase = land_loss_rate * RECOVERY_CONFIG['landLossCoeff']
    
    years = base_years - species_reduction - veg_reduction + land_loss_increase
    
    return max(
        RECOVERY_CONFIG['minYears'],
        min(RECOVERY_CONFIG['maxYears'], round(years))
    )


def predicted_population_drop_pct(impact_score):
    """Calculate predicted population drop percentage"""
    return round(impact_score * DROP_SCALE * 100)


@app.route('/api/storm-impact', methods=['POST'])
def storm_impact():
    """
    Calculate hurricane impact for colonies
    
    Request JSON:
    {
        "stormId": "IDA-2021" | null,
        "customTrack": [...] | null,
        "year": 2021,
        "colonies": [...]
    }
    
    Response JSON:
    {
        "storm": {...},
        "results": [...],
        "summary": {...}
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        storm_id = data.get('stormId')
        custom_track = data.get('customTrack')
        year = data.get('year', 2021)
        colonies = data.get('colonies', [])
        
        if not colonies:
            return jsonify({'error': 'No colonies provided'}), 400
        
        # Load storm data
        storm_data = None
        track = None
        
        if storm_id:
            # Load from mock_storms.json
            storms_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'mock_storms.json')
            try:
                with open(storms_path, 'r') as f:
                    storms = json.load(f)
                    storm_data = next((s for s in storms if s['id'] == storm_id), None)
                    
                    if not storm_data:
                        return jsonify({'error': f'Storm {storm_id} not found'}), 404
                    
                    track = storm_data['track']
            except FileNotFoundError:
                return jsonify({'error': 'Storm data file not found'}), 500
        elif custom_track:
            track = custom_track
            # Derive category from max wind
            max_wind = max([pt.get('windKt', 0) for pt in track])
            category = category_from_wind_kt(max_wind)
            storm_data = {
                'id': 'CUSTOM',
                'name': 'Custom Storm',
                'year': year,
                'category': category,
                'maxWindKt': max_wind
            }
        else:
            return jsonify({'error': 'Either stormId or customTrack must be provided'}), 400
        
        # Calculate impacts for each colony
        results = []
        
        for colony in colonies:
            # Get colony attributes with defaults
            habitat_type = colony.get('habitatType', DEFAULTS['habitatType'])
            species_richness = colony.get('speciesRichness', colony.get('species_count', DEFAULTS['speciesRichness']))
            vegetation_density = colony.get('vegetationDensity', DEFAULTS['vegetationDensity'])
            land_loss_rate = colony.get('landLossRate', DEFAULTS['landLossRate'])
            
            # Calculate minimum distance to track
            point = {'lat': colony['lat'], 'lon': colony.get('lon', colony.get('lng'))}
            min_dist = min_distance_to_track(point, track)
            
            # Calculate exposure score
            exposure_score = classify_exposure_score(min_dist)
            
            # Calculate impact score
            category = storm_data['category']
            impact = calculate_impact_score(category, exposure_score, habitat_type)
            
            # Calculate recovery years
            recovery = calculate_recovery_years(
                impact, species_richness, vegetation_density, land_loss_rate
            )
            
            # Calculate population drop
            drop_pct = predicted_population_drop_pct(impact)
            
            results.append({
                'colonyId': colony.get('id', colony.get('name')),
                'colonyName': colony['name'],
                'exposureScore': round(exposure_score, 2),
                'impactScore': round(impact, 3),
                'predictedPopulationDropPct': drop_pct,
                'recoveryYears': recovery,
                'factors': {
                    'minDistanceKm': round(min_dist, 2),
                    'habitatType': habitat_type,
                    'speciesRichness': species_richness,
                    'vegetationDensity': round(vegetation_density, 2),
                    'landLossRate': round(land_loss_rate, 3)
                }
            })
        
        # Calculate summary statistics
        impact_scores = [r['impactScore'] for r in results]
        max_impact = max(impact_scores) if impact_scores else 0
        mean_impact = sum(impact_scores) / len(impact_scores) if impact_scores else 0
        
        # Top 5 impacted colonies
        top_colonies = sorted(results, key=lambda x: x['impactScore'], reverse=True)[:5]
        top_colonies_summary = [
            {'colonyId': c['colonyId'], 'impactScore': c['impactScore']}
            for c in top_colonies
        ]
        
        response = {
            'storm': {
                'id': storm_data['id'],
                'name': storm_data['name'],
                'year': storm_data['year'],
                'category': storm_data['category']
            },
            'results': results,
            'summary': {
                'count': len(results),
                'maxImpact': round(max_impact, 3),
                'meanImpact': round(mean_impact, 3),
                'topColonies': top_colonies_summary,
                'generatedAt': datetime.utcnow().isoformat() + 'Z'
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'service': 'storm-impact-api'}), 200


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌀 Storm Impact API Server")
    print("="*60)
    print("\n📍 Server starting on http://localhost:5000")
    print("\n📋 Available endpoints:")
    print("   GET  /api/health")
    print("   POST /api/storm-impact")
    print("\n🧪 Sample curl request:")
    print('   curl -X POST http://localhost:5000/api/storm-impact \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"stormId":"IDA-2021","year":2021,"colonies":[')
    print('       {"name":"Queen Bess Island","lat":29.3043,"lon":-89.9592,')
    print('        "habitatType":"Barrier island","speciesRichness":14}]}\'')
    print("\n" + "="*60 + "\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
