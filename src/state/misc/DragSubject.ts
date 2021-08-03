import { Vec } from '../../tools';

export class DragSubject {
  private type: DragSubjectType;
  private boxSelectionRootPos?: Vec;
  private vertexOffsets?: VertexOffsets;
  private edgeOffsets?: EdgeOffsets;
  private edgeId?: number;

  static None(): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.None;
    return out;
  }

  static BoxSelection(rootPos: Vec): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.BoxSelection;
    out.boxSelectionRootPos = rootPos;
    return out;
  }

  static Vertices(
    vertexOffsets: VertexOffsets,
    edgeOffsets: EdgeOffsets
  ): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.Vertices;
    out.vertexOffsets = vertexOffsets;
    out.edgeOffsets = edgeOffsets;
    return out;
  }

  static EdgeControlPt(edgeId: number): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.EdgeControlPt;
    out.edgeId = edgeId;
    return out;
  }

  isNone(): boolean {
    return this.type === DragSubjectType.None;
  }

  isBoxSelection(): boolean {
    return this.type === DragSubjectType.BoxSelection;
  }

  match<A>(match: DragSubjectMatch<A>): A {
    switch (this.type) {
      case DragSubjectType.None:
        return match.none();
      case DragSubjectType.BoxSelection:
        return match.boxSelection(this.boxSelectionRootPos as Vec);
      case DragSubjectType.Vertices:
        return match.vertices(
          this.vertexOffsets as VertexOffsets,
          this.edgeOffsets as EdgeOffsets
        );
      case DragSubjectType.EdgeControlPt:
        return match.edgeControlPt(this.edgeId as number);
    }
  }
}

enum DragSubjectType {
  None = 'None',
  BoxSelection = 'BoxSelection',
  Vertices = 'Vertices',
  EdgeControlPt = 'EdgeControlPt',
}

export interface VertexOffsets {
  [id: number]: {
    id: number;
    mouseOffset: Vec;
  };
}

export interface EdgeOffsets {
  [id: number]: {
    id: number;
    pqRatio: number;
    perpLen: number;
  };
}

interface DragSubjectMatch<A> {
  none: () => A;
  boxSelection: (rootPos: Vec) => A;
  vertices: (vertexOffsets: VertexOffsets, edgeOffsets: EdgeOffsets) => A;
  edgeControlPt: (edgeId: number) => A;
}
