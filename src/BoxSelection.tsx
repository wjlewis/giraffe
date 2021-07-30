import React from 'react';
import { StateContext, selectMousePos, selectDragSubject } from './state';
import { Rect } from './tools';

const BoxSelection: React.FC<{}> = () => {
  const { state } = React.useContext(StateContext);
  const dragSubject = selectDragSubject(state);

  return dragSubject.match({
    boxSelection: rootPos => {
      const mousePos = selectMousePos(state);
      const rect = new Rect(rootPos, mousePos);

      return (
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke="none"
          fill="rgba(0, 255, 0, 0.3)"
        />
      );
    },
    none: () => null,
    vertices: () => null,
    edgeControlPt: () => null,
  });
};

export default BoxSelection;
