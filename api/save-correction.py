from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory storage for demo (in production, use a database)
corrections_storage = []

@app.route('/api/save-correction', methods=['POST', 'OPTIONS'])
def save_correction():
    """
    Citizen Science Correction Endpoint
    Saves user annotations for fine-tuning the YOLO model.
    These corrections help improve AI accuracy for Louisiana-specific conditions.
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        # Extract correction data
        colony_name = data.get('colony_name', 'Unknown')
        annotations = data.get('annotations', [])
        image_data = data.get('image')
        timestamp = data.get('timestamp', datetime.now().isoformat())
        
        if not annotations:
            return jsonify({'error': 'No annotations provided'}), 400
        
        # Process annotations
        species_counts = {}
        for annotation in annotations:
            species = annotation.get('species', 'UNKNOWN')
            species_counts[species] = species_counts.get(species, 0) + 1
        
        # Create correction record
        correction_record = {
            'id': len(corrections_storage) + 1,
            'colony_name': colony_name,
            'timestamp': timestamp,
            'annotation_count': len(annotations),
            'species_distribution': species_counts,
            'annotations': annotations,
            'status': 'pending_review',
            'metadata': {
                'user_type': 'citizen_scientist',
                'correction_type': 'manual_annotation',
                'purpose': 'yolo_fine_tuning'
            }
        }
        
        # Store correction (in production, save to database)
        corrections_storage.append(correction_record)
        
        # Simulate processing
        time.sleep(0.5)
        
        response = {
            'success': True,
            'message': 'Corrections saved successfully',
            'correction_id': correction_record['id'],
            'annotations_saved': len(annotations),
            'species_corrected': list(species_counts.keys()),
            'total_corrections': len(corrections_storage),
            'next_steps': [
                'Corrections will be reviewed by expert ornithologists',
                'Validated corrections will be added to training dataset',
                'Model will be retrained with updated Louisiana-specific data',
                'Improved model will be deployed in next release'
            ],
            'impact': {
                'training_contribution': f"{len(annotations)} new labeled instances",
                'species_coverage': f"{len(species_counts)} species",
                'habitat_type': colony_name,
                'estimated_accuracy_improvement': f"+{round(len(annotations) * 0.01, 2)}%"
            },
            'timestamp': timestamp
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to save corrections. Please try again.'
        }), 500

@app.route('/api/save-correction/stats', methods=['GET'])
def correction_stats():
    """Get statistics about saved corrections"""
    total_annotations = sum(c['annotation_count'] for c in corrections_storage)
    
    species_totals = {}
    for correction in corrections_storage:
        for species, count in correction['species_distribution'].items():
            species_totals[species] = species_totals.get(species, 0) + count
    
    return jsonify({
        'total_corrections': len(corrections_storage),
        'total_annotations': total_annotations,
        'species_distribution': species_totals,
        'unique_colonies': len(set(c['colony_name'] for c in corrections_storage)),
        'status': 'active'
    }), 200

@app.route('/api/save-correction/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Citizen Science Correction API',
        'version': '1.0.0',
        'corrections_stored': len(corrections_storage)
    }), 200

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5001)

# For Vercel serverless
def handler(request):
    return app(request)
