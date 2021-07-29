import { Vec } from './Vec';

export class Rect {
  private minCorner: Vec;
  private maxCorner: Vec;

  constructor(corner1: Vec, corner2: Vec) {
    const minX = Math.min(corner1.x, corner2.x);
    const minY = Math.min(corner1.y, corner2.y);
    const maxX = Math.max(corner1.x, corner2.x);
    const maxY = Math.max(corner1.y, corner2.y);

    this.minCorner = new Vec(minX, minY);
    this.maxCorner = new Vec(maxX, maxY);
  }

  get x(): number {
    return this.minCorner.x;
  }

  get y(): number {
    return this.minCorner.y;
  }

  get width(): number {
    return this.maxCorner.x - this.minCorner.x;
  }

  get height(): number {
    return this.maxCorner.y - this.minCorner.y;
  }

  contains(vec: Vec, padding: number = 0): boolean {
    const minDiff = vec.minus(this.minCorner);
    const maxDiff = this.maxCorner.minus(vec);

    return (
      minDiff.x > padding &&
      minDiff.y > padding &&
      maxDiff.x > padding &&
      maxDiff.y > padding
    );
  }
}
