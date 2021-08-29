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

export function useMousePos<E extends HTMLElement>(
  ref: React.RefObject<E>,
  onMove: (pos: Vec) => unknown
) {
  const [bounds, setBounds] = React.useState({ left: 0, top: 0 });

  React.useEffect(() => {
    if (ref.current) {
      const { left, top } = ref.current.getBoundingClientRect();
      setBounds({ left, top });
    }
  }, [ref, setBounds]);

  React.useEffect(() => {
    const { left, top } = bounds;

    function handleMouseMove(e: MouseEvent) {
      onMove(new Vec(e.clientX - left, e.clientY - top));
    }

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [bounds, onMove]);
}

export function useKeyboard(handlers: UseKeyboard) {
  const { onKeyDown = noOp, onKeyUp = noOp } = handlers;

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.currentTarget !== e.target) {
        return;
      }

      const { key, ctrlKey, metaKey } = e;
      onKeyDown({ key, ctrlKey, metaKey });
    }

    function handleKeyUp() {
      onKeyUp();
    }

    document.body.addEventListener('keydown', handleKeyDown);
    document.body.addEventListener('keyup', handleKeyUp);

    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('keyup', handleKeyUp);
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

export function useBounds<E extends HTMLElement>(
  ref: React.RefObject<E>
): Bounds {
  const [bounds, setBounds] = React.useState({ width: 0, height: 0 });

  const recomputeBounds = React.useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      return setBounds({ width, height });
    }
  }, [ref]);

  React.useLayoutEffect(() => {
    recomputeBounds();
  }, [recomputeBounds]);

  React.useEffect(() => {
    window.addEventListener('resize', recomputeBounds);

    return () => window.removeEventListener('resize', recomputeBounds);
  }, [recomputeBounds]);

  return bounds;
}

export interface Bounds {
  width: number;
  height: number;
}
