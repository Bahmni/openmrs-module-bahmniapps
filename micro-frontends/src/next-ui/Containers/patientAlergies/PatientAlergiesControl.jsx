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
    const { isAddButtonEnabled = true, hostData } = props;
    const { uuid } = hostData;
    const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    return (
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
