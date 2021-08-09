import React from 'react';
import { StateContext, EdgeDirection } from './state';
import * as St from './state';
import { Vec } from './tools';

export interface EdgeProps {
  id: number;
  startVertexId: number;
  endVertexId: number;
  controlPtPos: Vec;
  direction: EdgeDirection;
}

const Edge: React.FC<EdgeProps> = props => {
  const { state, dispatch } = React.useContext(StateContext);

  const { startVertexId, endVertexId, controlPtPos: c, id, direction } = props;
  const p = St.vertexPos(state, startVertexId);
  const q = St.vertexPos(state, endVertexId);

  const pq = q.minus(p);
  const m = pq.scale(1 / 2);
  const pc = c.minus(p);
  const l = p.plus(pc.scale(2)).minus(m);

  const isHovered = St.isEdgeControlPtHovered(state, id);

  function handleMouseDown() {
    return dispatch(St.mouseDownEdgeControlPt(id));
  }

  function handleMouseEnter() {
    return dispatch(St.mouseEnterEdgeControlPt(id));
  }

  function handleMouseLeave() {
    return dispatch(St.mouseLeaveEdgeControlPt());
  }

  function handleMouseUp() {
    if (!St.hasMoved(state)) {
      return dispatch(St.toggleEdgeDirection(id));
    }
  }

  return (
    <g>
      <path
        className="edge-path"
        d={`M ${p.x} ${p.y} Q ${l.x} ${l.y}, ${q.x} ${q.y}`}
        strokeWidth="2"
        fill="none"
      />
      <g
        className="edge-control"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <circle cx={c.x} cy={c.y} r="12" fill="transparent" />
        <circle
          cx={c.x}
          cy={c.y}
          r={isHovered ? 14 : 4}
          className="edge-control-point"
        />
        ;
        <Arrow c={c} pq={pq} direction={direction} />
      </g>
    </g>
  );
};

interface ArrowProps {
  c: Vec;
  pq: Vec;
  direction: EdgeDirection;
}

const Arrow: React.FC<ArrowProps> = ({ c, pq, direction }) => {
  if (direction === EdgeDirection.None) {
    return null;
  }

  const wingLength = 30;
  const isForward = direction === EdgeDirection.Forward;
  const arrowSpine = pq.normalize().scale(isForward ? wingLength : -wingLength);
  const wing1 = arrowSpine.rotate(Math.PI / 10);
  const wing2 = arrowSpine.rotate(-Math.PI / 10);
  const w1 = c.plus(wing1);
  const w2 = c.plus(wing2);

  return (
    <path
      d={`M ${c.x} ${c.y} L ${w1.x} ${w1.y} L ${w2.x} ${w2.y}`}
      className="edge-arrow"
      stroke="none"
    />
  );
};

export default Edge;
