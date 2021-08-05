import React from 'react';
import * as St from './state';

const Actions: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(St.StateContext);

  const actions = St.availableActions(state);

  return (
    <div className="actions">
      {actions.map((action, id) => (
        <button key={id} onClick={() => dispatch(action.clickAction)}>
          {action.name}
        </button>
      ))}
    </div>
  );
};

export default Actions;
