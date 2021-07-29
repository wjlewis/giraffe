import React from 'react';
import { StateContext, selectVertexPos } from './state';
import { Vec } from './tools';

export interface EdgeProps {
  id: number;
  startVertexId: number;
  endVertexId: number;
  controlPtPos: Vec;
}

const Edge: React.FC<EdgeProps> = props => {
  const { state } = React.useContext(StateContext);

  const { startVertexId, endVertexId, controlPtPos: c } = props;
  const p = selectVertexPos(state, startVertexId);
  const q = selectVertexPos(state, endVertexId);

  const pq = q.minus(p);
  const m = pq.scale(1 / 2);
  const pc = c.minus(p);
  const l = p.plus(pc.scale(2)).minus(m);

  return (
    <g>
      <path
        d={`M ${p.x} ${p.y} Q ${l.x} ${l.y}, ${q.x} ${q.y}`}
        stroke="blue"
        strokeWidth="2"
        fill="none"
      />
      <circle cx={c.x} cy={c.y} r="6" fill="red" />
    </g>
  );
};

export default Edge;
