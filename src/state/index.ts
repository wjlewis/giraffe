import React from 'react';
import { set, Vec, Rect, Option, xOrIn } from '../tools';
import { Action, ActionType } from './actions';
import {
  HoverTarget,
  Selection,
  DragSubject,
  VertexOffsets,
  EdgeOffsets,
} from './misc';
import * as sel from './selectors';

export * from './actions';
export * from './middleware';
export * from './selectors';

export const StateContext = React.createContext({
  state: null as any as State,
  dispatch: null as any as React.Dispatch<Action>,
});

export interface State {
  ui: UIState;
  graph: GraphState;
}

export interface UIState {
  mousePos: Vec;
  hoverTarget: HoverTarget;
  selection: Selection;
  dragSubject: DragSubject;
  isMultiSelect: boolean;
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

export const initState: State = {
  ui: {
    mousePos: new Vec(0, 0),
    hoverTarget: HoverTarget.Canvas(),
    selection: Selection.None(),
    dragSubject: DragSubject.None(),
    isMultiSelect: false,
  },
  graph: {
    vertices: {
      byId: {},
      wip: Option.None(),
    },
    edges: {
      byId: {},
      wip: Option.None(),
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
    case ActionType.MouseEnterEdgeControlPt:
      return reduceMouseEnterEdgeControlPt(state, action);
    case ActionType.MouseLeaveEdgeControlPt:
      return reduceMouseLeaveEdgeControlPt(state, action);
    case ActionType.AddVertex:
      return reduceAddVertex(state, action);
    case ActionType.RemoveVertices:
      return reduceRemoveVertices(state, action);
    case ActionType.AddEdge:
      return reduceAddEdge(state, action);
    case ActionType.RemoveEdge:
      return reduceRemoveEdge(state, action);
    case ActionType.ShiftKeyDown:
      return reduceShiftKeyDown(state, action);
    case ActionType.KeyUp:
      return reduceKeyUp(state, action);
    case ActionType.CancelCurrentAction:
      return reduceCancelCurrentAction(state, action);
    default:
      return state;
  }
}

function reduceMouseDown(state: State, action: Action): State {
  return state.ui.hoverTarget.match({
    canvas: () => {
      const mousePos = sel.selectMousePos(state);
      return set(
        state,
        ['ui', 'dragSubject'],
        DragSubject.BoxSelection(mousePos)
      );
    },
    vertex: vertexId => {
      const selection = sel.selectSelection(state);
      return selection.match({
        none: () => {
          const withWip = copyCurrentToWip(state);
          const vertexOffsets = computeVertexOffsets(withWip, [vertexId]);
          const edgeOffsets = computeEdgeOffsets(withWip, [vertexId]);
          const withDragTarget = set(
            withWip,
            ['ui', 'dragSubject'],
            DragSubject.Vertices(vertexOffsets, edgeOffsets)
          );
          return set(
            withDragTarget,
            ['ui', 'selection'],
            Selection.Vertices([vertexId])
          );
        },
        vertices: vertexIds => {
          const allVertexIds = sel.isMultiSelect(state)
            ? xOrIn(vertexIds, vertexId)
            : vertexIds.includes(vertexId)
            ? vertexIds
            : [vertexId];

          const withWip = copyCurrentToWip(state);
          const vertexOffsets = computeVertexOffsets(withWip, allVertexIds);
          const edgeOffsets = computeEdgeOffsets(withWip, allVertexIds);
          const withDragTarget = set(
            withWip,
            ['ui', 'dragSubject'],
            DragSubject.Vertices(vertexOffsets, edgeOffsets)
          );
          return set(
            withDragTarget,
            ['ui', 'selection'],
            Selection.Vertices(allVertexIds)
          );
        },
      });
    },
    edgeControlPt: edgeId => {
      const withWip = copyCurrentToEdgeWip(state);
      return set(
        withWip,
        ['ui', 'dragSubject'],
        DragSubject.EdgeControlPt(edgeId)
      );
    },
    newVertex: () => {
      const id = sel.selectNextVertexId(state);
      const mousePos = sel.selectMousePos(state);
      const withVertexHovered = set(
        state,
        ['ui', 'hoverTarget'],
        HoverTarget.Vertex(id)
      );
      const vertices = sel.selectVertices(withVertexHovered);
      const updated = [...vertices, { id, name: '', pos: mousePos }];
      const byId = updated.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
      return set(withVertexHovered, ['graph', 'vertices', 'byId'], byId);
    },
  });
}

function computeVertexOffsets(
  state: State,
  vertexIds: number[]
): VertexOffsets {
  const mousePos = sel.selectMousePos(state);
  const vertices = vertexIds.map(id => state.graph.vertices.byId[id]);
  const withOffsets = vertices.map(({ id, pos }) => ({
    id,
    mouseOffset: pos.minus(mousePos),
  }));
  return withOffsets.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
}

function computeEdgeOffsets(state: State, vertexIds: number[]): EdgeOffsets {
  const edges = sel
    .selectEdges(state)
    .filter(
      edge =>
        vertexIds.includes(edge.startVertexId) ||
        vertexIds.includes(edge.endVertexId)
    );

  const offsets = edges.map(edge => {
    const p = sel.selectVertexPos(state, edge.startVertexId);
    const q = sel.selectVertexPos(state, edge.endVertexId);
    const pq = q.minus(p);
    const pc = edge.controlPtPos.minus(p);
    const proj = pc.proj(pq);
    const perp = pc.minus(proj);
    const perpSign = proj.crossSign(perp);
    const pqRatioSign = Math.sign(proj.dot(pq));
    const pqRatio = (pqRatioSign * proj.length()) / pq.length();

    return {
      id: edge.id,
      pqRatio,
      perpLen: perpSign * perp.length(),
    };
  });

  return offsets.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
}

function copyCurrentToWip(state: State): State {
  const withVertices = set(
    state,
    ['graph', 'vertices', 'wip'],
    Option.Some(state.graph.vertices.byId)
  );
  return set(
    withVertices,
    ['graph', 'edges', 'wip'],
    Option.Some(state.graph.edges.byId)
  );
}

function copyCurrentToEdgeWip(state: State): State {
  return set(
    state,
    ['graph', 'edges', 'wip'],
    Option.Some(state.graph.edges.byId)
  );
}

function reduceMouseUp(state: State, action: Action): State {
  const withNoDragSubject = set(
    state,
    ['ui', 'dragSubject'],
    DragSubject.None()
  );
  return sel.selectDragSubject(state).match({
    none: () => withNoDragSubject,
    boxSelection: rootPos => {
      const mousePos = sel.selectMousePos(withNoDragSubject);
      const hoveredVertexIds = sel.selectVertexIdsInRect(
        state,
        new Rect(rootPos, mousePos),
        20
      );

      const currentlySelectedVertexIds = sel.selectSelectedVertexIds(state);
      const selectedVertexIds = sel.isMultiSelect(state)
        ? [...currentlySelectedVertexIds, ...hoveredVertexIds]
        : hoveredVertexIds;

      return set(
        withNoDragSubject,
        ['ui', 'selection'],
        selectedVertexIds.length > 0
          ? Selection.Vertices(selectedVertexIds)
          : Selection.None()
      );
    },
    vertices: () => commitWip(withNoDragSubject),
    edgeControlPt: () => commitEdgeWip(withNoDragSubject),
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
        wip: Option.None(),
      },
      edges: {
        ...state.graph.edges,
        byId: state.graph.edges.wip.unwrap(),
        wip: Option.None(),
      },
    },
  };
}

function commitEdgeWip(state: State): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        byId: state.graph.edges.wip.unwrap(),
        wip: Option.None(),
      },
    },
  };
}

