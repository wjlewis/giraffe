import React from 'react';
import { Vec, noOp } from './tools';
import { Middleware } from './state';

export function useReducer<St, A>(
  reducer: React.Reducer<St, A>,
  initState: St,
  ...middlewares: Middleware<St, A>[]
): [St, React.Dispatch<A>] {
  let [state, dispatch] = React.useReducer(reducer, initState);

  middlewares = [...middlewares];
  middlewares.reverse();
  middlewares.forEach(middleware => {
    dispatch = middleware(state, dispatch);
  });

  return [state, dispatch];
}

export function useMouse<T extends HTMLElement>(
  cfg: UseCursor
): React.RefObject<T> {
  const [bounds, setBounds] = React.useState({ left: 0, top: 0 });
  const hostRef: React.RefObject<T> = React.useRef(null);

  const { onMouseDown = noOp, onMouseMove = noOp, onMouseUp = noOp } = cfg;

  React.useEffect(() => {
    if (hostRef.current) {
      const { left, top } = hostRef.current.getBoundingClientRect();
      setBounds({ left, top });
    }
  }, [hostRef, setBounds]);

  React.useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      onMouseDown();
    }

    const current = hostRef.current;
    current?.addEventListener('mousedown', handleMouseDown);
    return () => current?.removeEventListener('mousedown', handleMouseDown);
  }, [hostRef, onMouseDown]);

  React.useEffect(() => {
    const { left, top } = bounds;

    function handleMouseMove(e: MouseEvent) {
      onMouseMove(new Vec(e.clientX - left, e.clientY - top));
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [bounds, onMouseMove]);

  React.useEffect(() => {
    function handleMouseUp(e: MouseEvent) {
      onMouseUp();
    }

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [onMouseUp]);

  return hostRef;
}

export interface UseCursor {
  onMouseDown?: () => unknown;
  onMouseMove?: (pos: Vec) => unknown;
  onMouseUp?: () => unknown;
}
