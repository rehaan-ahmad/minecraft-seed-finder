import { MapRenderer } from './MapRenderer';

export interface StructurePin {
  type: string;
  x: number;
  z: number;
  color: string;
}

export class StructureOverlay {
  private renderer: MapRenderer;

  constructor(renderer: MapRenderer) {
    this.renderer = renderer;
  }

  public drawPin(pin: StructurePin, canvas: CanvasRenderingContext2D) {
    canvas.fillStyle = pin.color;
    canvas.beginPath();
    canvas.arc(pin.x, pin.z, 5, 0, Math.PI * 2);
    canvas.fill();
    canvas.strokeStyle = '#FFFFFF';
    canvas.stroke();
  }

  public renderAll(pins: StructurePin[], canvas: CanvasRenderingContext2D) {
    pins.forEach(pin => this.drawPin(pin, canvas));
  }
}
