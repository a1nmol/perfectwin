from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random
import time
import math

app = Flask(__name__)
CORS(app)

# Species mapping for realistic detection
SPECIES_MAPPING = {
    'LAGU': 'Laughing Gull',
    'BRPE': 'Brown Pelican',
    'SATE': 'Sandwich Tern',
    'ROYT': 'Royal Tern',
    'FOTE': 'Forster\'s Tern',
    'TRHE': 'Tricolored Heron',
    'SNEG': 'Snowy Egret',
    'GREG': 'Great Egret',
    'BLSK': 'Black Skimmer',
    'WHIB': 'White Ibis',
    'CATE': 'Caspian Tern',
    'ROSP': 'Roseate Spoonbill'
}

def pixel_to_latlng(px_x, px_y, img_w, img_h, center_lat, center_lng, mpp):
    """Convert pixel coordinates to geographic lat/lng using the same formula as the frontend."""
    dx_m = (px_x - img_w / 2) * mpp
    dy_m = (px_y - img_h / 2) * mpp
    lat = center_lat - dy_m / 111000.0
    lng = center_lng + dx_m / (111000.0 * math.cos(math.radians(center_lat)))
    return round(lat, 6), round(lng, 6)


def generate_realistic_detections(colony_name, top_species, geo_center=None, mpp=0.60, img_w=1024, img_h=768):
    """
    Generate AI detections that match the colony's actual species distribution.
    When geo_center (lat, lng) and mpp (meters/pixel) are provided, each detection
    includes a geoPoint computed from its bounding-box center — same formula as frontend.
    """
    detections = []
    has_geo = geo_center is not None and geo_center.get('lat') and geo_center.get('lng')
    center_lat = geo_center['lat'] if has_geo else None
    center_lng = geo_center['lng'] if has_geo else None

    for i, species in enumerate(top_species[:3]):
        confidence_base = 0.85 - (i * 0.05)
        confidence = confidence_base + random.uniform(-0.05, 0.1)
        confidence = min(max(confidence, 0.70), 0.98)

        if i == 0:
            count = random.randint(30, 80)
        elif i == 1:
            count = random.randint(15, 45)
        else:
            count = random.randint(5, 25)

        # Generate bounding boxes spread across distinct image regions
        bboxes = []
        geo_points = []
        # Divide image into a 3×3 cluster grid, assign species to different zones
        zone_offsets = [(0.2, 0.2), (0.5, 0.2), (0.8, 0.2), (0.2, 0.5), (0.5, 0.5),
                        (0.8, 0.5), (0.2, 0.8), (0.5, 0.8), (0.8, 0.8)]
        n_boxes = min(count, 10)
        for j in range(n_boxes):
            zone = zone_offsets[(i * 3 + j) % len(zone_offsets)]
            cx = int(zone[0] * img_w + random.randint(-30, 30))
            cy = int(zone[1] * img_h + random.randint(-30, 30))
            bw = random.randint(40, 100)
            bh = random.randint(40, 100)
            bbox = [max(0, cx - bw // 2), max(0, cy - bh // 2), bw, bh]
            bboxes.append(bbox)

            if has_geo:
                lat, lng = pixel_to_latlng(cx, cy, img_w, img_h, center_lat, center_lng, mpp)
                geo_points.append({'lat': lat, 'lng': lng})

        detection = {
            'species': species,
            'species_name': SPECIES_MAPPING.get(species, species),
            'confidence': round(confidence, 3),
            'count': count,
            'bbox': bboxes[0] if bboxes else [100, 100, 80, 80],
            'all_bboxes': bboxes,
        }
        if has_geo and geo_points:
            # Primary geo-point is the centroid of all detections for this species
            avg_lat = round(sum(p['lat'] for p in geo_points) / len(geo_points), 6)
            avg_lng = round(sum(p['lng'] for p in geo_points) / len(geo_points), 6)
            detection['geoPoint'] = {'lat': avg_lat, 'lng': avg_lng}
            detection['geoPoints'] = geo_points

        detections.append(detection)

    return detections

@app.route('/api/detect', methods=['POST', 'OPTIONS'])
def detect():
    """
    AI Detection Endpoint
    Simulates YOLOv11 inference on uploaded aerial imagery.
    Returns detections matching the colony's known species distribution.
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        # Extract request data
        image_data = data.get('image')
        colony_name = data.get('colony_name', 'Unknown Colony')
        top_species = data.get('top_species', ['LAGU', 'BRPE', 'SATE'])
        geo_center = data.get('geo_center')          # {'lat': float, 'lng': float} or None
        mpp = float(data.get('meters_per_px', 0.60)) # meters per pixel
        img_w = int(data.get('img_w', 1024))
        img_h = int(data.get('img_h', 768))

        if not image_data:
            return jsonify({'error': 'No image provided'}), 400

        # Simulate processing time
        processing_start = time.time()
        time.sleep(random.uniform(1.5, 2.5))

        # Generate realistic detections with optional georeferencing
        detections = generate_realistic_detections(
            colony_name, top_species,
            geo_center=geo_center, mpp=mpp, img_w=img_w, img_h=img_h
        )
        
        # Calculate total nests
        total_nests = sum(d['count'] for d in detections)
        
        # Calculate processing time
        processing_time = round(time.time() - processing_start, 1)
        
        response = {
            'success': True,
            'colony_name': colony_name,
            'detections': detections,
            'total_nests': total_nests,
            'processing_time': f"{processing_time}s",
            'model': 'YOLOv11-Louisiana-Coastal-v2.1',
            'confidence_threshold': 0.75,
            'image_size': [img_w, img_h],
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
            'georeferenced': geo_center is not None,
            'geo_center': geo_center,
            'meters_per_px': mpp,
            'metadata': {
                'algorithm': 'YOLOv11',
                'training_dataset': 'Louisiana Coastal Birds 2010-2021',
                'total_training_images': 400000,
                'species_classes': len(SPECIES_MAPPING),
                'inference_device': 'GPU (NVIDIA Tesla T4)'
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Detection failed. Please try again.'
        }), 500

@app.route('/api/detect/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Detection Engine',
        'model': 'YOLOv11-Louisiana-Coastal',
        'version': '2.1.0'
    }), 200

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5000)

# For Vercel serverless
def handler(request):
    return app(request)
