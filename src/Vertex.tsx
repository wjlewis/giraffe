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
  const { id, pos } = props;

  const isSelected = St.isVertexSelected(state, id);
  const isHovered = St.isVertexHovered(state, id);

  function handleMouseDown() {
    return dispatch(St.mouseDownVertex(id));
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
      <g
        transform={`translate(${pos.x - radius} ${
          pos.y - radius
        }) scale(${scale})`}
      >
        <path
          className="vertex-inner"
          d="M 16,1.5503128 A 14.092136,13.606801 0 0 1 30.092041,15.157183 14.092136,13.606801 0 0 1 16,28.764152 14.092136,13.606801 0 0 1 1.9079589,15.157183 14.092136,13.606801 0 0 1 16,1.5503128 Z"
        />
        <path
          className="vertex-outer"
          d="M 16,0.99999799 A 15.000002,14.999985 0 0 0 1,15.999998 a 15.000002,14.999985 0 0 0 15,15 15.000002,14.999985 0 0 0 15,-15 A 15.000002,14.999985 0 0 0 16,0.99999799 Z M 16,1.981373 A 13.645704,13.175745 0 0 1 29.645612,15.157185 13.645704,13.175745 0 0 1 16,28.333092 13.645704,13.175745 0 0 1 2.3543875,15.157185 13.645704,13.175745 0 0 1 16,1.981373 Z"
        />
      </g>
    </g>
  );
};

export default Vertex;
