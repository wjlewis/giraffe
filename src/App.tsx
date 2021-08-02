import React from 'react';
import { useReducer, useMouse, useKeyboard } from './hooks';
import {
  reducer,
  initState,
  logActions,
  dispatchKeyEvents,
  StateContext,
  mouseDown,
  mouseMove,
  mouseUp,
  ActionType,
  selectVertices,
  selectEdges,
  keyDown,
  keyUp,
} from './state';
import Vertex from './Vertex';
import Edge from './Edge';
import BoxSelection from './BoxSelection';
import Actions from './Actions';
import NewVertex from './NewVertex';

const App: React.FC<{}> = () => {
  const [state, dispatch] = useReducer(
    reducer,
    initState,
    dispatchKeyEvents(),
    logActions(ActionType.MouseMove)
  );
  const hostRef = useMouse({
    onMouseDown: () => dispatch(mouseDown()),
    onMouseMove: pos => dispatch(mouseMove(pos)),
    onMouseUp: () => dispatch(mouseUp()),
  });
  useKeyboard({
    onKeyDown: info => dispatch(keyDown(info)),
    onKeyUp: () => dispatch(keyUp()),
  });

  const edges = selectEdges(state);
  const vertices = selectVertices(state);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      <main>
        <svg xmlns="http://www.w3.org/2000/svg" ref={hostRef as any}>
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
    </StateContext.Provider>
  );
};

export default App;
