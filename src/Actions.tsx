import React from 'react';
import { StateContext } from './state';
import * as St from './state';

const Actions: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(StateContext);

  const actions = St.availableActions(state);

  function handleExport() {
    St.exportMathematica(state).match({
      err: errors => dispatch(St.openErrorsOverlay(errors)),
      ok: graph => dispatch(St.openGraphOverlay(graph)),
    });
  }

  return (
    <div className="actions">
      <div className="actions-lhs">
        {actions.map((action, id) => (
          <button key={id} onClick={() => dispatch(action.clickAction)}>
            {action.name}
          </button>
        ))}
      </div>
      <div className="actions-rhs">
        <a
          href="https://github.com/wjlewis/giraffe"
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
        <a
          href="https://github.com/wjlewis/giraffe/blob/master/README.md"
          target="_blank"
          rel="noreferrer"
        >
          Instructions
        </a>
        <button onClick={handleExport}>Export</button>
      </div>
    </div>
  );
};

export default Actions;
