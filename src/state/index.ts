import React from 'react';
import { set, Vec, Rect, Option } from '../tools';
import { Action, ActionType } from './actions';
import {
  HoverTarget,
  Selection,
  DragSubject,
  VertexOffsets,
  EdgeOffsets,
} from './misc';

export * from './actions';
export * from './middleware';

export const StateContext = React.createContext({
  state: null as any as State,
  dispatch: null as any as React.Dispatch<Action>,
});

export interface UIState {
  mousePos: Vec;
  hoverTarget: HoverTarget;
  selection: Selection;
  dragSubject: DragSubject;
}

export interface GraphState {
  vertices: {
    byId: { [id: number]: Vertex };
    wip: Option<{ [id: number]: Vertex }>;
  };
  edges: {
    byId: { [id: number]: Edge };
    wip: Option<{ [id: number]: Edge }>;
  };
}

export interface Vertex {
  id: number;
  name: string;
  pos: Vec;
}

export interface Edge {
  id: number;
  startVertexId: number;
  endVertexId: number;
  controlPtPos: Vec;
}

export interface State {
  ui: UIState;
  graph: GraphState;
}

export const initState: State = {
  ui: {
    mousePos: new Vec(0, 0),
    hoverTarget: HoverTarget.canvas(),
    selection: Selection.none(),
    dragSubject: DragSubject.none(),
  },
  graph: {
    vertices: {
      byId: {
        0: {
          id: 0,
          name: '',
          pos: new Vec(200, 50),
        },
        1: {
          id: 1,
          name: 'b',
          pos: new Vec(600, 450),
        },
        2: {
          id: 2,
          name: 'c',
          pos: new Vec(700, 500),
        },
        3: {
          id: 3,
          name: '',
          pos: new Vec(600, 600),
        },
        4: {
          id: 4,
          name: '',
          pos: new Vec(800, 100),
        },
        5: {
          id: 5,
          name: '',
          pos: new Vec(100, 600),
        },
        6: {
          id: 6,
          name: '',
          pos: new Vec(900, 300),
        },
      },
      wip: Option.none(),
    },
    edges: {
      byId: {
        0: {
          id: 0,
          startVertexId: 0,
          endVertexId: 1,
          controlPtPos: new Vec(600, 300),
        },
      },
      wip: Option.none(),
    },
  },
};

/*
 * Reducer
 */
export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.MouseDown:
      return reduceMouseDown(state, action);
    case ActionType.MouseUp:
      return reduceMouseUp(state, action);
    case ActionType.MouseMove:
      return reduceMouseMove(state, action);
    case ActionType.MouseEnterVertex:
      return reduceMouseEnterVertex(state, action);
    case ActionType.MouseLeaveVertex:
      return reduceMouseLeaveVertex(state, action);
    default:
      return state;
  }
}

function reduceMouseDown(state: State, action: Action): State {
  return state.ui.hoverTarget.match({
    canvas: () => {
      const { mousePos } = state.ui;
      return set(
        state,
        ['ui', 'dragSubject'],
        DragSubject.boxSelection(mousePos)
      );
    },
    vertex: vertexId =>
      selectSelection(state).match({
        none: () => {
          const withWip = copyCurrentToWip(state);
          const vertexOffsets = computeVertexOffsets(withWip, [vertexId]);
          const edgeOffsets = computeEdgeOffsets(withWip, [vertexId]);
          const withDragTarget = set(
            withWip,
            ['ui', 'dragSubject'],
            DragSubject.vertices(vertexOffsets, edgeOffsets)
          );
          return set(
            withDragTarget,
            ['ui', 'selection'],
            Selection.vertices([vertexId])
          );
        },
        vertices: vertexIds => {
          if (vertexIds.includes(vertexId)) {
            const withWip = copyCurrentToWip(state);
            const vertexOffsets = computeVertexOffsets(withWip, vertexIds);
            const edgeOffsets = computeEdgeOffsets(withWip, vertexIds);
            return set(
              withWip,
              ['ui', 'dragSubject'],
              DragSubject.vertices(vertexOffsets, edgeOffsets)
            );
          } else {
            const withWip = copyCurrentToWip(state);
            const vertexOffsets = computeVertexOffsets(withWip, [vertexId]);
            const edgeOffsets = computeEdgeOffsets(withWip, [vertexId]);
            const withDragTarget = set(
              withWip,
              ['ui', 'dragSubject'],
              DragSubject.vertices(vertexOffsets, edgeOffsets)
            );
            return set(
              withDragTarget,
              ['ui', 'selection'],
              Selection.vertices([vertexId])
            );
          }
        },
      }),
  });
}

function copyCurrentToWip(state: State): State {
  const withVertices = set(
    state,
    ['graph', 'vertices', 'wip'],
    Option.some(state.graph.vertices.byId)
  );
  return set(
    withVertices,
    ['graph', 'edges', 'wip'],
    Option.some(state.graph.edges.byId)
  );
}

function reduceMouseUp(state: State, action: Action): State {
  const withNoDragSubject = set(
    state,
    ['ui', 'dragSubject'],
    DragSubject.none()
  );
  return selectDragSubject(state).match({
    none: () => withNoDragSubject,
    boxSelection: rootPos => {
      const mousePos = selectMousePos(withNoDragSubject);
      const hoveredVertices = selectVerticesInRect(
        state,
        new Rect(rootPos, mousePos),
        20
      );
      return set(
        withNoDragSubject,
        ['ui', 'selection'],
        hoveredVertices.length > 0
          ? Selection.vertices(hoveredVertices)
          : Selection.none()
      );
    },
    vertices: () => commitWip(withNoDragSubject),
  });
}

