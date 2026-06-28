import { WorkerRequest, WorkerResponse } from '../lib/worker-types';

let seedEngine: any = null;

async function initEngine() {
  if (!seedEngine) {
    const SeedEngine = await import('/public/wasm/seed_engine.js');
    seedEngine = await SeedEngine.default();
  }
  return seedEngine;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const engine = await initEngine();
  const { id, type, payload } = e.data;
  
  try {
    let seed = typeof payload.seed === 'string' 
      ? engine._hashSeedString_wasm(payload.seed) 
      : payload.seed;

    switch (type) {
      case 'BIOME_REGION': {
        const { x, z, width, height, version } = payload;
        const buffer = engine._getBiomeRegion_wasm(seed, x, z, width, height, version, 0);
        // In Emscripten, we need to handle the pointer. 
        // For now, returning a simple confirmation.
        self.postMessage({ id, type: 'result', data: 'Region processed' });
        break;
      }
      case 'SLIME_CHUNKS': {
        const { x, z, width, height } = payload;
        const buffer = engine._getSlimeChunks_wasm(seed, x, z, width, height, 0);
        self.postMessage({ id, type: 'result', data: 'Slime chunks processed' });
        break;
      }
      default:
        self.postMessage({ id, type: 'error', data: `Task ${type} not implemented yet` });
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'error', data: err.message });
  }
};
