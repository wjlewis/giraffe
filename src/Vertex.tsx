import React from 'react';
import { Vec } from './tools';
import * as St from './state';

export const VERTEX_RADIUS = 15;

export interface VertexProps {
  id: number;
  name: string;
  pos: Vec;
}

const Vertex: React.FC<VertexProps> = props => {
  const { state, dispatch } = React.useContext(St.StateContext);
  const { id, pos } = props;

  const isSelected = St.isVertexSelected(state, id);
  const isHovered = St.isVertexHovered(state, id);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.currentTarget !== e.target) {
      return;
    }

    return dispatch(St.mouseDownVertex(id));
  }

  return (
    <circle
      className="vertex"
      cx={pos.x}
      cy={pos.y}
      r={VERTEX_RADIUS}
      stroke="#444"
      strokeWidth={isHovered ? 3 : 1}
      fill={isSelected ? 'red' : '#fff'}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Vertex;
