import { Vec, Rect, Option, xOrIn, arrayToObj } from '../tools';
import { Action, ActionType } from './actions';
import {
  State,
  GraphState,
  ById,
  Edge,
  Vertex,
  EdgeId,
  VertexId,
  EdgeDirection,
} from './state';
import {
  Selection,
  DragSubject,
  VertexOffsets,
  VertexOffset,
  EdgeOffsets,
  EdgeOffset,
  OverlayState,
} from './misc';
import * as Sel from './selectors';

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.MouseDownCanvas:
      return reduceMouseDownCanvas(state);
    case ActionType.MouseDownVertex:
      return reduceMouseDownVertex(state, action);
    case ActionType.MouseDownEdgeControlPt:
      return reduceMouseDownEdgeControlPt(state, action);
    case ActionType.MouseDownNewVertex:
      return reduceMouseDownNewVertex(state);
    case ActionType.MouseUp:
      return reduceMouseUp(state);
    case ActionType.MouseMove:
      return reduceMouseMove(state, action);
    case ActionType.AddVertex:
      return reduceAddVertex(state);
    case ActionType.RemoveVertices:
      return reduceRemoveVertices(state, action);
    case ActionType.AddEdge:
      return reduceAddEdge(state, action);
    case ActionType.RemoveEdge:
      return reduceRemoveEdge(state, action);
    case ActionType.ShiftKeyDown:
      return reduceShiftKeyDown(state);
    case ActionType.KeyUp:
      return reduceKeyUp(state);
    case ActionType.CancelCurrentAction:
      return reduceCancelCurrentAction(state);
    case ActionType.SelectAllVertices:
      return reduceSelectAllVertices(state);
    case ActionType.ChangeVertexName:
      return reduceChangeVertexName(state, action);
    case ActionType.MouseEnterVertex:
      return reduceMouseEnterVertex(state, action);
    case ActionType.MouseLeaveVertex:
      return reduceMouseLeaveVertex(state);
    case ActionType.MouseEnterEdgeControlPt:
      return reduceMouseEnterEdgeControlPt(state, action);
    case ActionType.MouseLeaveEdgeControlPt:
      return reduceMouseLeaveEdgeControlPt(state);
    case ActionType.ToggleEdgeDirection:
      return reduceToggleEdgeDirection(state, action);
    case ActionType.CommitCurrentGraphState:
      return reduceCommitCurrentGraphState(state);
    case ActionType.Undo:
      return reduceUndo(state);
    case ActionType.Redo:
      return reduceRedo(state);
    case ActionType.OpenGraphOverlay:
      return reduceOpenGraphOverlay(state, action);
    case ActionType.OpenErrorsOverlay:
      return reduceOpenErrorsOverlay(state, action);
    case ActionType.DismissOverlay:
      return reduceDismissOverlay(state);
    default:
      return state;
  }
}

function reduceMouseDownCanvas(state: State): State {
  const dragSubject = DragSubject.BoxSelection(Sel.mousePos(state));
  const selection = Sel.isMultiSelect(state)
    ? state.ui.selection
    : Selection.None();
  return {
    ...state,
    ui: { ...state.ui, dragSubject, selection },
  };
}

function reduceMouseDownVertex(state: State, action: Action): State {
  const vertexId = action.payload;
  const currentlySelectedVertexIds = Sel.selectedVertexIds(state);
  const allSelectedVertexIds = Sel.isMultiSelect(state)
    ? xOrIn(currentlySelectedVertexIds, vertexId)
    : currentlySelectedVertexIds.includes(vertexId)
    ? currentlySelectedVertexIds
    : [vertexId];

  const vertexOffsets = computeVertexOffsets(state, allSelectedVertexIds);
  const edgeOffsets = computeEdgeOffsets(state, allSelectedVertexIds);

  return {
    ...state,
    ui: {
      ...state.ui,
      selection: Selection.Vertices(allSelectedVertexIds),
      dragSubject: DragSubject.Vertices(vertexOffsets, edgeOffsets),
      hasMoved: false,
    },
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        wip: Option.Some(state.graph.vertices.byId),
      },
      edges: {
        ...state.graph.edges,
        wip: Option.Some(state.graph.edges.byId),
      },
    },
  };
}

function computeVertexOffsets(
  state: State,
  vertexIds: VertexId[]
): VertexOffsets {
  const mousePos = Sel.mousePos(state);
  const vertices = vertexIds.map(id => state.graph.vertices.byId[id]);
  const offsets: VertexOffset[] = vertices.map(({ id, pos }) => ({
    id,
    mouseOffset: pos.minus(mousePos),
  }));
  return arrayToObj(offsets);
}

function computeEdgeOffsets(state: State, vertexIds: VertexId[]): EdgeOffsets {
  const relevantEdges = Sel.allEdges(state).filter(
    edge =>
      vertexIds.includes(edge.startVertexId) ||
      vertexIds.includes(edge.endVertexId)
  );
  const offsets = relevantEdges.map(edge => computeEdgeOffset(state, edge));
  return arrayToObj(offsets);
}