function reduceMouseMove(state: State, action: Action): State {
  const withMousePos = set(state, ['ui', 'mousePos'], action.payload);
  const dragSubject = sel.selectDragSubject(withMousePos);

  return dragSubject.match({
    vertices: (vertexOffsets, edgeOffsets) =>
      updateWips(withMousePos, vertexOffsets, edgeOffsets),
    edgeControlPt: edgeId => updateEdgeWip(withMousePos, edgeId),
    boxSelection: () => withMousePos,
    none: () => withMousePos,
  });
}

function updateWips(
  state: State,
  offsets: VertexOffsets,
  edgeOffsets: EdgeOffsets
): State {
  const mousePos = sel.selectMousePos(state);
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
        const p = sel.selectVertexPos(withVertices, edge.startVertexId);
        const q = sel.selectVertexPos(withVertices, edge.endVertexId);
        const pq = q.minus(p);
        const proj = pq.scale(offsetInfo.pqRatio);
        const perp = proj.perp().normalize().scale(offsetInfo.perpLen);
        const controlPtPos = p.plus(proj).plus(perp);

        return {
          ...edge,
          controlPtPos,
        };
      });
      return updated.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
    })
  );
}

function updateEdgeWip(state: State, edgeId: number): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        wip: state.graph.edges.wip.map(edges => ({
          ...edges,
          [edgeId]: {
            ...state.graph.edges.byId[edgeId],
            controlPtPos: state.ui.mousePos,
          },
        })),
      },
    },
  };
}

