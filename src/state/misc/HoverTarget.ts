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

  static NewVertex(): HoverTarget {
    const out = new HoverTarget();
    out.type = HoverTargetType.NewVertex;
    return out;
  }

  isNewVertex(): boolean {
    return this.type === HoverTargetType.NewVertex;
  }

  match<A>(match: HoverTargetMatch<A>): A {
    switch (this.type) {
      case HoverTargetType.Canvas:
        return match.canvas();
      case HoverTargetType.Vertex:
        return match.vertex(this.vertexId as number);
      case HoverTargetType.EdgeControlPt:
        return match.edgeControlPt(this.edgeId as number);
      case HoverTargetType.NewVertex:
        return match.newVertex();
    }
  }
}

enum HoverTargetType {
  Canvas = 'Canvas',
  Vertex = 'Vertex',
  EdgeControlPt = 'EdgeControlPt',
  NewVertex = 'NewVertex',
}

export interface HoverTargetMatch<A> {
  canvas: () => A;
  vertex: (vertexId: number) => A;
  edgeControlPt: (edgeId: number) => A;
  newVertex: () => A;
}
