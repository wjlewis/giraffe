import { State, Vertex, Edge } from './index';
import { DragSubject, Selection, HoverTarget } from './misc';
import { Rect, Vec, Option } from '../tools';
import {
  Action,
  addVertex,
  removeVertices,
  addEdge,
  removeEdge,
} from './actions';

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
        edgeControlPt: () => false,
      }),
    vertex: vertexId1 => dragSubject.isNone() && vertexId1 === vertexId,
    edgeControlPt: () => false,
    newVertex: () => false,
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

export function selectHoverTarget(state: State): HoverTarget {
  return state.ui.hoverTarget;
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

export function selectAvailableActions(state: State): AppAction[] {
  const addVertexAction = {
    name: 'Add Vertex',
    clickAction: addVertex(),
  };

  return selectSelection(state).match({
    none: () => [addVertexAction],
    vertices: vertexIds => {
      switch (vertexIds.length) {
        case 1:
          return [
            addVertexAction,
            {
              name: 'Remove Vertex',
              clickAction: removeVertices(vertexIds),
            },
          ];
        case 2: {
          const common = [
            addVertexAction,
            {
              name: 'Remove Vertices',
              clickAction: removeVertices(vertexIds),
            },
          ];
          const [vertexId1, vertexId2] = vertexIds;
          const edge = selectEdgeFromEndpoints(state, vertexId1, vertexId2);
          return edge.match({
            some: edge => [
              ...common,
              {
                name: 'Remove Edge',
                clickAction: removeEdge(edge.id),
              },
            ],
            none: () => [
              ...common,
              {
                name: 'Add Edge',
                clickAction: addEdge(vertexId1, vertexId2),
              },
            ],
          });
        }
        default:
          return [
            addVertexAction,
            {
              name: 'Remove Vertices',
              clickAction: removeVertices(vertexIds),
            },
          ];
      }
    },
  });
}

export interface AppAction {
  name: string;
  clickAction: Action;
}

export function selectEdgeFromEndpoints(
  state: State,
  vertexId1: number,
  vertexId2: number
): Option<Edge> {
  const vertices = [vertexId1, vertexId2];
  const edges = selectEdges(state);
  return Option.from(
    edges.find(
      e =>
        vertices.includes(e.startVertexId) && vertices.includes(e.endVertexId)
    )
  );
}

export function selectNextVertexId(state: State): number {
  const vertices = selectVertices(state);
  const ids = vertices.map(v => v.id);
  return Math.max(...ids) + 1;
}

export function selectNewVertexPos(state: State): Option<Vec> {
  return selectHoverTarget(state).match({
    canvas: () => Option.None(),
    vertex: () => Option.None(),
    edgeControlPt: () => Option.None(),
    newVertex: () => Option.Some(selectMousePos(state)),
  });
}

export function selectNextEdgeId(state: State): number {
  const edges = selectEdges(state);
  const ids = edges.map(e => e.id);
  return Math.max(...ids) + 1;
}
