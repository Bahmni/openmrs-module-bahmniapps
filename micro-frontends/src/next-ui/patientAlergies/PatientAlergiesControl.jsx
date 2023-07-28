import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'carbon-components-react';

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function PatientAlergiesControl(props) {
  return (
    <div>
      <span>Displaying alergy control from {props.hostData.name}</span>
      <span>Translation: {props.tx?.('SAMPLE_AT_LABEL')}</span>
      <Button onClick={props.hostApi?.callback}>Click for callback</Button>
    </div>
  );
}

PatientAlergiesControl.propTypes = {
  hostData: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  hostApi: PropTypes.shape({
    callback: PropTypes.func.isRequired,
  }),
  tx: PropTypes.func.isRequired,
};
