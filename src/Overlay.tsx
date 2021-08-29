import React from 'react';
import { StateContext } from './state';
import * as St from './state';
import { noOp } from './tools';

const Overlay: React.FC<{}> = () => {
  const { state, dispatch } = React.useContext(StateContext);
  const graphTextRef = React.useRef(null);
  const [copying, setCopying] = React.useState(false);

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

  function copyToClipboard() {
    if (graphTextRef.current) {
      const input = graphTextRef.current as any as HTMLInputElement;
      input.focus();
      input.select();
      document.execCommand('copy');

      setCopying(true);
      setTimeout(() => {
        setCopying(false);
      }, 1000);
    }
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

            <div className="graph-text-container">
              <input
                ref={graphTextRef}
                className="graph-text"
                value={graph}
                onChange={noOp}
              />
              <button onClick={copyToClipboard} disabled={copying}>
                {copying ? 'Copied!' : 'Copy'}
              </button>
            </div>

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
