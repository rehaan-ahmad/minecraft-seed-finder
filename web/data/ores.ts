export interface OreType {
  id: string;
  name: string;
  optimalY: { min: number; max: number };
  color: string;
}

export const ORE_TYPES: Record<string, OreType> = {
  DIAMOND: { id: 'diamond', name: 'Diamond', optimalY: { min: -64, max: -58 }, color: '#C4E1F1' },
  IRON: { id: 'iron', name: 'Iron', optimalY: { min: -64, max: 64 }, color: '#D0D0D0' },
  GOLD: { id: 'gold', name: 'Gold', optimalY: { min: -64, max: 32 }, color: '#FCEE4H' },
  COPPER: { id: 'copper', name: 'Copper', optimalY: { min: -64, max: 64 }, color: '#E57C52' },
  EMERALD: { id: 'emerald', name: 'Emerald', optimalY: { min: -64, max: 320 }, color: '#50C878' },
  LAPIS: { id: 'lapis', name: 'Lapis Lazuli', optimalY: { min: -64, max: 64 }, color: '#2657FF' },
  REDSTONE: { id: 'redstone', name: 'Redstone', optimalY: { min: -64, max: -58 }, color: '#FF0000' },
  COAL: { id: 'coal', name: 'Coal', optimalY: { min: -64, max: 256 }, color: '#333333' },
  DEBRIS: { id: 'debris', name: 'Ancient Debris', optimalY: { min: 8, max: 22 }, color: '#B0A080' },
};
