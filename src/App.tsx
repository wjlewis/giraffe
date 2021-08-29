import React from 'react';
import { useReducer, useMousePos, useKeyboard, useBounds } from './hooks';
import * as St from './state';
import { Vec } from './tools';
import Vertex from './Vertex';
import Edge from './Edge';
import BoxSelection from './BoxSelection';
import Actions from './Actions';
import NewVertex from './NewVertex';
import Overlay from './Overlay';

const App: React.FC<{}> = () => {
  const [state, dispatch] = useReducer(
    St.reducer,
    St.initState,
    St.dispatchKeyEvents(),
    St.commitGraph()
  );
  const hostRef = React.useRef(null);
  const { width, height } = useBounds(hostRef);
  useMousePos(hostRef, pos =>
    dispatch(St.mouseMove(new Vec(pos.x - width / 2, pos.y - height / 2)))
  );
  useKeyboard({
    onKeyDown: info => dispatch(St.keyDown(info)),
    onKeyUp: () => dispatch(St.keyUp()),
  });

  const transform = `translate(${width / 2} ${height / 2})`;

  const edges = St.allEdges(state);
  const vertices = St.allVertices(state);

  function handleMouseDown(e: React.MouseEvent) {
    if (e.currentTarget !== e.target) {
      return;
    }

    return dispatch(St.mouseDownCanvas());
  }

  function handleMouseUp() {
    return dispatch(St.mouseUp());
  }

  return (
    <St.StateContext.Provider value={{ state, dispatch }}>
      <main>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          ref={hostRef as any}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <g transform={transform}>
            {edges.map(e => (
              <Edge key={e.id} {...e} />
            ))}

            {vertices.map(v => (
              <Vertex key={v.id} {...v} />
            ))}

            <BoxSelection />

            <NewVertex />
          </g>
        </svg>
      </main>

      <footer>
        <nav>
          <Actions />
        </nav>
      </footer>

      <Overlay />
    </St.StateContext.Provider>
  );
};

export default App;
