import { Vec } from '../tools';
import { KeyDownInfo } from '../hooks';

export interface Action {
  type: string;
  payload?: any;
}

export enum ActionType {
  MouseDownCanvas = 'MouseDownCanvas',
  MouseDownVertex = 'MouseDownVertex',
  MouseDownEdgeControlPt = 'MouseDownEdgeControlPt',
  MouseDownNewVertex = 'MouseDownNewVertex',
  MouseMove = 'MouseMove',
  MouseUp = 'MouseUp',
  KeyDown = 'KeyDown',
  KeyUp = 'KeyUp',
  AddVertex = 'AddVertex',
  RemoveVertices = 'RemoveVertices',
  AddEdge = 'AddEdge',
  RemoveEdge = 'RemoveEdge',

  // More specific keyboard actions
  ShiftKeyDown = 'ShiftKeyDown',
  CancelCurrentAction = 'CancelCurrentAction',
  SelectAllVertices = 'SelectAllVertices',
}

export function mouseDownCanvas(): Action {
  return { type: ActionType.MouseDownCanvas };
}

export function mouseDownVertex(vertexId: number): Action {
  return { type: ActionType.MouseDownVertex, payload: vertexId };
}

export function mouseDownEdgeControlPt(edgeId: number): Action {
  return { type: ActionType.MouseDownEdgeControlPt, payload: edgeId };
}

export function mouseDownNewVertex(): Action {
  return { type: ActionType.MouseDownNewVertex };
}

export function mouseMove(pos: Vec): Action {
  return { type: ActionType.MouseMove, payload: pos };
}

export function mouseUp(): Action {
  return { type: ActionType.MouseUp };
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

export function cancelCurrentAction(): Action {
  return { type: ActionType.CancelCurrentAction };
}

export function selectAllVertices(): Action {
  return { type: ActionType.SelectAllVertices };
}
