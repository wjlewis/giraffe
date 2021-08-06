import React from 'react';
import * as St from './state';
import { VERTEX_RADIUS } from './Vertex';

const NewVertex: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(St.StateContext);

  function handleMouseDown() {
    return dispatch(St.mouseDownNewVertex());
  }

  return St.newVertexPos(state).match({
    none: () => null,
    some: pos => (
      <g
        transform={`translate(${pos.x - VERTEX_RADIUS} ${
          pos.y - VERTEX_RADIUS
        })`}
        onMouseDown={handleMouseDown}
        className="new-vertex"
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
    ),
  });
};

export default NewVertex;
