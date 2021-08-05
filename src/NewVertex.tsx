import React from 'react';
import * as St from './state';
import { VERTEX_RADIUS } from './Vertex';

const NewVertex: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(St.StateContext);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.currentTarget !== e.target) {
      return;
    }

    return dispatch(St.mouseDownNewVertex());
  }

  return St.newVertexPos(state).match({
    none: () => null,
    some: pos => (
      <circle
        cx={pos.x}
        cy={pos.y}
        r={VERTEX_RADIUS}
        stroke="#999"
        fill="#fff"
        onMouseDown={handleMouseDown}
      />
    ),
  });
};

export default NewVertex;