function computeEdgeOffset(state: State, edge: Edge): EdgeOffset {
  const p = Sel.vertexPos(state, edge.startVertexId);
  const q = Sel.vertexPos(state, edge.endVertexId);
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
}

function reduceMouseDownEdgeControlPt(state: State, action: Action): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.EdgeControlPt(action.payload),
      hasMoved: false,
    },
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        wip: Option.Some(state.graph.edges.byId),
      },
    },
  };
}

function reduceMouseDownNewVertex(state: State): State {
  const newVertex: Vertex = {
    id: Sel.nextVertexId(state),
    name: Sel.nextVertexName(state),
    pos: Sel.mousePos(state),
  };

  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
    },
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        byId: {
          ...state.graph.vertices.byId,
          [newVertex.id]: newVertex,
        },
      },
    },
  };
}

function reduceMouseUp(state: State): State {
  return state.ui.dragSubject.match({
    none: () => state,
    vertices: () => commitVerticesAndEdges(state),
    boxSelection: rootPos => selectVerticesInBoxSelection(state, rootPos),
    edgeControlPt: () => commitEdges(state),
    newVertex: () => state,
  });
}

function selectVerticesInBoxSelection(state: State, rootPos: Vec): State {
  const rect = new Rect(rootPos, Sel.mousePos(state));
  const containedVertexIds = Sel.vertexIdsInRect(state, rect);

  const allSelectedVertexIds = Sel.isMultiSelect(state)
    ? [...Sel.selectedVertexIds(state), ...containedVertexIds]
    : containedVertexIds;

  const selection =
    allSelectedVertexIds.length === 0
      ? Selection.None()
      : Selection.Vertices(allSelectedVertexIds);

  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
      selection,
    },
  };
}

function commitVerticesAndEdges(state: State): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
    },
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

function commitEdges(state: State): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
    },
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
  const mousePos = action.payload;
  const withMousePos = { ...state, ui: { ...state.ui, mousePos } };

  return state.ui.dragSubject.match({
    vertices: (vertexOffsets, edgeOffsets) =>
      updateEdgeAndVertexWips(withMousePos, vertexOffsets, edgeOffsets),
    edgeControlPt: edgeId => updateEdgeWip(withMousePos, edgeId),
    boxSelection: () => withMousePos,
    newVertex: () => withMousePos,
    none: () => withMousePos,
  });
}

function updateEdgeAndVertexWips(
  state: State,
  vertexOffsets: VertexOffsets,
  edgeOffsets: EdgeOffsets
): State {
  const mousePos = Sel.mousePos(state);
  const updatedVertices = Object.values(vertexOffsets).map(
    ({ id, mouseOffset }) => {
      const vertex = state.graph.vertices.byId[id];
      const pos = mousePos.plus(mouseOffset);
      return {
        ...vertex,
        pos,
      };
    }
  );
  const vertexWip: Option<ById<Vertex>> = state.graph.vertices.wip.map(
    byId => ({
      ...byId,
      ...arrayToObj(updatedVertices),
    })
  );

  const updatedEdges = Object.values(edgeOffsets).map(
    ({ id, pqRatio, perpLen }) => {
      const edge = state.graph.edges.byId[id];
      const p = vertexWip.unwrap()[edge.startVertexId].pos;
      const q = vertexWip.unwrap()[edge.endVertexId].pos;
      const pq = q.minus(p);
      const proj = pq.scale(pqRatio);
      const perp = proj.perp().normalize().scale(perpLen);
      const controlPtPos = p.plus(proj).plus(perp);
      return {
        ...edge,
        controlPtPos,
      };
    }
  );
  const edgeWip = state.graph.edges.wip.map(byId => ({
    ...byId,
    ...arrayToObj(updatedEdges),
  }));

  return {
    ...state,
    ui: {
      ...state.ui,
      hasMoved: true,
    },
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        wip: vertexWip,
      },
      edges: {
        ...state.graph.edges,
        wip: edgeWip,
      },
    },
  };
}

function updateEdgeWip(state: State, edgeId: EdgeId): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      hasMoved: true,
    },
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

function reduceAddVertex(state: State): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.NewVertex(),
    },
  };
}

function reduceRemoveVertices(state: State, action: Action): State {
  const vertices = Sel.allVertices(state);
  const selectedVertexIds = action.payload;
  const updatedVertices = vertices.filter(
    v => !selectedVertexIds.includes(v.id)
  );

  const edges = Sel.allEdges(state);
  const updatedEdges = edges.filter(
    e =>
      !selectedVertexIds.includes(e.startVertexId) &&
      !selectedVertexIds.includes(e.endVertexId)
  );
  return {
    ...state,
    ui: {
      ...state.ui,
      selection: Selection.None(),
    },
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        byId: arrayToObj(updatedVertices),
      },
      edges: {
        ...state.graph.edges,
        byId: arrayToObj(updatedEdges),
      },
    },
  };
}

