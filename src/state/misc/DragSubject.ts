import { Vec } from '../../tools';

export class DragSubject {
  private type: DragSubjectType;
  private boxSelectionRootPos?: Vec;
  private vertexOffsets?: VertexOffsets;
  private edgeOffsets?: EdgeOffsets;

  static none(): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.None;
    return out;
  }

  static boxSelection(rootPos: Vec): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.BoxSelection;
    out.boxSelectionRootPos = rootPos;
    return out;
  }

  static vertices(
    vertexOffsets: VertexOffsets,
    edgeOffsets: EdgeOffsets
  ): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.Vertices;
    out.vertexOffsets = vertexOffsets;
    out.edgeOffsets = edgeOffsets;
    return out;
  }

  isNone(): boolean {
    return this.type === DragSubjectType.None;
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
    }
  }
}

enum DragSubjectType {
  None = 'None',
  BoxSelection = 'BoxSelection',
  Vertices = 'Vertices',
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
    perp: Vec;
  };
}

interface DragSubjectMatch<A> {
  none: () => A;
  boxSelection: (rootPos: Vec) => A;
  vertices: (vertexOffsets: VertexOffsets, edgeOffsets: EdgeOffsets) => A;
}
