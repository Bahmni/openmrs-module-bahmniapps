import React, { useState } from 'react';
import PropTypes from 'prop-types';
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./patientAllergiesControl.scss";
import {AddAllergy} from "../../Components/AddAllergy/AddAllergy";

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function PatientAlergiesControl(props) {
    const { isAddButtonEnabled = true } = props;
    const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    return (
    // <div>
    //   <span>Displaying alergy control from {props.hostData.name}</span>
    //   <span>Translation: {props.tx?.('SAMPLE_AT_LABEL')}</span>
    //   <Button onClick={props.hostApi?.callback}>Click for callback</Button>
    // </div>
      <div>
        <h2 className={"section-title"}>
            Allergies
            <div className={"add-button"} onClick={()=> {setShowAddAllergyPanel(true);}}>Add +</div>
        </h2>
        <div className={"placeholder-text"}>
          No Allergies for this patient.
        </div>
          { showAddAllergyPanel && <AddAllergy onClose={() => {setShowAddAllergyPanel(false);}}/>}
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
