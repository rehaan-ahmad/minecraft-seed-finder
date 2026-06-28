import { WorkerRequest, WorkerResponse } from './worker-types';
import { getBiomeColor } from '../data/biome-colors';

export class MapRenderer {
  private canvas: OffscreenCanvas;
  private ctx: OffscreenCanvasRenderingContext2D;
  private tileSize = 512;

  constructor(canvas: OffscreenCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public async renderTile(seed: number, x: number, z: number, version: number) {
    const { width, height } = this.canvas;
    const imageData = this.ctx.createImageData(width, height);
    const data = imageData.data;

    // This would normally come from the worker pool
    // Mocking the biome retrieval for the renderer logic
    for (let i = 0; i < width * height; i++) {
      const bx = i % width;
      const bz = Math.floor(i / width);
      
      // Simulated biome retrieval (in real use, this is a batch from Worker)
      const biomeId = 0; 
      const color = getBiomeColor(biomeId);
      const rgb = this.hexToRgb(color);
      
      const offset = i * 4;
      data[offset] = rgb.r;
      data[offset + 1] = rgb.g;
      data[offset + 2] = rgb.b;
      data[offset + 3] = 255;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  private hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}
