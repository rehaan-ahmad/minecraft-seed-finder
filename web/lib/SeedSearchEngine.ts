import { MinecraftEdition } from './versions';
import { WorkerRequest, WorkerResponse } from './worker-types';

export interface SearchParams {
  seedRange: { min: number; max: number } | { exact: string | number };
  version: string;
  edition: MinecraftEdition;
  requiredStructures: string[];
  maxDistance: number;
  minScore: number;
  requiredBiome?: string;
  tags: string[];
}

export interface SearchResult {
  seed: number;
  score: number;
  structures: any[];
  thumbnail: string;
  spawnsIn: string;
}

export class SeedSearchEngine {
  private workers: Worker[] = [];

  constructor() {
    const concurrency = navigator.hardwareConcurrency || 4;
    for (let i = 0; i < concurrency; i++) {
      this.workers.push(new Worker(new URL('../workers/engine.worker.ts', import.meta.url)));
    }
  }

  public async searchDatabase(db: any[], params: SearchParams): Promise<SearchResult[]> {
    return db.filter(seed => {
      if (params.minScore && seed.score < params.minScore) return false;
      if (params.tags.length > 0 && !params.tags.every(tag => seed.tags.includes(tag))) return false;
      return true;
    });
  }

  public async liveScan(params: SearchParams, onProgress: (progress: number) => void): Promise<SearchResult[]> {
    const range = typeof params.seedRange === 'object' && 'min' in params.seedRange 
      ? params.seedRange.max - params.seedRange.min 
      : 0;
    
    if (range === 0) return [];

    const chunkSize = Math.ceil(range / this.workers.length);
    const promises = this.workers.map((worker, i) => {
      return new Promise<SearchResult[]>((resolve) => {
        const start = params.seedRange.min + (i * chunkSize);
        const end = Math.min(start + chunkSize, params.seedRange.max);
        
        worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
          if (e.data.type === 'result') resolve(e.data.data);
        };
        
        worker.postMessage({
          id: `scan-${i}`,
          type: 'BATCH_SCAN',
          payload: { seed: start, width: chunkSize, version: params.version, edition: params.edition }
        } as WorkerRequest);
      });
    });

    const results = await Promise.all(promises);
    return results.flat().sort((a, b) => b.score - a.score);
  }

  public dispose() {
    this.workers.forEach(w => w.terminate());
  }
}
