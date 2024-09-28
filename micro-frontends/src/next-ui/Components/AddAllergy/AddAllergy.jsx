import React, {Fragment, useEffect} from "react";
import propTypes from "prop-types";
import { Close24 } from "@carbon/icons-react";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
import "./AddAllergy.scss";
import "../../../styles/common.scss";
import { SearchAllergen } from "../SearchAllergen/SearchAllergen.jsx";
import { isEmpty } from "lodash";
import {
  RadioButton,
  RadioButtonGroup,
  TextArea,
} from "carbon-components-react";
import { FormattedMessage } from "react-intl";
import { ArrowLeft } from "@carbon/icons-react/next";
import { SelectReactions } from "../SelectReactions/SelectReactions";
import { bahmniEncounter, getEncounterType } from "../../utils/PatientAllergiesControl/AllergyControlUtils";
import { getCookies } from "../../utils/cookieHandler/cookieHandler";

export function AddAllergy(props) {
  const { patient, provider, onClose, allergens, reaction, severityOptions, onSave } = props;
  const [allergen, setAllergen] = React.useState({});
  const [reactions, setReactions] = React.useState([]);
  const [severity, setSeverity] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const backToAllergenText = (
    <FormattedMessage
      id={"BACK_TO_ALLERGEN"}
      defaultMessage={"Back to Allergies"}
    />
  );
  const allergiesHeading = (
    <FormattedMessage
      id={"ALLERGIES_HEADING"}
      defaultMessage={"Allergies and Reactions"}
    />
  );
  const [isSaveEnabled, setIsSaveEnabled] = React.useState(false);
  const [isSaveSuccess, setIsSaveSuccess] = React.useState(null);
  const [error, setError] = React.useState(null);
  const clearForm = () => {
    setAllergen({});
    setReactions([]);
    setNotes("");
    setSeverity("");
    setError(null);
  };
  const saveAllergies = async (allergen, reactions, severity, notes) => {
    const {uuid: consultationUuid} = await getEncounterType('Consultation');
    const cookies = getCookies();
    const {uuid:locationUuid} = JSON.parse(cookies["bahmni.user.location"])
    const allergyReactions = reactions.map((reaction) => {
        return {reaction: reaction}
    });
    const payload = {
      locationUuid,
      patientUuid: patient.uuid,
      providers: [{uuid: provider.uuid}],
      encounterTypeUuid: consultationUuid,
      allergy:{
        allergen:{
          allergenKind: allergen.kind.toUpperCase(),
          codedAllergen: allergen.uuid
        },
        reactions: allergyReactions,
        severity: severity,
        comment: notes
      }
    }
    const response = await bahmniEncounter(payload);
    if(response.status === 200){
      setIsSaveSuccess(true);
    }else{
      setError(response.response.data.error.message)
      setIsSaveSuccess(false);
    }
  }
  useEffect(() => {
    onSave(isSaveSuccess, error);
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
                  <FormattedMessage
                    id={"SEVERITY"}
                    defaultMessage={"Severity"}
                  />
                  <span className={"red-text"}>&nbsp;*</span>
                </div>
                <RadioButtonGroup
                  name={<FormattedMessage
                    id={"SEVERITY"}
                    defaultMessage={"Severity"}
                  />}
                  key={"Severity"}
                  onChange={(e) => {
                    setSeverity(e);
                    setIsSaveEnabled(reactions && reactions.length > 0 && e);
                  }}
                >
                  {severityOptions.map((option) => {
                    return (
                      <RadioButton
                        key={option.uuid}
                        labelText={option.name}
                        value={option.uuid}
                      ></RadioButton>
                    );
                  })}
                </RadioButtonGroup>
                <TextArea
                  labelText={""}
                  placeholder={
                    <FormattedMessage
                    id={"ADDITIONAL_COMMENT_ALLERGY"}
                    defaultMessage={"Additional comments such as onset date etc."}
                  />}
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
              await saveAllergies( allergen, reactions, severity, notes);
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
  severityOptions: propTypes.array.isRequired
};
