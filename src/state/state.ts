import React from 'react';
import { Action } from './actions';
import { Vec, Option } from '../tools';
import { DragSubject, Selection, UndoRedo, OverlayState } from './misc';

export const StateContext = React.createContext({
  state: null as any as State,
  dispatch: null as any as React.Dispatch<Action>,
});

export interface State {
  ui: UIState;
  graph: GraphState;
  overlay: OverlayState;
  undoRedo: UndoRedo<GraphState>;
}

export interface UIState {
  mousePos: Vec;
  selection: Selection;
  dragSubject: DragSubject;
  isMultiSelect: boolean;
  hasMoved: boolean;
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
  direction: EdgeDirection;
}

export enum EdgeDirection {
  None = 'None',
  Forward = 'Forward',
  Reverse = 'Reverse',
}

const initGraph: GraphState = {
  vertices: {
    byId: {
      1: {
        id: 1,
        name: 'a',
        pos: new Vec(-298.33331298828125, -125.08334350585938),
      },
      2: {
        id: 2,
        name: 'b',
        pos: new Vec(51.66668701171875, -211.08334350585938),
      },
      3: {
        id: 3,
        name: 'c',
        pos: new Vec(209.66668701171875, 66.91665649414062),
      },
      4: {
        id: 4,
        name: 'd',
        pos: new Vec(-147.33331298828125, 160.91665649414062),
      },
    },
    wip: Option.None(),
    hovered: Option.None(),
  },
  edges: {
    byId: {
      1: {
        id: 1,
        startVertexId: 1,
        endVertexId: 4,
        controlPtPos: new Vec(-299.33331298828125, 43.91665649414061),
        direction: EdgeDirection.Reverse,
      },
      2: {
        id: 2,
        startVertexId: 1,
        endVertexId: 2,
        controlPtPos: new Vec(-159.5464273137012, -233.6503719672334),
        direction: EdgeDirection.Forward,
      },
      3: {
        id: 3,
        startVertexId: 2,
        endVertexId: 3,
        controlPtPos: new Vec(204.41999697432448, -86.65044718436185),
        direction: EdgeDirection.Forward,
      },
      4: {
        id: 4,
        startVertexId: 3,
        endVertexId: 4,
        controlPtPos: new Vec(63.526792958632, 177.73087032210645),
        direction: EdgeDirection.Forward,
      },
      5: {
        id: 5,
        startVertexId: 2,
        endVertexId: 4,
        controlPtPos: new Vec(-47.83331298828125, -25.083343505859375),
        direction: EdgeDirection.None,
      },
    },
    wip: Option.None(),
    hovered: Option.None(),
  },
};

export const initState: State = {
  ui: {
    mousePos: new Vec(0, 0),
    selection: Selection.None(),
    dragSubject: DragSubject.None(),
    isMultiSelect: false,
    hasMoved: false,
  },
  graph: initGraph,
  overlay: OverlayState.None(),
  undoRedo: new UndoRedo(initGraph),
};

export type VertexId = number;
export type EdgeId = number;
