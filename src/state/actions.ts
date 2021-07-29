import { Vec } from '../tools';

export interface Action {
  type: string;
  payload?: any;
}

export enum ActionType {
  MouseDown = 'MouseDown',
  MouseMove = 'MouseMove',
  MouseUp = 'MouseUp',
  MouseEnterVertex = 'MouseEnterVertex',
  MouseLeaveVertex = 'MouseLeaveVertex',
}

export function mouseDown(): Action {
  return { type: ActionType.MouseDown };
}

export function mouseMove(pos: Vec): Action {
  return { type: ActionType.MouseMove, payload: pos };
}

export function mouseUp(): Action {
  return { type: ActionType.MouseUp };
}

export function mouseEnterVertex(vertexId: number): Action {
  return { type: ActionType.MouseEnterVertex, payload: vertexId };
}

export function mouseLeaveVertex(vertexId: number): Action {
  return { type: ActionType.MouseLeaveVertex, payload: vertexId };
}
