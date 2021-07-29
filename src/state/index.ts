import React from 'react';
import { set, Vec, Rect, Option } from '../tools';
import { Action, ActionType } from './actions';
import { HoverTarget, Selection, DragSubject, VertexOffsets } from './misc';

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
  };
}

export interface Vertex {
  id: number;
  name: string;
  pos: Vec;
}

export interface Edge {
  startId: number;
  endId: number;
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
          pos: new Vec(600, 430),
        },
        2: {
          id: 2,
          name: 'c',
          pos: new Vec(700, 500),
        },
      },
      wip: Option.none(),
    },
    edges: {
      byId: {},
    },
  },
};

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
          const withWip = copyVerticesIntoWip(state);
          const offsets = computeVertexOffsets(withWip, [vertexId]);
          const withDragTarget = set(
            withWip,
            ['ui', 'dragSubject'],
            DragSubject.vertices(offsets)
          );
          return set(
            withDragTarget,
            ['ui', 'selection'],
            Selection.vertices([vertexId])
          );
        },
        vertices: vertexIds => {
          if (vertexIds.includes(vertexId)) {
            const withWip = copyVerticesIntoWip(state);
            const offsets = computeVertexOffsets(withWip, vertexIds);
            return set(
              withWip,
              ['ui', 'dragSubject'],
              DragSubject.vertices(offsets)
            );
          } else {
            const withWip = copyVerticesIntoWip(state);
            const offsets = computeVertexOffsets(withWip, [vertexId]);
            const withDragTarget = set(
              withWip,
              ['ui', 'dragSubject'],
              DragSubject.vertices(offsets)
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

function copyVerticesIntoWip(state: State): State {
  return set(
    state,
    ['graph', 'vertices', 'wip'],
    Option.some(state.graph.vertices.byId)
  );
}

function reduceMouseUp(state: State, action: Action): State {
  const withNoDragSubject = set(
    state,
    ['ui', 'dragSubject'],
    DragSubject.none()
  );
  return selectDragSubject(state).match({
    none: () => state,
    boxSelection: rootPos => {
      const mousePos = selectMousePos(state);
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
    vertices: () => commitVerticesWip(withNoDragSubject),
  });
}

function commitVerticesWip(state: State): State {
  const committed = set(
    state,
    ['graph', 'vertices', 'byId'],
    state.graph.vertices.wip.unwrap()
  );
  return set(committed, ['graph', 'vertices', 'wip'], Option.none());
}

function reduceMouseMove(state: State, action: Action): State {
  const withMousePos = set(state, ['ui', 'mousePos'], action.payload);
  const dragSubject = selectDragSubject(withMousePos);

  return dragSubject.match({
    vertices: offsets => updateVerticesWip(withMousePos, offsets),
    boxSelection: () => withMousePos,
    none: () => withMousePos,
  });
}

function updateVerticesWip(state: State, offsets: VertexOffsets): State {
  const mousePos = selectMousePos(state);
  return set(
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
}

function reduceMouseEnterVertex(state: State, action: Action): State {
  return selectDragSubject(state).match({
    none: () =>
      set(state, ['ui', 'hoverTarget'], HoverTarget.vertex(action.payload)),
    boxSelection: () => state,
    vertices: () => state,
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
  return state.graph.vertices.byId[vertexId].pos;
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
