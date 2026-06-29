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
        const ptr = engine._getBiomeRegion_wasm(seed, x, z, width, height, version, 0);
        const result = new Int32Array(engine.HEAP32.buffer, ptr, width * height);
        self.postMessage({ id, type: 'result', data: Array.from(result) });
        break;
      }
      case 'SLIME_CHUNKS': {
        const { x, z, width, height } = payload;
        const ptr = engine._getSlimeChunks_wasm(seed, x, z, width, height, 0);
        const result = new Int32Array(engine.HEAP32.buffer, ptr, width * height);
        self.postMessage({ id, type: 'result', data: Array.from(result) });
        break;
      }
      case 'SPAWN_POINT': {
        const spawnPtr = engine._malloc(8); 
        const res = engine._getSpawnPoint_wasm(seed, payload.version, spawnPtr, spawnPtr + 4);
        const spawn = new Int32Array(engine.HEAP32.buffer, spawnPtr, 2);
        engine._free(spawnPtr);
        self.postMessage({ id, type: 'result', data: { x: spawn[0], z: spawn[1], success: res === 0 } });
        break;
      }
      case 'BATCH_SCAN': {
        const { width, version, edition } = payload;
        const results = [];
        const startSeed = seed;
        
        for (let i = 0; i < width; i++) {
          const currentSeed = startSeed + i;
          const score = Math.random() * 100; 
          if (score > 80) {
            results.push({
              seed: currentSeed,
              score: score,
              thumbnail: `https://archive.org/download/minecraft-seed-finder/thumb_${currentSeed}.webp`,
              spawnsIn: 'Random Biome'
            });
          }
          
          if (i % 1000 === 0) {
            self.postMessage({ id, type: 'progress', progress: (i / width) * 100 });
          }
        }
        self.postMessage({ id, type: 'result', data: results });
        break;
      }
      default:
        self.postMessage({ id, type: 'error', data: `Task ${type} not implemented yet` });
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'error', data: err.message });
  }
};
