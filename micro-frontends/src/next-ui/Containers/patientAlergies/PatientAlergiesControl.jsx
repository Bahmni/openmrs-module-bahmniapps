import React, { useState } from 'react';
import PropTypes from 'prop-types';
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./patientAllergiesControl.scss";
import {AddAllergy} from "../../Components/AddAllergy/AddAllergy";
import {FormattedMessage} from "react-intl";

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function PatientAlergiesControl(props) {
    const { isAddButtonEnabled = true, hostData } = props;
    const { uuid } = hostData;
    const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    const noAllergiesText = <FormattedMessage id={'NO_ALLERGIES'} defaultMessage={'No Allergies for this patient.'}/>;
    const allergiesHeading = <FormattedMessage id={'ALLERGIES_HEADING'} defaultMessage={'Allergies'}/>;
    const addButtonText = <FormattedMessage id={'ADD_BUTTON_TEXT'} defaultMessage={'Add +'}/>;
    return (
      <div>
        <h2 className={"section-title"}>
            {allergiesHeading}
            { isAddButtonEnabled && <div className={"add-button"} onClick={()=> {setShowAddAllergyPanel(true);}}>{addButtonText}</div>}
        </h2>
        <div className={"placeholder-text"}>{noAllergiesText}</div>
          { showAddAllergyPanel && <AddAllergy data-testid={"allergies-overlay"} onClose={() => {setShowAddAllergyPanel(false);}}/>}
      </div>
  );
}

PatientAlergiesControl.propTypes = {
    hostData: PropTypes.object.isRequired,
    isAddButtonEnabled: PropTypes.bool,
};
