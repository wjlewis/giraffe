import React from 'react';
import { Vec } from './tools';
import {
  StateContext,
  mouseEnterVertex,
  mouseLeaveVertex,
  isVertexSelected,
  isVertexHovered,
} from './state';

export interface VertexProps {
  id: number;
  name: string;
  pos: Vec;
}

const Vertex: React.FC<VertexProps> = props => {
  const { state, dispatch } = React.useContext(StateContext);
  const { id, pos } = props;

  const isSelected = isVertexSelected(state, id);
  const isHovered = isVertexHovered(state, id);

  function handleMouseEnter() {
    dispatch(mouseEnterVertex(id));
  }

  function handleMouseLeave() {
    dispatch(mouseLeaveVertex(id));
  }

  return (
    <circle
      className="vertex"
      cx={pos.x}
      cy={pos.y}
      r="15"
      stroke="#444"
      strokeWidth={isHovered ? 3 : 1}
      fill={isSelected ? 'red' : '#fff'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default Vertex;