function reduceMouseEnterVertex(state: State, action: Action): State {
  return sel.selectDragSubject(state).match({
    none: () =>
      sel.selectHoverTarget(state).isNewVertex()
        ? state
        : set(state, ['ui', 'hoverTarget'], HoverTarget.Vertex(action.payload)),
    vertices: () =>
      sel.selectHoverTarget(state).isNewVertex()
        ? state
        : set(state, ['ui', 'hoverTarget'], HoverTarget.Vertex(action.payload)),
    edgeControlPt: () => state,
    boxSelection: () => state,
  });
}

function reduceMouseLeaveVertex(state: State, action: Action): State {
  const hoverTarget = sel.selectHoverTarget(state);
  return hoverTarget.isNewVertex()
    ? state
    : set(state, ['ui', 'hoverTarget'], HoverTarget.Canvas());
}

function reduceMouseEnterEdgeControlPt(state: State, action: Action): State {
  return sel.selectDragSubject(state).match({
    none: () =>
      set(
        state,
        ['ui', 'hoverTarget'],
        HoverTarget.EdgeControlPt(action.payload)
      ),
    vertices: () => state,
    edgeControlPt: () => state,
    boxSelection: () => state,
  });
}

function reduceMouseLeaveEdgeControlPt(state: State, action: Action): State {
  return set(state, ['ui', 'hoverTarget'], HoverTarget.Canvas());
}

function reduceAddVertex(state: State, action: Action): State {
  return set(state, ['ui', 'hoverTarget'], HoverTarget.NewVertex());
}

function reduceRemoveVertices(state: State, action: Action): State {
  const vertices = sel.selectVertices(state);
  const selectedVertexIds = action.payload;
  const updatedVertices = vertices.filter(
    v => !selectedVertexIds.includes(v.id)
  );
  const verticesById = updatedVertices.reduce(
    (acc, x) => ({ ...acc, [x.id]: x }),
    {}
  );
  const withoutVertices = set(
    state,
    ['graph', 'vertices', 'byId'],
    verticesById
  );

  const edges = sel.selectEdges(state);
  const updatedEdges = edges.filter(
    e =>
      !selectedVertexIds.includes(e.startVertexId) &&
      !selectedVertexIds.includes(e.endVertexId)
  );
  const edgesById = updatedEdges.reduce(
    (acc, x) => ({ ...acc, [x.id]: x }),
    {}
  );
  const withoutEdges = set(
    withoutVertices,
    ['graph', 'edges', 'byId'],
    edgesById
  );
  const hoveringCanvas = set(
    withoutEdges,
    ['ui', 'hoverTarget'],
    HoverTarget.Canvas()
  );
  return set(hoveringCanvas, ['ui', 'selection'], Selection.None());
}

function reduceAddEdge(state: State, action: Action): State {
  const { startVertexId, endVertexId } = action.payload;
  const id = sel.selectNextEdgeId(state);
  const startVertexPos = sel.selectVertexPos(state, startVertexId);
  const endVertexPos = sel.selectVertexPos(state, endVertexId);
  const controlPtPos = endVertexPos
    .minus(startVertexPos)
    .scale(1 / 2)
    .plus(startVertexPos);
  const edge = {
    id,
    startVertexId,
    endVertexId,
    controlPtPos,
  };
  const byId = {
    ...state.graph.edges.byId,
    [id]: edge,
  };
  const withEdge = set(state, ['graph', 'edges', 'byId'], byId);
  return set(withEdge, ['ui', 'selection'], Selection.None());
}

function reduceRemoveEdge(state: State, action: Action): State {
  const edgeId = action.payload;
  const edges = sel.selectEdges(state);
  const updated = edges.filter(e => e.id !== edgeId);
  const byId = updated.reduce((acc, x) => ({ ...acc, [x.id]: x }), {});
  return set(state, ['graph', 'edges', 'byId'], byId);
}

function reduceShiftKeyDown(state: State, action: Action): State {
  return set(state, ['ui', 'isMultiSelect'], true);
}

function reduceKeyUp(state: State, action: Action): State {
  // TODO Perform whatever other key actions need to be performed here
  return set(state, ['ui', 'isMultiSelect'], false);
}

function reduceCancelCurrentAction(state: State, action: Action): State {
  const currentHoverTarget = sel.selectHoverTarget(state);
  const hoverTarget = currentHoverTarget.isNewVertex()
    ? HoverTarget.Canvas()
    : currentHoverTarget;

  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
      hoverTarget,
    },
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        wip: Option.None(),
      },
      edges: {
        ...state.graph.edges,
        wip: Option.None(),
      },
    },
  };
}
