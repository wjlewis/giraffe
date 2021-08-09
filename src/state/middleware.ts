import React from 'react';
import { State } from './index';
import { Action, ActionType } from './actions';
import * as Act from './actions';
import * as Sel from './selectors';

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
          case 'Delete':
          case 'Backspace':
          case 'd':
            return Sel.selection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => dispatch(Act.removeVertices(vertexIds)),
            });
          case 'e':
            return Sel.selection(state).match({
              none: () => dispatch(action),
              vertices: vertexIds => {
                if (vertexIds.length === 2) {
                  const [startVertexId, endVertexId] = vertexIds;
                  return Sel.edgeFromEndpoints(
                    state,
                    startVertexId,
                    endVertexId
                  ).match({
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
          case 'z':
            if (action.payload.ctrlKey || action.payload.metaKey) {
              return dispatch(Act.undo());
            } else {
              return dispatch(action);
            }
          case 'y':
          case 'Z':
            if (action.payload.ctrlKey || action.payload.metaKey) {
              return dispatch(Act.redo());
            } else {
              return dispatch(action);
            }
          default:
            return dispatch(action);
        }
      } else {
        return dispatch(action);
      }
    };
  };
}

export function commitGraph(): Middleware<State, Action> {
  return (state: State, dispatch: React.Dispatch<Action>) => {
    return (action: Action) => {
      switch (action.type) {
        case ActionType.MouseDownNewVertex:
        case ActionType.AddEdge:
        case ActionType.RemoveVertices:
        case ActionType.RemoveEdge:
        case ActionType.ToggleEdgeDirection:
          dispatch(action);
          return dispatch(Act.commitCurrentGraphState());
        case ActionType.MouseUp:
          if (Sel.hasMoved(state)) {
            dispatch(action);
            return dispatch(Act.commitCurrentGraphState());
          } else {
            return dispatch(action);
          }
        default:
          return dispatch(action);
      }
    };
  };
}
