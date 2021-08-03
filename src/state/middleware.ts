import React from 'react';
import { State } from './index';
import {
  Action,
  ActionType,
  shiftKeyDown,
  addVertex,
  removeVertices,
  addEdge,
  removeEdge,
  cancelCurrentAction,
} from './actions';
import * as sel from './selectors';

export interface Middleware<St, A> {
  (state: St, next: React.Dispatch<A>): React.Dispatch<A>;
}

export function logActions(...exclude: string[]): Middleware<State, Action> {
  return (state: State, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      if (!exclude.includes(action.type)) {
        console.log(JSON.stringify(action, null, 2));
      }

      return dispatch(action);
    };
  };
}

export function dispatchKeyEvents(): Middleware<State, Action> {
  return (state: State, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      if (action.type === ActionType.KeyDown) {
        switch (action.payload.key) {
          case 'Shift':
            return dispatch(shiftKeyDown());
          case 'a':
            return dispatch(addVertex());
          // TODO Consolidate this logic?
          case 'd':
            return sel.selectSelection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => dispatch(removeVertices(vertexIds)),
            });
          // TODO Consolidate?
          case 'e':
            return sel.selectSelection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => {
                if (vertexIds.length === 2) {
                  const [startVertexId, endVertexId] = vertexIds;
                  return sel
                    .selectEdgeFromEndpoints(state, startVertexId, endVertexId)
                    .match({
                      none: () => dispatch(addEdge(startVertexId, endVertexId)),
                      some: edge => dispatch(removeEdge(edge.id)),
                    });
                } else {
                  return dispatch(action);
                }
              },
            });
          case 'Escape':
            return dispatch(cancelCurrentAction());
          default:
            return dispatch(action);
        }
      } else {
        return dispatch(action);
      }
    };
  };
}
