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
      <circle
        cx={pos.x}
        cy={pos.y}
        r={VERTEX_RADIUS}
        onMouseDown={handleMouseDown}
        strokeWidth="2"
        className="new-vertex"
      />
    ),
  });
};

export default NewVertex;
