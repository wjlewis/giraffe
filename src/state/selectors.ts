import { State, Vertex, Edge } from './index';
import { DragSubject, Selection } from './misc';
import { Vec, Option, Result, Rect, dups } from '../tools';
import {
  Action,
  addVertex,
  removeVertices,
  addEdge,
  removeEdge,
} from './actions';
import { VertexId, EdgeId, EdgeDirection } from './state';
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

export function isVertexInBoxSelection(
  state: State,
  vertexId: number
): boolean {
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

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(
  ''
);

export function nextVertexName(state: State): string {
  const namesInUse = allVertices(state).map(({ name }) => name);
  const unusedSingles = ALPHABET.filter(c => !namesInUse.includes(c));
  if (unusedSingles.length > 0) {
    return unusedSingles[0];
  } else {
    // In practice, this should never happen, so it's alright if it's a little slow
    for (let suffix = 0; suffix <= 9; suffix++) {
      const alpha = ALPHABET.map(c => `${c}${suffix}`);
      const unused = alpha.filter(n => !namesInUse.includes(n));
      if (unused.length > 0) {
        return unused[0];
      }
    }

    return '';
  }
}

export function hasDuplicatedName(state: State, vertexId: VertexId): boolean {
  const vertexName = state.graph.vertices.byId[vertexId].name;
  return Boolean(
    allVertices(state).find(
      ({ id, name }) => id !== vertexId && name === vertexName
    )
  );
}

export function isVertexHovered(state: State, vertexId: VertexId): boolean {
  return state.graph.vertices.hovered.match({
    none: () => false,
    some: vertexId1 => vertexId1 === vertexId,
  });
}

export function isEdgeControlPtHovered(state: State, edgeId: EdgeId): boolean {
  return state.graph.edges.hovered.match({
    none: () => false,
    some: edgeId1 => edgeId1 === edgeId,
  });
}

export function hasMoved(state: State): boolean {
  return state.ui.hasMoved;
}

export function vertexById(state: State, vertexId: VertexId): Vertex {
  return state.graph.vertices.wip.match({
    none: () => state.graph.vertices.byId[vertexId],
    some: byId => byId[vertexId],
  });
}

export function edgeById(state: State, edgeId: EdgeId): Edge {
  return state.graph.edges.wip.match({
    none: () => state.graph.edges.byId[edgeId],
    some: byId => byId[edgeId],
  });
}

export function exportMathematica(state: State): Result<string, string[]> {
  const duplicates = duplicateVertexNames(state);
  const missing = missingVertexNameCount(state);

  const errors = [];
  if (duplicates.length > 0) {
    if (duplicates.length === 1) {
      errors.push(`The name "${duplicates[0]}" is used more than once`);
    } else {
      const duplicateNames = duplicates.map(name => `"${name}"`).join(', ');
      errors.push(`The names ${duplicateNames} are used more than once`);
    }
  }
  if (missing > 0) {
    if (missing === 1) {
      errors.push(`1 vertex is missing a name`);
    } else {
      errors.push(`${missing} vertices are missing names`);
    }
  }
  if (errors.length > 0) {
    return Result.Err(errors);
  }

  const edges = allEdges(state);
  const formatted = edges.map(e => {
    const start = vertexById(state, e.startVertexId);
    const end = vertexById(state, e.endVertexId);
    switch (e.direction) {
      case EdgeDirection.None:
        return `${start.name} <-> ${end.name}`;
      case EdgeDirection.Forward:
        return `${start.name} -> ${end.name}`;
      case EdgeDirection.Reverse:
        return `${end.name} -> ${start.name}`;
    }
    // Linter appeasement
    return '';
  });

  return Result.Ok(
    `Graph[{ ${formatted.join(', ')} }, VertexLabels -> "Name"]`
  );
}

function duplicateVertexNames(state: State): string[] {
  const vertexNames = allVertices(state).map(({ name }) => name);
  // We'll account for missing names separately
  return dups(vertexNames).filter(name => name.length > 0);
}

function missingVertexNameCount(state: State): number {
  const vertexNames = allVertices(state).map(({ name }) => name);
  return vertexNames.filter(name => name.length === 0).length;
}
