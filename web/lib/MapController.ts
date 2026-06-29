import { MapRenderer } from './MapRenderer';
import { TileCache } from './TileCache';

export class MapController {
  private renderer: MapRenderer;
  private cache: TileCache;
  private currentSeed: number = 0;
  private currentVersion: number = 121;
  private panX = 0;
  private panY = 0;
  private zoom = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new MapRenderer(new OffscreenCanvas(512, 512));
    this.cache = new TileCache();
  }

  public setSeed(seed: number) {
    this.currentSeed = seed;
    this.render();
  }

  public setVersion(version: number) {
    this.currentVersion = version;
    this.render();
  }

  public pan(dx: number, dy: number) {
    this.panX += dx;
    this.panY += dy;
    this.render();
  }

  public zoom(factor: number) {
    this.zoom *= factor;
    this.render();
  }

  private async render() {
    const tileX = Math.floor(this.panX / 512);
    const tileZ = Math.floor(this.panY / 512);
    
    const canvas = this.cache.getTile(tileX, tileZ);
    if (canvas) {
      // Draw cached tile
    } else {
      await this.renderer.renderTile(this.currentSeed, tileX * 512, tileZ * 512, this.currentVersion);
      // Store in cache
    }
  }
}
