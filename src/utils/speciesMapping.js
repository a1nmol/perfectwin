// Species code to full name mapping for Louisiana coastal birds
export const speciesMapping = {
  // Terns
  'SATE': 'Sandwich Tern',
  'ROYT': 'Royal Tern',
  'FOTE': 'Forster\'s Tern',
  'CATE': 'Caspian Tern',
  'LETE': 'Least Tern',
  'BLTE': 'Black Tern',
  'GBTE': 'Gull-billed Tern',
  'UNTE': 'Unidentified Tern',
  
  // Gulls
  'LAGU': 'Laughing Gull',
  'RBGU': 'Ring-billed Gull',
  'HEGU': 'Herring Gull',
  
  // Pelicans
  'BRPE': 'Brown Pelican',
  'AWPE': 'American White Pelican',
  
  // Herons & Egrets
  'GREG': 'Great Egret',
  'SNEG': 'Snowy Egret',
  'TRHE': 'Tricolored Heron',
  'LBHE': 'Little Blue Heron',
  'GBHE': 'Great Blue Heron',
  'BCNH': 'Black-crowned Night-Heron',
  
  // Ibises & Spoonbills
  'WHIB': 'White Ibis',
  'ROSP': 'Roseate Spoonbill',
  
  // Skimmers
  'BLSK': 'Black Skimmer',
  
  // Cormorants
  'NECO': 'Neotropic Cormorant',
  'DOCO': 'Double-crested Cormorant',
  'UNCO': 'Unidentified Cormorant',
  
  // Oystercatchers
  'AMOY': 'American Oystercatcher',
  
  // Frigatebirds
  'MAFR': 'Magnificent Frigatebird',
  
  // Anhingas
  'ANHI': 'Anhinga',
  
  // Unidentified
  'UNGT': 'Unidentified Gull/Tern',
  'UNHG': 'Unidentified Heron/Egret',
  'UNSB': 'Unidentified Shorebird',
  'UNWA': 'Unidentified Wading Bird',
  
  // Other
  'CARO': 'Carolina Wren',
  'FOCO': 'Fish Crow',
  'ROSA': 'Roseate Tern',
  'DAIB': 'Dark Ibis'
};

// Get species full name or return code if not found
export const getSpeciesName = (code) => {
  return speciesMapping[code] || code;
};

// Get species category for color coding
export const getSpeciesCategory = (code) => {
  if (['SATE', 'ROYT', 'FOTE', 'CATE', 'LETE', 'BLTE', 'GBTE', 'UNTE'].includes(code)) {
    return 'tern';
  }
  if (['LAGU', 'RBGU', 'HEGU'].includes(code)) {
    return 'gull';
  }
  if (['BRPE', 'AWPE'].includes(code)) {
    return 'pelican';
  }
  if (['GREG', 'SNEG', 'TRHE', 'LBHE', 'GBHE', 'BCNH'].includes(code)) {
    return 'heron';
  }
  if (['WHIB', 'ROSP'].includes(code)) {
    return 'ibis';
  }
  if (code === 'BLSK') {
    return 'skimmer';
  }
  return 'other';
};

// Species category colors for visualization
export const categoryColors = {
  tern: '#0ea5e9',      // Ocean blue
  gull: '#8b5cf6',      // Purple
  pelican: '#f97316',   // Coral
  heron: '#10b981',     // Emerald
  ibis: '#ec4899',      // Pink
  skimmer: '#eab308',   // Yellow
  other: '#6b7280'      // Gray
};
