import React from 'react';
import { Vec, classNames } from './tools';
import { StateContext } from './state';
import * as St from './state';

export const VERTEX_RADIUS = 15;

export interface VertexProps {
  id: number;
  name: string;
  pos: Vec;
}

const Vertex: React.FC<VertexProps> = props => {
  const { state, dispatch } = React.useContext(StateContext);
  const { id, name, pos } = props;

  const isSelected = St.isVertexSelected(state, id);
  const isInBoxSelection = St.isVertexInBoxSelection(state, id);
  const isHovered = St.isVertexHovered(state, id);
  const hasDuplicatedName = St.hasDuplicatedName(state, id);
  const isMissingName = name.length === 0;

  function handleMouseDown() {
    return dispatch(St.mouseDownVertex(id));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    return dispatch(St.changeVertexName(id, e.target.value));
  }

  function handleMouseEnter() {
    return dispatch(St.mouseEnterVertex(id));
  }

  function handleMouseLeave() {
    return dispatch(St.mouseLeaveVertex());
  }

  const scale = isHovered ? 1.5 : 1;
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
          className={classNames('vertex-name-input', {
            duplicate: hasDuplicatedName,
            missing: isMissingName,
          })}
          type="text"
          maxLength={2}
          value={name}
          // This placeholder only appears if the name is missing
          placeholder="!"
          onChange={handleNameChange}
        />
      </foreignObject>

      <g
        className={classNames('vertex', {
          hovered: isInBoxSelection,
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
