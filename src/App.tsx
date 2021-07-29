import React from 'react';
import { useReducer, useMouse } from './hooks';
import {
  reducer,
  initState,
  logActions,
  StateContext,
  mouseDown,
  mouseMove,
  mouseUp,
  ActionType,
  selectVertices,
} from './state';
import Vertex from './Vertex';
import BoxSelection from './BoxSelection';

const App: React.FC<{}> = () => {
  const [state, dispatch] = useReducer(
    reducer,
    initState,
    logActions(ActionType.MouseMove)
  );
  const hostRef = useMouse({
    onMouseDown: () => dispatch(mouseDown()),
    onMouseMove: pos => dispatch(mouseMove(pos)),
    onMouseUp: () => dispatch(mouseUp()),
  });

  const vertices = selectVertices(state);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      <main>
        <svg xmlns="http://www.w3.org/2000/svg" ref={hostRef as any}>
          {vertices.map(v => (
            <Vertex key={v.id} {...v} />
          ))}

          <BoxSelection />
        </svg>
      </main>

      <footer>
        <nav>
          Logo <div className="links">links</div>
        </nav>
      </footer>
    </StateContext.Provider>
  );
};

export default App;