function reduceAddEdge(state: State, action: Action): State {
  const { startVertexId, endVertexId } = action.payload;
  const id = Sel.nextEdgeId(state);
  const startVertexPos = Sel.vertexPos(state, startVertexId);
  const endVertexPos = Sel.vertexPos(state, endVertexId);
  const controlPtPos = endVertexPos
    .minus(startVertexPos)
    .scale(1 / 2)
    .plus(startVertexPos);

  const edge: Edge = {
    id,
    startVertexId,
    endVertexId,
    controlPtPos,
    direction: EdgeDirection.None,
  };

  const byId = {
    ...state.graph.edges.byId,
    [id]: edge,
  };

  return {
    ...state,
    ui: { ...state.ui, selection: Selection.None() },
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        byId,
      },
    },
  };
}

function reduceRemoveEdge(state: State, action: Action): State {
  const edgeId = action.payload;
  const updated = Sel.allEdges(state).filter(e => e.id !== edgeId);
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        byId: arrayToObj(updated),
      },
    },
  };
}

function reduceShiftKeyDown(state: State): State {
  return { ...state, ui: { ...state.ui, isMultiSelect: true } };
}

function reduceKeyUp(state: State): State {
  // TODO Perform whatever other key actions need to be performed here
  return { ...state, ui: { ...state.ui, isMultiSelect: false } };
}

function reduceCancelCurrentAction(state: State): State {
  return {
    ...state,
    ui: {
      ...state.ui,
      dragSubject: DragSubject.None(),
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

function reduceSelectAllVertices(state: State): State {
  const allVertexIds = Sel.allVertices(state).map(({ id }) => id);
  return {
    ...state,
    ui: {
      ...state.ui,
      selection: Selection.Vertices(allVertexIds),
    },
  };
}

function reduceChangeVertexName(state: State, action: Action): State {
  const { vertexId, name } = action.payload;
  const byId = state.graph.vertices.byId;
  const vertex = byId[vertexId];
  const updatedVertices = { ...byId, [vertexId]: { ...vertex, name } };
  return {
    ...state,
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        byId: updatedVertices,
      },
    },
  };
}

function reduceMouseEnterVertex(state: State, action: Action): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        hovered: Option.Some(action.payload),
      },
    },
  };
}

function reduceMouseLeaveVertex(state: State): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      vertices: {
        ...state.graph.vertices,
        hovered: Option.None(),
      },
    },
  };
}

function reduceMouseEnterEdgeControlPt(state: State, action: Action): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        hovered: Option.Some(action.payload),
      },
    },
  };
}

function reduceMouseLeaveEdgeControlPt(state: State): State {
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        hovered: Option.None(),
      },
    },
  };
}

function reduceToggleEdgeDirection(state: State, action: Action): State {
  const edge = Sel.edgeById(state, action.payload);
  const updatedEdge = toggleEdgeDirection(edge);
  return {
    ...state,
    graph: {
      ...state.graph,
      edges: {
        ...state.graph.edges,
        byId: {
          ...state.graph.edges.byId,
          [edge.id]: updatedEdge,
        },
        wip: state.graph.edges.wip.map(byId => ({
          ...byId,
          [edge.id]: updatedEdge,
        })),
      },
    },
  };
}

function toggleEdgeDirection(edge: Edge): Edge {
  switch (edge.direction) {
    case EdgeDirection.None:
      return { ...edge, direction: EdgeDirection.Forward };
    case EdgeDirection.Forward:
      return { ...edge, direction: EdgeDirection.Reverse };
    case EdgeDirection.Reverse:
      return { ...edge, direction: EdgeDirection.None };
  }
}

function reduceCommitCurrentGraphState(state: State): State {
  return {
    ...state,
    undoRedo: state.undoRedo.commit(state.graph),
  };
}

function reduceUndo(state: State): State {
  return state.undoRedo.undo().match({
    none: () => state,
    some: ([graph, undoRedo]) => ({
      ...state,
      ui: {
        ...state.ui,
        selection: undoRedoSelection(state, graph),
      },
      graph,
      undoRedo,
    }),
  });
}

function reduceRedo(state: State): State {
  return state.undoRedo.redo().match({
    none: () => state,
    some: ([graph, undoRedo]) => ({ ...state, graph, undoRedo }),
  });
}

function undoRedoSelection(state: State, graph: GraphState): Selection {
  return Sel.selection(state).match({
    none: () => Sel.selection(state),
    vertices: vertexIds => {
      const allVertexIds = Object.values(graph.vertices.byId).map(
        ({ id }) => id
      );
      return Selection.Vertices(
        vertexIds.filter(id => allVertexIds.includes(id))
      );
    },
  });
}

function reduceOpenGraphOverlay(state: State, action: Action): State {
  return { ...state, overlay: OverlayState.Graph(action.payload) };
}

function reduceOpenErrorsOverlay(state: State, action: Action): State {
  return { ...state, overlay: OverlayState.Errors(action.payload) };
}

function reduceDismissOverlay(state: State): State {
  return { ...state, overlay: OverlayState.None() };
}
