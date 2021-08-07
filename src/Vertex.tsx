import React from 'react';
import { Vec, classNames } from './tools';
import * as St from './state';

export const VERTEX_RADIUS = 15;

export interface VertexProps {
  id: number;
  name: string;
  pos: Vec;
}

const Vertex: React.FC<VertexProps> = props => {
  const { state, dispatch } = React.useContext(St.StateContext);
  const [hovered, setHovered] = React.useState(false);
  const { id, name, pos } = props;

  const isSelected = St.isVertexSelected(state, id);
  const isHovered = St.isVertexHovered(state, id);

  function handleMouseDown() {
    return dispatch(St.mouseDownVertex(id));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    return dispatch(St.changeVertexName(id, e.target.value));
  }

  function handleMouseEnter() {
    setHovered(true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  const scale = hovered ? 1.5 : 1;
  const radius = scale * VERTEX_RADIUS;

  return (
    <g>
      <foreignObject
        x={pos.x - VERTEX_RADIUS}
        y={pos.y + radius}
        width="2em"
        height="2em"
      >
        <input
          className="vertex-name-input"
          type="text"
          maxLength={2}
          value={name}
          onChange={handleNameChange}
        />
      </foreignObject>

      <g
        className={classNames('vertex', {
          hovered: isHovered,
          selected: isSelected,
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
      >
        <circle
          cx={pos.x}
          cy={pos.y}
          r={1.5 * VERTEX_RADIUS}
          fill="transparent"
        />
        <circle
          className="vertex-dot"
          cx={pos.x}
          cy={pos.y}
          r={radius}
          strokeWidth="2"
        />
      </g>
    </g>
  );
};

export default Vertex;
