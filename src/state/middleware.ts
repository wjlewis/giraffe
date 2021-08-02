import React from 'react';
import { State } from './index';
import { Action, ActionType, shiftKeyDown } from './actions';

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
      if (
        action.type === ActionType.KeyDown &&
        action.payload.key === 'Shift'
      ) {
        return dispatch(shiftKeyDown());
      }

      return dispatch(action);
    };
  };
}
