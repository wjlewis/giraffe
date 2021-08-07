import React from 'react';
import { Action } from './actions';
import { Vec, Option } from '../tools';
import { DragSubject, Selection } from './misc';

export const StateContext = React.createContext({
  state: null as any as State,
  dispatch: null as any as React.Dispatch<Action>,
});

export interface State {
  ui: UIState;
  graph: GraphState;
}

export interface UIState {
  mousePos: Vec;
  selection: Selection;
  dragSubject: DragSubject;
  isMultiSelect: boolean;
}

export interface GraphState {
  vertices: {
    byId: ById<Vertex>;
    wip: Option<ById<Vertex>>;
    hovered: Option<VertexId>;
  };
  edges: {
    byId: ById<Edge>;
    wip: Option<ById<Edge>>;
    hovered: Option<EdgeId>;
  };
}

export interface ById<A> {
  [id: number]: A;
}

export interface Vertex {
  id: VertexId;
  name: string;
  pos: Vec;
}

export interface Edge {
  id: EdgeId;
  startVertexId: VertexId;
  endVertexId: VertexId;
  controlPtPos: Vec;
}

export const initState: State = {
  ui: {
    mousePos: new Vec(0, 0),
    selection: Selection.None(),
    dragSubject: DragSubject.None(),
    isMultiSelect: false,
  },
  graph: {
    vertices: {
      byId: {},
      wip: Option.None(),
      hovered: Option.None(),
    },
    edges: {
      byId: {},
      wip: Option.None(),
      hovered: Option.None(),
    },
  },
};

export type VertexId = number;
export type EdgeId = number;
