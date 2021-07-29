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
