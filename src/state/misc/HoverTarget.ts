export class HoverTarget {
  private type: HoverTargetType;
  private vertexId?: number;
  private edgeId?: number;

  static Canvas(): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.Canvas;
    return out;
  }

  static Vertex(vertexId: number): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.Vertex;
    out.vertexId = vertexId;
    return out;
  }

  static EdgeControlPt(edgeId: number): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.EdgeControlPt;
    out.edgeId = edgeId;
    return out;
  }

  match<A>(match: HoverTargetMatch<A>): A {
    switch (this.type) {
      case HoverTargetType.Canvas:
        return match.canvas();
      case HoverTargetType.Vertex:
        return match.vertex(this.vertexId as number);
      case HoverTargetType.EdgeControlPt:
        return match.edgeControlPt(this.edgeId as number);
    }
  }
}

enum HoverTargetType {
  Canvas = 'Canvas',
  Vertex = 'Vertex',
  EdgeControlPt = 'EdgeControlPt',
}

export interface HoverTargetMatch<A> {
  canvas: () => A;
  vertex: (vertexId: number) => A;
  edgeControlPt: (edgeId: number) => A;
}
