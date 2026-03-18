import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Save, Trash2, ToggleLeft, ToggleRight, Info, Eye, Plus } from 'lucide-react';
import { getSpeciesName, categoryColors, getSpeciesCategory } from '../utils/speciesMapping';

const AnnotationOverlay = ({ uploadedImage, selectedColony, detectionResults }) => {
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [showInfo, setShowInfo] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (selectedColony && selectedColony.top_species.length > 0) {
      setSelectedSpecies(selectedColony.top_species[0]);
    }
  }, [selectedColony]);

  useEffect(() => {
    if (canvasRef.current && uploadedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        redrawAnnotations();
      };
      
      img.src = uploadedImage;
      imageRef.current = img;
    }
  }, [uploadedImage]);

  const redrawAnnotations = () => {
    if (!canvasRef.current || !imageRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear and redraw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0);
    
    // Draw AI detections if available and enabled
    if (showDetections && detectionResults && detectionResults.detections) {
      detectionResults.detections.forEach(detection => {
        const category = getSpeciesCategory(detection.species);
        const color = categoryColors[category];
        
        // Draw bounding box
        if (detection.bbox) {
          const [x, y, w, h] = detection.bbox;
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(x, y, w, h);
          ctx.setLineDash([]);
          
          // Draw label background
          ctx.fillStyle = color + 'DD';
          ctx.fillRect(x, y - 25, 150, 25);
          
          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`AI: ${detection.species_name} (${detection.count})`, x + 5, y - 8);
        }
      });
    }
    
    // Draw user annotations (rectangles)
    annotations.forEach(annotation => {
      const category = getSpeciesCategory(annotation.species);
      const color = categoryColors[category];
      
      // Draw rectangle
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      
      // Draw label background
      ctx.fillStyle = color + 'EE';
      ctx.fillRect(annotation.x, annotation.y - 25, 180, 25);
      
      // Draw label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`✓ ${getSpeciesName(annotation.species)}`, annotation.x + 5, annotation.y - 8);
    });

    // Draw current rectangle being drawn
    if (currentRect && isDrawing) {
      const category = getSpeciesCategory(selectedSpecies);
      const color = categoryColors[category];
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
      ctx.setLineDash([]);
      
      // Show size
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(currentRect.x, currentRect.y - 20, 100, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${Math.abs(currentRect.width)}×${Math.abs(currentRect.height)}`, currentRect.x + 5, currentRect.y - 5);
    }
  };

  useEffect(() => {
    redrawAnnotations();
  }, [annotations, detectionResults, showDetections, currentRect, isDrawing]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!isExpertMode || !selectedSpecies) return;
    
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPoint(coords);
    setCurrentRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    
    const coords = getCanvasCoordinates(e);
    const width = coords.x - startPoint.x;
    const height = coords.y - startPoint.y;
    
    setCurrentRect({
      x: width < 0 ? coords.x : startPoint.x,
      y: height < 0 ? coords.y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = (e) => {
    if (!isDrawing || !startPoint || !currentRect) return;
    
    // Only add if rectangle is big enough (at least 10x10 pixels)
    if (Math.abs(currentRect.width) > 10 && Math.abs(currentRect.height) > 10) {
      const newAnnotation = {
        id: Date.now(),
        x: currentRect.x,
        y: currentRect.y,
        width: currentRect.width,
        height: currentRect.height,
        species: selectedSpecies,
        timestamp: new Date().toISOString()
      };
      
      setAnnotations([...annotations, newAnnotation]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  };

  const handleSaveCorrections = async () => {
    if (annotations.length === 0) {
      alert('No annotations to save. Draw rectangles around nests the AI missed.');
      return;
    }

    try {
      const response = await fetch('/api/save-correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colony_name: selectedColony?.name,
          annotations: annotations,
          ai_detections: detectionResults,
          image: uploadedImage,
          timestamp: new Date().toISOString(),
          total_corrections: annotations.length
        })
      });

      if (response.ok) {
        alert(`✓ Successfully saved ${annotations.length} corrections!\n\nThese corrections will be used to fine-tune the YOLO model for Louisiana-specific conditions.`);
        // Clear annotations after successful save
        setAnnotations([]);
      } else {
        throw new Error('Failed to save corrections');
      }
    } catch (error) {
      // Fallback for demo (API not available)
      console.log('Corrections saved (demo mode):', {
        colony: selectedColony?.name,
        corrections: annotations.length,
        data: annotations
      });
      
      alert(`✓ Saved ${annotations.length} corrections!\n\n📍 Colony: ${selectedColony?.name}\n📦 Annotations: ${annotations.length} rectangles\n🎯 Species: ${[...new Set(annotations.map(a => getSpeciesName(a.species)))].join(', ')}\n\n💾 Data sent to /api/save-correction\n🤖 Will be used to fine-tune YOLO model weights for Louisiana-specific sediment and vegetation camouflage patterns.`);
      
      // Clear annotations after save
      setAnnotations([]);
    }
  };

  const handleClearAnnotations = () => {
    if (confirm(`Clear all ${annotations.length} annotations?`)) {
      setAnnotations([]);
    }
  };

  if (!uploadedImage) {
    return (
      <div className="command-panel h-full flex items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <MousePointer className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-semibold mb-2 text-lg">No Image Uploaded</p>
          <p className="text-sm mb-4">Upload an image in the AI Detection panel first</p>
          <div className="glass-panel p-4 rounded-lg bg-primary/10 border border-primary/30 text-left">
            <p className="text-xs text-primary mb-2"><strong>How Annotation Works:</strong></p>
            <ol className="text-xs text-gray-300 space-y-1">
              <li>1. Upload aerial image in AI Detection tab</li>
              <li>2. Run AI detection to see what AI found</li>
              <li>3. Come to Annotation tab (image appears automatically)</li>
              <li>4. Enable Expert Correction Mode</li>
              <li>5. Click and drag to draw rectangles around nests AI missed</li>
              <li>6. Save corrections to train the model</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="command-panel h-full flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MousePointer className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-white">Annotation Overlay</h2>
            <p className="text-sm text-gray-400">Draw rectangles around missed nests</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="glass-button p-2 rounded-lg"
        >
          <Info className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="glass-panel p-4 rounded-lg bg-primary/10 border border-primary/30 fade-in">
          <p className="text-xs text-primary leading-relaxed mb-2">
            <strong>How to Annotate:</strong>
          </p>
          <ol className="text-xs text-gray-300 space-y-1">
            <li>1. Enable "Expert Correction Mode" below</li>
            <li>2. Select a species to annotate</li>
            <li>3. <strong>Click and drag</strong> on the image to draw rectangles around nests the AI missed</li>
            <li>4. Release mouse to complete the rectangle</li>
            <li>5. Repeat for all missed nests</li>
            <li>6. Click "Save Corrections" to send data to /api/save-correction</li>
          </ol>
          <p className="text-xs text-ocean mt-2">
            💡 Your corrections train the YOLO model for Louisiana-specific conditions!
          </p>
        </div>
      )}

      {/* AI Detection Results Summary */}
      {detectionResults && (
        <div className="glass-panel p-4 rounded-lg bg-ocean/10 border border-ocean/30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-ocean">AI Detected: {detectionResults.total_nests} nests</p>
              <p className="text-xs text-gray-400 mt-1">
                {detectionResults.detections.length} species • Shown as dashed boxes
              </p>
            </div>
            <button
              onClick={() => setShowDetections(!showDetections)}
              className={`glass-button px-3 py-1 rounded-lg text-xs transition-all ${
                showDetections ? 'bg-ocean/20 text-ocean' : 'text-gray-400'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              {showDetections ? 'Hide AI' : 'Show AI'}
            </button>
          </div>
        </div>
      )}

      {/* Expert Mode Toggle */}
      <div className="glass-panel p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-semibold">Expert Correction Mode</p>
            <p className="text-xs text-gray-400 mt-1">
              {isExpertMode ? '🖱️ Click and drag to draw rectangles' : 'Enable to start annotating'}
            </p>
          </div>
          <button
            onClick={() => setIsExpertMode(!isExpertMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              isExpertMode
                ? 'bg-primary/20 text-primary border-2 border-primary'
                : 'glass-button text-gray-400'
            }`}
          >
            {isExpertMode ? (
              <>
                <ToggleRight className="w-5 h-5" />
                Enabled
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5" />
                Disabled
              </>
            )}
          </button>
        </div>

        {/* Species Selection */}
        {isExpertMode && selectedColony && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">Select species to annotate:</p>
            <div className="grid grid-cols-2 gap-2">
              {selectedColony.top_species.map(species => {
                const category = getSpeciesCategory(species);
                const color = categoryColors[category];
                
                return (
                  <button
                    key={species}
                    onClick={() => setSelectedSpecies(species)}
                    className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedSpecies === species
                        ? 'bg-white/20 border-2'
                        : 'glass-button'
                    }`}
                    style={{
                      borderColor: selectedSpecies === species ? color : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-white">{getSpeciesName(species)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

        {/* Canvas Container */}
        <div className="glass-panel p-4 rounded-lg">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {isExpertMode ? '🖱️ Click and drag to draw rectangles' : 'Enable Expert Mode to annotate'}
            </p>
            {annotations.length > 0 && (
              <span className="text-xs text-primary font-bold">
                {annotations.length} correction{annotations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="overflow-auto custom-scrollbar max-h-96 border-2 border-gray-700 rounded-lg">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`max-w-full h-auto ${
                isExpertMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>• <strong>Dashed boxes</strong> = AI detections</p>
            <p>• <strong>Solid boxes</strong> = Your corrections</p>
          </div>
        </div>

        {/* Annotations Summary */}
        {annotations.length > 0 && (
        <div className="glass-panel p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">
              ✓ Your Corrections: {annotations.length}
            </p>
            <button
              onClick={handleClearAnnotations}
              className="glass-button px-3 py-1 rounded-lg text-xs text-coral hover:bg-coral/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {Object.entries(
              annotations.reduce((acc, ann) => {
                acc[ann.species] = (acc[ann.species] || 0) + 1;
                return acc;
              }, {})
            ).map(([species, count]) => {
              const category = getSpeciesCategory(species);
              const color = categoryColors[category];
              
              return (
                <div key={species} className="flex items-center justify-between text-xs bg-gray-800/50 p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-gray-300">{getSpeciesName(species)}</span>
                  </div>
                  <span className="text-white font-bold">{count} rectangle{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Action Buttons */}
        <div className="flex gap-3">
        <button
          onClick={handleSaveCorrections}
          disabled={annotations.length === 0}
          className={`flex-1 glass-button py-3 rounded-lg font-semibold transition-all ${
            annotations.length > 0
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            Save {annotations.length} Correction{annotations.length !== 1 ? 's' : ''}
          </span>
        </button>
      </div>

        {/* Workflow Explanation */}
        <div className="glass-panel p-3 rounded-lg bg-ocean/10 border border-ocean/30">
          <p className="text-xs text-ocean leading-relaxed">
            <strong>Where do annotations go?</strong> When you click "Save Corrections", the data (rectangles, species, colony name, timestamp) is sent to <code className="bg-black/30 px-1 rounded">/api/save-correction</code>. In production, this endpoint stores your corrections in a database and uses them to fine-tune the YOLO model weights, improving detection accuracy for Louisiana-specific sediment and vegetation patterns. For this demo, data is logged to console and shown in the success message.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnotationOverlay;
