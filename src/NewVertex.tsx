import React from 'react';
import { StateContext, selectNewVertexPos } from './state';

const NewVertex: React.FC<{}> = () => {
  const { state } = React.useContext(StateContext);

  return selectNewVertexPos(state).match({
    none: () => null,
    some: pos => (
      <circle cx={pos.x} cy={pos.y} r="15" stroke="#999" fill="#fff" />
    ),
  });
};

export default NewVertex;
