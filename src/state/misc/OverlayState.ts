export class OverlayState {
  private type: OverlayStateType;
  private graph?: string;
  private errors?: string[];

  static None(): OverlayState {
    const out = new OverlayState();
    out.type = OverlayStateType.None;
    return out;
  }

  static Graph(graph: string): OverlayState {
    const out = new OverlayState();
    out.type = OverlayStateType.Graph;
    out.graph = graph;
    return out;
  }

  static Errors(errors: string[]): OverlayState {
    const out = new OverlayState();
    out.type = OverlayStateType.Errors;
    out.errors = errors;
    return out;
  }

  isNone(): boolean {
    return this.type === OverlayStateType.None;
  }

  match<A>(match: OverlayStateMatch<A>): A {
    switch (this.type) {
      case OverlayStateType.None:
        return match.none();
      case OverlayStateType.Graph:
        return match.graph(this.graph as string);
      case OverlayStateType.Errors:
        return match.errors(this.errors as string[]);
    }
  }
}

enum OverlayStateType {
  None = 'None',
  Graph = 'Graph',
  Errors = 'Errors',
}

interface OverlayStateMatch<A> {
  none: () => A;
  graph: (graph: string) => A;
  errors: (errors: string[]) => A;
}
