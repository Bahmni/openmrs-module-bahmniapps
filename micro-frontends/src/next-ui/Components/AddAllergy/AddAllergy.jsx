import { Close24 } from "@carbon/icons-react";
import { ArrowLeft } from "@carbon/icons-react/next";
import { RadioButton, RadioButtonGroup, TextArea } from "carbon-components-react";
import { isEmpty } from "lodash";
import propTypes from "prop-types";
import React, { Fragment, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import "../../../styles/common.scss";
import {
  saveAllergiesAPICall
} from "../../utils/PatientAllergiesControl/AllergyControlUtils";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
import { SearchAllergen } from "../SearchAllergen/SearchAllergen.jsx";
import { SelectReactions } from "../SelectReactions/SelectReactions";
import "./AddAllergy.scss";

export function AddAllergy(props) {
  const { patient, provider, onClose, allergens, reaction, severityOptions, onSave } = props;
  const [allergen, setAllergen] = React.useState({});
  const [reactions, setReactions] = React.useState([]);
  const [severity, setSeverity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const backToAllergenText = (
    <FormattedMessage id={"BACK_TO_ALLERGEN"} defaultMessage={"Back to Allergies"} />
  );
  const allergiesHeading = (
    <FormattedMessage id={"ALLERGIES_HEADING"} defaultMessage={"Allergies and Reactions"} />
  );
  const [isSaveEnabled, setIsSaveEnabled] = React.useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = React.useState(null);
  const clearForm = () => {
    setAllergen({});
    setReactions([]);
    setNotes("");
    setSeverity("");
  };
  const saveAllergies = async (allergen, reactions, severity, notes) => {
    const allergyReactions = reactions.map((reaction) => {
      return { reaction: { uuid: reaction } };
    });
    const payload = {
      allergen: {
        allergenType: allergen.kind.toUpperCase(),
        codedAllergen: {
          uuid: allergen.uuid,
        },
      },
      reactions: allergyReactions,
      severity: { uuid: severity },
      comment: notes,
    };
    const response = await saveAllergiesAPICall(payload, patient.uuid);
    if (response.status === 201) {
      setIsSaveSuccess(true);
    } else {
      setIsSaveSuccess(false);
    }
  };
  useEffect(() => {
    onSave(isSaveSuccess);
  }, [isSaveSuccess]);
  return (
    <div className={"next-ui"}>
      <div className={"overlay-next-ui"}>
        <div className={"heading"}>{allergiesHeading}</div>
        <span className="close" onClick={onClose}>
          <Close24 />
        </span>
        <div className={"add-allergy-container"}>
          {isEmpty(allergen) ? (
            <div data-testid={"search-allergen"}>
              <SearchAllergen
                allergens={allergens}
                onChange={(allergen) => {
                  setAllergen(allergen);
                }}
              />
            </div>
          ) : (
            <Fragment>
              <div className={"back-button"}>
                <ArrowLeft size={20} onClick={clearForm} />
                <div onClick={clearForm}>{backToAllergenText}</div>
              </div>
              <div data-testid={"select-reactions"}>
                <SelectReactions
                  reactions={reaction}
                  selectedAllergen={allergen}
                  onChange={(reactions) => {
                    setReactions(reactions);
                    setIsSaveEnabled(reactions && severity && reactions.length > 0);
                  }}
                />
              </div>

              <div className={"section-next-ui"}>
                <div className={"font-large bold"}>
                  <FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"} />
                  <span className={"red-text"}>&nbsp;*</span>
                </div>
                <RadioButtonGroup
                  name={"severity"}
                  onChange={(e) => {
                    setSeverity(e);
                    setIsSaveEnabled(reactions && reactions.length > 0 && e);
                  }}
                  className={"severity-options-group"}
                >
                  {severityOptions.map((option) => {
                    return <RadioButton key={option.uuid} labelText={option.name} value={option.uuid}></RadioButton>;
                  })}
                </RadioButtonGroup>
                <TextArea
                  labelText={""}
                  placeholder={"Additional comments such as onset date etc."}
                  onBlur={(e) => {
                    setNotes(e.target.value);
                  }}
                />
              </div>
            </Fragment>
          )}
        </div>
        <div>
          <SaveAndCloseButtons
            onSave={async () => {
              await saveAllergies(allergen, reactions, severity, notes);
            }}
            onClose={onClose}
            isSaveDisabled={!isSaveEnabled}
          />
        </div>
      </div>
    </div>
  );
}

AddAllergy.propTypes = {
  onClose: propTypes.func.isRequired,
  allergens: propTypes.array.isRequired,
  reaction: propTypes.object.isRequired,
  onSave: propTypes.func.isRequired,
  patient: propTypes.object.isRequired,
  provider: propTypes.object.isRequired,
  severityOptions: propTypes.array.isRequired,
};
