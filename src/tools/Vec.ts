export class Vec {
  constructor(public x: number, public y: number) {}

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  scale(factor: number): Vec {
    return new Vec(factor * this.x, factor * this.y);
  }

  plus(rhs: Vec): Vec {
    return new Vec(this.x + rhs.x, this.y + rhs.y);
  }

  minus(rhs: Vec): Vec {
    return new Vec(this.x - rhs.x, this.y - rhs.y);
  }

  proj(target: Vec): Vec {
    const denom = target.dot(target);
    if (denom === 0) {
      throw new Error('attempt to project onto the zero vector');
    }

    const num = this.dot(target);
    return target.scale(num / denom);
  }

  dot(rhs: Vec): number {
    return this.x * rhs.x + this.y * rhs.y;
  }

  // Right-handed
  perp(): Vec {
    const x = new Vec(1, 0).dot(this);
    const y = new Vec(0, 1).dot(this);
    return new Vec(-y, x);
  }

  crossSign(rhs: Vec): number {
    const crossLength = this.x * rhs.y - this.y * rhs.x;
    return Math.sign(crossLength);
  }

  normalize(): Vec {
    const len = this.length();
    if (len === 0) {
      throw new Error('attempt to normalize zero vector');
    }

    return this.scale(1 / len);
  }
}
