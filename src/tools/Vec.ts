export class Vec {
  constructor(public x: number, public y: number) {}

  plus(rhs: Vec): Vec {
    return new Vec(this.x + rhs.x, this.y + rhs.y);
  }

  minus(rhs: Vec): Vec {
    return new Vec(this.x - rhs.x, this.y - rhs.y);
  }
}
