import { WorkerRequest } from './worker-types';

export class TileCache {
  private cache = new Map<string, OffscreenCanvas>();
  private maxTiles = 512;

  public getTile(x: number, z: number): OffscreenCanvas | undefined {
    return this.cache.get(`${x},${z}`);
  }

  public setTile(x: number, z: number, canvas: OffscreenCanvas) {
    if (this.cache.size >= this.maxTiles) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(`${x},${z}`, canvas);
  }

  public invalidate() {
    this.cache.clear();
  }
}
