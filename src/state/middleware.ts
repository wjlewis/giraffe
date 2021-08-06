import React from 'react';
import { State } from './index';
import { Action, ActionType } from './actions';
import * as Act from './actions';
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
            return dispatch(Act.shiftKeyDown());
          case 'a':
            if (action.payload.ctrlKey || action.payload.metaKey) {
              return dispatch(Act.selectAllVertices());
            } else {
              return dispatch(Act.addVertex());
            }
          case 'd':
            return sel.selection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => dispatch(Act.removeVertices(vertexIds)),
            });
          case 'e':
            return sel.selection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => {
                if (vertexIds.length === 2) {
                  const [startVertexId, endVertexId] = vertexIds;
                  return sel
                    .edgeFromEndpoints(state, startVertexId, endVertexId)
                    .match({
                      none: () =>
                        dispatch(Act.addEdge(startVertexId, endVertexId)),
                      some: edge => dispatch(Act.removeEdge(edge.id)),
                    });
                } else {
                  return dispatch(action);
                }
              },
            });
          case 'Escape':
            return dispatch(Act.cancelCurrentAction());
          default:
            return dispatch(action);
        }
      } else {
        return dispatch(action);
      }
    };
  };
}