function commitWip(state: State): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        byId: state.graph.vertices.wip.unwrap(),
        wip: Option.none(),
      },
      edges: {
        ...state.graph.edges,
        byId: state.graph.edges.wip.unwrap(),
        wip: Option.none(),
      },
    },
  };
}

function reduceMouseMove(state: State, action: Action): State {
  const withMousePos = set(state, ['ui', 'mousePos'], action.payload);
  const dragSubject = selectDragSubject(withMousePos);

  return dragSubject.match({
    vertices: (vertexOffsets, edgeOffsets) =>
      updateWips(withMousePos, vertexOffsets, edgeOffsets),
    boxSelection: () => withMousePos,
    none: () => withMousePos,
  });
}

function updateWips(
  state: State,
  offsets: VertexOffsets,
  edgeOffsets: EdgeOffsets
): State {
  const mousePos = selectMousePos(state);
  const withVertices = set(
    state,
    ['graph', 'vertices', 'wip'],
    state.graph.vertices.wip.map(vertices => {
      const updated = Object.values(vertices).map(vertex => {
        const pos =
          vertex.id in offsets
            ? offsets[vertex.id].mouseOffset.plus(mousePos)
            : vertex.pos;
        return {
          ...vertex,
          pos,
        };
      });
      return updated.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
    })
  );

  return set(
    withVertices,
    ['graph', 'edges', 'wip'],
    state.graph.edges.wip.map(edges => {
      const updated = Object.values(edges).map(edge => {
        const offsetInfo = edgeOffsets[edge.id];
        if (!offsetInfo) {
          return edge;
        }
        const p = selectVertexPos(withVertices, edge.startVertexId);
        const q = selectVertexPos(withVertices, edge.endVertexId);
        const pq = q.minus(p);
        const proj = pq.scale(offsetInfo.pqRatio);
        const controlPtPos = p.plus(proj).plus(offsetInfo.perp);

        return {
          ...edge,
          controlPtPos,
        };
      });
      return updated.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
    })
  );
}

function reduceMouseEnterVertex(state: State, action: Action): State {
  return selectDragSubject(state).match({
    none: () =>
      set(state, ['ui', 'hoverTarget'], HoverTarget.vertex(action.payload)),
    vertices: () =>
      set(state, ['ui', 'hoverTarget'], HoverTarget.vertex(action.payload)),
    boxSelection: () => state,
  });
}

function reduceMouseLeaveVertex(state: State, action: Action): State {
  return set(state, ['ui', 'hoverTarget'], HoverTarget.canvas());
}

/*
 * Selectors
 */
export function selectVertices(state: State): Vertex[] {
  return state.graph.vertices.wip.match({
    some: vertices => Object.values(vertices),
    none: () => Object.values(state.graph.vertices.byId),
  });
}

export function selectEdges(state: State): Edge[] {
  return state.graph.edges.wip.match({
    some: edges => Object.values(edges),
    none: () => Object.values(state.graph.edges.byId),
  });
}

export function isVertexSelected(state: State, vertexId: number): boolean {
  return state.ui.selection.match({
    none: () => false,
    vertices: vertexIds => vertexIds.includes(vertexId),
  });
}

export function isVertexHovered(state: State, vertexId: number): boolean {
  const dragSubject = selectDragSubject(state);

  return state.ui.hoverTarget.match({
    canvas: () =>
      dragSubject.match({
        boxSelection: rootPos => {
          const mousePos = selectMousePos(state);
          const rect = new Rect(rootPos, mousePos);
          const vertexPos = selectVertexPos(state, vertexId);
          return rect.contains(vertexPos, 20);
        },
        none: () => false,
        vertices: () => false,
      }),
    vertex: v => dragSubject.isNone() && v === vertexId,
  });
}

export function selectVertexPos(state: State, vertexId: number): Vec {
  return state.graph.vertices.wip.match({
    none: () => state.graph.vertices.byId[vertexId].pos,
    some: vertices => vertices[vertexId].pos,
  });
}

export function selectMousePos(state: State): Vec {
  return state.ui.mousePos;
}

export function selectDragSubject(state: State): DragSubject {
  return state.ui.dragSubject;
}

export function selectSelection(state: State): Selection {
  return state.ui.selection;
}

export function selectVerticesInRect(
  state: State,
  rect: Rect,
  padding: number
): number[] {
  return Object.values(state.graph.vertices.byId)
    .filter(({ pos }) => rect.contains(pos, padding))
    .map(({ id }) => id);
}

function computeVertexOffsets(
  state: State,
  vertexIds: number[]
): VertexOffsets {
  const mousePos = selectMousePos(state);
  const vertices = vertexIds.map(id => state.graph.vertices.byId[id]);
  const withOffsets = vertices.map(({ id, pos }) => ({
    id,
    mouseOffset: pos.minus(mousePos),
  }));
  return withOffsets.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
}

function computeEdgeOffsets(state: State, vertexIds: number[]): EdgeOffsets {
  const edges = selectEdges(state).filter(
    edge =>
      vertexIds.includes(edge.startVertexId) ||
      vertexIds.includes(edge.endVertexId)
  );

  const offsets = edges.map(edge => {
    const p = selectVertexPos(state, edge.startVertexId);
    const q = selectVertexPos(state, edge.endVertexId);
    const pq = q.minus(p);
    const pc = edge.controlPtPos.minus(p);
    const proj = pc.proj(pq);
    const perp = pc.minus(proj);
    const pqRatio = proj.length() / pq.length();

    return {
      id: edge.id,
      pqRatio,
      perp,
    };
  });

  return offsets;
}
