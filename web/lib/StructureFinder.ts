export interface StructureCoord {
  x: number;
  z: number;
  biome: string;
  distance: number;
}

export interface StructureResult {
  type: string;
  coords: StructureCoord[];
}

export class StructureFinder {
  private workerPool: Worker[];

  constructor(workers: Worker[]) {
    this.workerPool = workers;
  }

  public async findNearest(seed: string | number, type: string, version: string, maxRadius: number): Promise<StructureCoord | null> {
    // Dispatch to worker via protocol
    return null; // Placeholder for actual worker dispatch
  }

  public async findAll(seed: string | number, type: string, version: string, radius: number): Promise<StructureCoord[]> {
    // Dispatch to worker via protocol
    return []; // Placeholder
  }
}
