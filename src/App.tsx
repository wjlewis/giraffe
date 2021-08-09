import React from 'react';
import { useReducer, useMousePos, useKeyboard } from './hooks';
import * as St from './state';
import Vertex from './Vertex';
import Edge from './Edge';
import BoxSelection from './BoxSelection';
import Actions from './Actions';
import NewVertex from './NewVertex';

const App: React.FC<{}> = () => {
  const [state, dispatch] = useReducer(
    St.reducer,
    St.initState,
    St.dispatchKeyEvents(),
    St.commitGraph(),
    St.logActions(St.ActionType.MouseMove)
  );
  const hostRef = useMousePos(pos => dispatch(St.mouseMove(pos)));
  useKeyboard({
    onKeyDown: info => dispatch(St.keyDown(info)),
    onKeyUp: () => dispatch(St.keyUp()),
  });

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
          {edges.map(e => (
            <Edge key={e.id} {...e} />
          ))}

          {vertices.map(v => (
            <Vertex key={v.id} {...v} />
          ))}

          <BoxSelection />

          <NewVertex />
        </svg>
      </main>

      <footer>
        <nav>
          <Actions />
        </nav>
      </footer>
    </St.StateContext.Provider>
  );
};

export default App;
