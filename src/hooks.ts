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

export function useMousePos<T extends HTMLElement>(
  onMove: (pos: Vec) => unknown
): React.RefObject<T> {
  const [bounds, setBounds] = React.useState({ left: 0, top: 0 });
  const hostRef: React.RefObject<T> = React.useRef(null);

  React.useEffect(() => {
    if (hostRef.current) {
      const { left, top } = hostRef.current.getBoundingClientRect();
      setBounds({ left, top });
    }
  }, [hostRef, setBounds]);

  React.useEffect(() => {
    const { left, top } = bounds;

    function handleMouseMove(e: MouseEvent) {
      onMove(new Vec(e.clientX - left, e.clientY - top));
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [bounds, onMove]);

  return hostRef;
}

export function useKeyboard(handlers: UseKeyboard) {
  const { onKeyDown = noOp, onKeyUp = noOp } = handlers;
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const { key, ctrlKey, metaKey } = e;
      onKeyDown({ key, ctrlKey, metaKey });
    }

    function handleKeyUp() {
      onKeyUp();
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [onKeyDown, onKeyUp]);
}

export interface UseKeyboard {
  onKeyDown?: (info: KeyDownInfo) => unknown;
  onKeyUp?: () => unknown;
}

export interface KeyDownInfo {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
}
