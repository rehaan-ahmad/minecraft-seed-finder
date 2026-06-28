export const BIOME_COLORS: Record<number, string> = {
  // Overworld
  0: '#567d47', // Plains
  1: '#4a7d42', // Forest
  2: '#d4a373', // Desert
  3: '#3e5e3e', // Taiga
  4: '#c2b280', // Savanna
  5: '#7a9a7a', // Snowy Plains
  6: '#3b6e3b', // Old Growth Pine Taiga
  7: '#4b7c4b', // Old Growth Spruce Taiga
  8: '#6d9e6d', // Jungle
  9: '#325c32', // Swamp
  10: '#7a9a7a', // Ice Plains
  11: '#5a8a5a', // Frozen River
  12: '#c2b280', // Desert (variant)
  13: '#4b7c4b', // Snowy Taiga
  14: '#4a7d42', // Forest (variant)
  15: '#d4a373', // Desert (variant)
  16: '#3e5e3e', // Taiga (variant)
  17: '#3b6e3b', // Old Growth Pine Taiga (variant)
  18: '#4b7c4b', // Old Growth Spruce Taiga (variant)
  19: '#6d9e6d', // Jungle (variant)
  20: '#325c32', // Swamp (variant)
  21: '#7a9a7a', // Ice Plains (variant)
  
  // Special / New Biomes
  120: '#FFB7C5', // Cherry Grove (Primary Pink)
  121: '#FF91A8', // Cherry Grove highlight
  
  // Mangrove / Deep Dark / Others
  140: '#2d4d2d', // Mangrove Swamp
  150: '#1a0812', // Deep Dark
  
  // Nether
  -1: '#4a0a0a', // Nether Wastes
  -2: '#8b1a36', // Crimson Forest
  -3: '#2d4d4d', // Warped Forest
  -4: '#5c4033', // Soul Sand Valley
  -5: '#3d2b1f', // Basalt Deltas
  
  // End
  -10: '#a0a0a0', // End Highlands
  -11: '#808080', // End Midlands
  -12: '#c0c0c0', // Small End Islands
};

export const getBiomeColor = (biomeId: number): string => {
  return BIOME_COLORS[biomeId] || '#000000';
};
