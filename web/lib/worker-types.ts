import { MinecraftEdition } from './versions';

export type WorkerTaskType = 
  | 'BIOME_REGION' 
  | 'FIND_STRUCTURE' 
  | 'FIND_ALL_STRUCTURES' 
  | 'FIND_ORES' 
  | 'SLIME_CHUNKS' 
  | 'SPAWN_POINT' 
  | 'BATCH_SCAN';

export interface TaskPayload {
  seed: string | number;
  version: string;
  edition: MinecraftEdition;
  x?: number;
  z?: number;
  width?: number;
  height?: number;
  type?: string;
  radius?: number;
  y?: number;
  oreType?: string;
}

export interface WorkerRequest {
  id: string;
  type: WorkerTaskType;
  payload: TaskPayload;
}

export interface WorkerResponse {
  id: string;
  type: 'result' | 'progress' | 'error';
  data: any;
  progress?: number;
}
