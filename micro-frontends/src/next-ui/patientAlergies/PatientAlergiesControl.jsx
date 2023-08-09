import React from 'react';
import PropTypes from 'prop-types';
// import classNames from "classnames";
import { Close24 } from '@carbon/icons-react';
import { Button } from 'carbon-components-react';
import "../../styles/carbon-conflict-fixes.scss";
import "../../styles/carbon-theme.scss";
import "../../styles/common.scss";
import "./patientAllergiesControl.scss";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons";
/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function PatientAlergiesControl(props) {
  return (
    // <div>
    //   <span>Displaying alergy control from {props.hostData.name}</span>
    //   <span>Translation: {props.tx?.('SAMPLE_AT_LABEL')}</span>
    //   <Button onClick={props.hostApi?.callback}>Click for callback</Button>
    // </div>
      // style={{width:"200px", height: "100px", border: "1px solid #ededed", position: "absolute", top: "110px" }}>
      // <div className="overlay">
      //   <div className="close">
      //     <Close24/>
      //   </div>
      //     Hello
      //     <div>
      //         <SaveAndCloseButtons onSave={()=>{console.log("Saved")}} onClose={()=>{console.log("Cancelled")}} isSaveDisabled={false}/>
      //     </div>
      // </div>
      <div>

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
