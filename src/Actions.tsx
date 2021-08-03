import React from 'react';
import { StateContext, selectAvailableActions } from './state';

const Actions: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(StateContext);

  const actions = selectAvailableActions(state);

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
