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
  MouseEnterEdgeControlPt = 'MouseEnterEdgeControlPt',
  MouseLeaveEdgeControlPt = 'MouseLeaveEdgeControlPt',
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

export function mouseEnterEdgeControlPt(edgeId: number): Action {
  return { type: ActionType.MouseEnterEdgeControlPt, payload: edgeId };
}

export function mouseLeaveEdgeControlPt(edgeId: number): Action {
  return { type: ActionType.MouseLeaveEdgeControlPt, payload: edgeId };
}
