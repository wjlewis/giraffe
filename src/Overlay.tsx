import React from 'react';
import { StateContext } from './state';
import * as St from './state';
import { noOp } from './tools';

const Overlay: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(StateContext);
  const graphTextRef = React.useRef(null);

  const overlay = St.overlay(state);
  if (overlay.isNone()) {
    return null;
  }

  function dismiss(e: React.MouseEvent) {
    if (e.currentTarget !== e.target) {
      return;
    }
    dispatch(St.dismissOverlay());
  }

  return (
    <div id="overlay" onClick={dismiss}>
      {overlay.match({
        none: () => {
          throw new Error('unreachable');
        },
        graph: graph => (
          <article className="graph-report">
            <p>Copy and paste the output below into a Mathematica document:</p>
            <input
              ref={graphTextRef}
              className="graph-text"
              value={graph}
              onChange={noOp}
            />
            <button onClick={dismiss}>Dismiss</button>
          </article>
        ),
        errors: errors => (
          <article className="error-report">
            <p>
              We were unable to export your graph for the following reasons:
            </p>
            <div className="errors">
              {errors.map((error, i) => (
                <p className="error-text" key={i}>
                  {error}
                </p>
              ))}
            </div>
            <button onClick={dismiss}>Dismiss</button>
          </article>
        ),
      })}
    </div>
  );
};

export default Overlay;
