import React from 'react';
import * as St from './state';
import { Vec, classNames } from './tools';

export interface EdgeProps {
  id: number;
  startVertexId: number;
  endVertexId: number;
  controlPtPos: Vec;
}

const Edge: React.FC<EdgeProps> = props => {
  const { state, dispatch } = React.useContext(St.StateContext);
  const [hovered, setHovered] = React.useState(false);

  const { startVertexId, endVertexId, controlPtPos: c, id } = props;
  const p = St.vertexPos(state, startVertexId);
  const q = St.vertexPos(state, endVertexId);

  const pq = q.minus(p);
  const m = pq.scale(1 / 2);
  const pc = c.minus(p);
  const l = p.plus(pc.scale(2)).minus(m);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.currentTarget !== e.target) {
      return;
    }

    return dispatch(St.mouseDownEdgeControlPt(id));
  }

  function handleMouseEnter() {
    setHovered(true);
  }

  function handleMouseLeave() {
    setHovered(false);
  }

  return (
    <g>
      <path
        className="edge-path"
        d={`M ${p.x} ${p.y} Q ${l.x} ${l.y}, ${q.x} ${q.y}`}
        strokeWidth="2"
        fill="none"
      />
      <g onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <circle cx={c.x} cy={c.y} r="12" fill="transparent" />
        <circle
          className={classNames('edge-control-point', { hovered })}
          cx={c.x}
          cy={c.y}
          r={hovered ? 14 : 4}
          onMouseDown={handleMouseDown}
        />
      </g>
    </g>
  );
};

export default Edge;
