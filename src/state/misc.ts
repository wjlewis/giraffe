import { Vec } from '../tools';

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

export class Selection {
  private type: SelectionType;
  private vertexIds?: number[];

  static none(): Selection {
    const out = new Selection();
    out.type = SelectionType.None;
    return out;
  }

  static vertices(vertexIds: number[]): Selection {
    const out = new Selection();
    out.type = SelectionType.Vertices;
    out.vertexIds = vertexIds;
    return out;
  }

  match<A>(match: SelectionMatch<A>): A {
    switch (this.type) {
      case SelectionType.None:
        return match.none();
      case SelectionType.Vertices:
        return match.vertices(this.vertexIds as number[]);
    }
  }
}

enum SelectionType {
  None = 'None',
  Vertices = 'Vertices',
}

interface SelectionMatch<A> {
  none: () => A;
  vertices: (vertexIds: number[]) => A;
}

export class DragSubject {
  private type: DragSubjectType;
  private boxSelectionRootPos?: Vec;
  private vertexOffsets?: VertexOffsets;

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

  static vertices(vertexOffsets: VertexOffsets): DragSubject {
    const out = new DragSubject();
    out.type = DragSubjectType.Vertices;
    out.vertexOffsets = vertexOffsets;
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
        return match.vertices(this.vertexOffsets as VertexOffsets);
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

interface DragSubjectMatch<A> {
  none: () => A;
  boxSelection: (rootPos: Vec) => A;
  vertices: (vertexOffsets: VertexOffsets) => A;
}
