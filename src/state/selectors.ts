import { State, Vertex, Edge } from './index';
import { DragSubject, Selection } from './misc';
import { Vec, Option, Rect } from '../tools';
import {
  Action,
  addVertex,
  removeVertices,
  addEdge,
  removeEdge,
} from './actions';
import { VertexId, EdgeId } from './state';
import { VERTEX_RADIUS } from '../Vertex';

export function vertexPos(state: State, vertexId: VertexId): Vec {
  return state.graph.vertices.wip.match({
    none: () => state.graph.vertices.byId[vertexId].pos,
    some: byId => byId[vertexId].pos,
  });
}

export function selectedVertexIds(state: State): VertexId[] {
  return state.ui.selection.match({
    none: () => [],
    vertices: vertexIds => vertexIds,
  });
}

export function mousePos(state: State): Vec {
  return state.ui.mousePos;
}

export function allVertices(state: State): Vertex[] {
  return Object.values(
    state.graph.vertices.wip.match({
      none: () => state.graph.vertices.byId,
      some: byId => byId,
    })
  );
}

export function allEdges(state: State): Edge[] {
  return Object.values(
    state.graph.edges.wip.match({
      none: () => state.graph.edges.byId,
      some: byId => byId,
    })
  );
}

export function isMultiSelect(state: State): boolean {
  return state.ui.isMultiSelect;
}

export function nextVertexId(state: State): VertexId {
  const idsInUse = allVertices(state).map(({ id }) => id);
  return Math.max(0, ...idsInUse) + 1;
}

export function nextEdgeId(state: State): EdgeId {
  const idsInUse = allEdges(state).map(({ id }) => id);
  return Math.max(0, ...idsInUse) + 1;
}

export function newVertexPos(state: State): Option<Vec> {
  return state.ui.dragSubject.isNewVertex()
    ? Option.Some(state.ui.mousePos)
    : Option.None();
}

export function dragSubject(state: State): DragSubject {
  return state.ui.dragSubject;
}

export function isVertexSelected(state: State, vertexId: number): boolean {
  return state.ui.selection.match({
    none: () => false,
    vertices: vertexIds => vertexIds.includes(vertexId),
  });
}

export function isVertexHovered(state: State, vertexId: number): boolean {
  return state.ui.dragSubject.match({
    boxSelection: rootPos => {
      const rect = new Rect(rootPos, mousePos(state));
      const vertex = state.graph.vertices.byId[vertexId];
      return rect.contains(vertex.pos, VERTEX_RADIUS);
    },
    none: () => false,
    vertices: () => false,
    edgeControlPt: () => false,
    newVertex: () => false,
  });
}

export function selection(state: State): Selection {
  return state.ui.selection;
}

export function availableActions(state: State): AppAction[] {
  const addVertexAction = {
    name: 'Add Vertex [a]',
    clickAction: addVertex(),
  };

  return selection(state).match({
    none: () => [addVertexAction],
    vertices: vertexIds => {
      switch (vertexIds.length) {
        case 1:
          return [
            addVertexAction,
            {
              name: 'Remove Vertex [d]',
              clickAction: removeVertices(vertexIds),
            },
          ];
        case 2: {
          const common = [
            addVertexAction,
            {
              name: 'Remove Vertices [d]',
              clickAction: removeVertices(vertexIds),
            },
          ];
          const [vertexId1, vertexId2] = vertexIds;
          const edge = edgeFromEndpoints(state, vertexId1, vertexId2);
          return edge.match({
            some: edge => [
              ...common,
              {
                name: 'Remove Edge [e]',
                clickAction: removeEdge(edge.id),
              },
            ],
            none: () => [
              ...common,
              {
                name: 'Add Edge [e]',
                clickAction: addEdge(vertexId1, vertexId2),
              },
            ],
          });
        }
        default:
          return [
            addVertexAction,
            {
              name: 'Remove Vertices [d]',
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

export function edgeFromEndpoints(
  state: State,
  vertexId1: number,
  vertexId2: number
): Option<Edge> {
  const vertices = [vertexId1, vertexId2];
  const edges = allEdges(state);
  return Option.from(
    edges.find(
      e =>
        vertices.includes(e.startVertexId) && vertices.includes(e.endVertexId)
    )
  );
}

export function vertexIdsInRect(state: State, rect: Rect): VertexId[] {
  const vertices = allVertices(state);
  return vertices
    .filter(vertex => rect.contains(vertex.pos, VERTEX_RADIUS))
    .map(({ id }) => id);
}
