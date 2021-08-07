import React from 'react';
import { StateContext } from './state';

const Messages: React.FC<{}> = () => {
  const { state } = React.useContext(StateContext);

  return <div className="messages">test message</div>;
};

export default Messages;
