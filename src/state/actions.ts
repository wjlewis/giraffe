import { Vec } from '../tools';
import { KeyDownInfo } from '../hooks';

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
  KeyDown = 'KeyDown',
  KeyUp = 'KeyUp',

  AddVertex = 'AddVertex',
  RemoveVertices = 'RemoveVertices',
  AddEdge = 'AddEdge',
  RemoveEdge = 'RemoveEdge',

  // More specific keyboard actions
  ShiftKeyDown = 'ShiftKeyDown',
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

export function keyDown(info: KeyDownInfo): Action {
  return { type: ActionType.KeyDown, payload: info };
}

export function keyUp(): Action {
  return { type: ActionType.KeyUp };
}

export function shiftKeyDown(): Action {
  return { type: ActionType.ShiftKeyDown };
}

export function addVertex(): Action {
  return { type: ActionType.AddVertex };
}

export function removeVertices(vertexIds: number[]): Action {
  return { type: ActionType.RemoveVertices, payload: vertexIds };
}

export function addEdge(startVertexId: number, endVertexId: number): Action {
  return { type: ActionType.AddEdge, payload: { startVertexId, endVertexId } };
}

export function removeEdge(edgeId: number): Action {
  return { type: ActionType.RemoveEdge, payload: edgeId };
}
