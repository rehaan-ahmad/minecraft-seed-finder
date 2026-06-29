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
        // Use engine.HEAP32 to read the returned array
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
        const spawnPtr = engine._malloc(8); // 2 ints for X and Z
        const res = engine._getSpawnPoint_wasm(seed, payload.version, spawnPtr, spawnPtr + 4);
        const spawn = new Int32Array(engine.HEAP32.buffer, spawnPtr, 2);
        engine._free(spawnPtr);
        self.postMessage({ id, type: 'result', data: { x: spawn[0], z: spawn[1], success: res === 0 } });
        break;
      }
      default:
        self.postMessage({ id, type: 'error', data: `Task ${type} not implemented yet` });
    }
  } catch (err: any) {
    self.postMessage({ id, type: 'error', data: err.message });
  }
};
