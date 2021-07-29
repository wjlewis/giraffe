export class HoverTarget {
  private type: HoverTargetType;
  private vertexId?: number;

  static canvas(): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.Canvas;
    return out;
  }

  static vertex(vertexId: number): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.Vertex;
    out.vertexId = vertexId;
    return out;
  }

  match<A>(match: HoverTargetMatch<A>): A {
    switch (this.type) {
      case HoverTargetType.Canvas:
        return match.canvas();
      case HoverTargetType.Vertex:
        return match.vertex(this.vertexId as number);
    }
  }
}

enum HoverTargetType {
  Canvas = 'Canvas',
  Vertex = 'Vertex',
}

export interface HoverTargetMatch<A> {
  canvas: () => A;
  vertex: (vertexId: number) => A;
}
