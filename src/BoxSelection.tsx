import React from 'react';
import * as St from './state';
import { Rect } from './tools';

const BoxSelection: React.FC<{}> = () => {
  const { state } = React.useContext(St.StateContext);

  return St.dragSubject(state).match({
    boxSelection: rootPos => {
      const rect = new Rect(rootPos, St.mousePos(state));

      return (
        <rect
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          className="box-selection"
        />
      );
    },
    none: () => null,
    vertices: () => null,
    edgeControlPt: () => null,
    newVertex: () => null,
  });
};

export default BoxSelection;
