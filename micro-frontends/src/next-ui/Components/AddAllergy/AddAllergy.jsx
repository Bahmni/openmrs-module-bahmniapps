/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import { Close24 } from "@carbon/icons-react";
import "./AddAllergy.scss";
import "../../../styles/common.scss";
import { isEmpty } from "lodash";
import {
  RadioButton,
  RadioButtonGroup,
  TextArea,
  TextInput,
} from "carbon-components-react";
import { FormattedMessage, useIntl } from "react-intl";
import { ArrowLeft } from "@carbon/icons-react/next";
import propTypes from "prop-types";
import React, { Fragment, useEffect } from "react";
import {
  saveAllergiesAPICall
} from "../../utils/PatientAllergiesControl/AllergyControlUtils";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
import { SearchAllergen } from "../SearchAllergen/SearchAllergen.jsx";
import { SelectReactions } from "../SelectReactions/SelectReactions";


  export function AddAllergy(props) {
    const { patient, onClose, allergens, reaction, severityOptions, onSave, existingAllergies, noKnownAllergyUuid, enableNoKnownAllergy, nonCodedAllergenUuid } = props;
    const [allergen, setAllergen] = React.useState({});
    const [reactions, setReactions] = React.useState([]);
    const [severity, setSeverity] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [nonCodedAllergenName, setNonCodedAllergenName] = React.useState("");
    const [patientHasAllergies, setPatientHasAllergies] = React.useState(null);
    const intl = useIntl();
    const backToAllergenText = (
      <FormattedMessage id={"BACK_TO_ALLERGEN"} defaultMessage={"Back to Allergies"} />
    );
    const allergiesHeading = (
      <FormattedMessage id={"ALLERGIES_HEADING"} defaultMessage={"Allergies and Reactions"} />
    );
    const additionalComments = (
      intl.formatMessage({ id: "ADDITIONAL_COMMENT_ALLERGY", defaultMessage: "Additional comments such as onset date etc."})
    );
    const specifyAllergenLabel = (
      <FormattedMessage id={"SPECIFY_ALLERGEN"} defaultMessage={"Specify allergen"} />
    );
    const specifyAllergenPlaceholder = (
      intl.formatMessage({ id: "SPECIFY_ALLERGEN_PLACEHOLDER", defaultMessage: "Enter the allergen name" })
    );
    const noKnownAllergyText = (<FormattedMessage id={"NO_KNOWN_ALLERGY"} defaultMessage={"No known allergy"} />);
    const knownAllergyQuestionText = (
        <FormattedMessage
            id="KNOWN_ALLERGY_QUESTION"
            defaultMessage="Does the patient have any known allergies?"
        />
    );
    const yesText = (<FormattedMessage id="YES" defaultMessage="Yes" />);
    const noText = (<FormattedMessage id="NO" defaultMessage="No" />);

    const [isSaveEnabled, setIsSaveEnabled] = React.useState(false);
    const [isSaveSuccess, setIsSaveSuccess] = React.useState(null);
    const [saveError, setSaveError] = React.useState(null);

    const isNonCodedAllergen = !!nonCodedAllergenUuid && allergen?.uuid === nonCodedAllergenUuid;

    const clearForm = () => {
      setAllergen({});
      setReactions([]);
      setNotes("");
      setSeverity("");
      setNonCodedAllergenName("");
    };

    const canSave = (reactionsList, severityValue, nonCodedText) =>
      !!(reactionsList && reactionsList.length > 0 && severityValue &&
        (!isNonCodedAllergen || nonCodedText?.trim()));

    const saveAllergies = async (allergen, reactions, severity, notes, nonCodedName) => {
      const allergyReactions = reactions.map((reaction) => {
        return { reaction: { uuid: reaction } };
      });
      const payload = {
        allergen: {
          allergenType: allergen.kind.toUpperCase(),
          codedAllergen: {
            uuid: allergen.uuid,
          },
          // OpenMRS requires this free-text name whenever codedAllergen is the
          // Other, Non-Coded concept; the save otherwise fails server-side.
          ...(isNonCodedAllergen ? { nonCodedAllergen: nonCodedName.trim() } : {}),
        },
        reactions: allergyReactions,
        severity: severity ? { uuid: severity } : null,
        comment: notes,
      };
      const response = await saveAllergiesAPICall(payload, patient.uuid);
      if (response.status === 201) {
        setIsSaveSuccess(true);
      } else {
        setSaveError(response.message);
        setIsSaveSuccess(false);
      }
    };
    useEffect(() => {
      if (isSaveSuccess !== null) onSave(isSaveSuccess, saveError);
    }, [isSaveSuccess]);

    const handleKnownAllergyChange = (value) => {
      const isYes = value === "yes";
      setPatientHasAllergies(isYes);
      if (!isYes) {
        if (!noKnownAllergyUuid) return;
        const noKnownAllergyValue = allergens.find(allergen => allergen?.uuid === noKnownAllergyUuid);
        setAllergen(noKnownAllergyValue ?? {});
        setReactions([]);
        setSeverity(null);
        setNotes(null);
        setIsSaveEnabled(true);
      } else {
        clearForm();
        setIsSaveEnabled(false);
      }
    };


    const showKnownAllergySelector = existingAllergies?.length === 0 && !!noKnownAllergyUuid && enableNoKnownAllergy

    return (
        <div className={"next-ui"}>
          <div className={"overlay-next-ui"}>
            <div className={"heading"}>{allergiesHeading}</div>
            <span className="close" onClick={onClose}>
          <Close24 />
        </span>
            <div className={"add-allergy-container"}>
              {showKnownAllergySelector && (
                  <RadioButtonGroup
                      name="known-allergy"
                      legendText={knownAllergyQuestionText}
                      onChange={handleKnownAllergyChange}
                      orientation="horizontal"
                      defaultSelected="yes"
                      className={"font-large known-allergy-radio-group"}
                  >
                    <RadioButton labelText={yesText} value="yes" />
                    <RadioButton labelText={noText} value="no" />
                  </RadioButtonGroup>
              )}

              {patientHasAllergies === false ? (
                  <div className={"font-large no-known-allergy-textarea"}>{noKnownAllergyText}</div>
              ) : (
                  <>
                    {isEmpty(allergen) && (
                        <div data-testid={"search-allergen"}>
                          <SearchAllergen
                              allergens={allergens.filter(allergen => allergen?.uuid !== noKnownAllergyUuid)}
                              onChange={(allergen) => {
                                setAllergen(allergen);
                              }}
                          />
                        </div>
                    )}
                    {!isEmpty(allergen) && (
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
                                  setIsSaveEnabled(canSave(reactions, severity, nonCodedAllergenName));
                                }}
                            />
                          </div>

                          {isNonCodedAllergen && (
                              <div className={"section-next-ui"}>
                                <TextInput
                                    id={"specify-allergen"}
                                    data-testid={"specify-allergen"}
                                    labelText={specifyAllergenLabel}
                                    placeholder={specifyAllergenPlaceholder}
                                    value={nonCodedAllergenName}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setNonCodedAllergenName(value);
                                      setIsSaveEnabled(canSave(reactions, severity, value));
                                    }}
                                    maxLength={255}
                                />
                              </div>
                          )}

                          <div className={"section-next-ui"}>
                            <div className={"font-large bold"}>
                              <FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"} />
                              <span className={"red-text"}>&nbsp;*</span>
                            </div>
                            <RadioButtonGroup
                                name="severity"
                                key={"Severity"}
                                onChange={(e) => {
                                  setSeverity(e);
                                  setIsSaveEnabled(canSave(reactions, e, nonCodedAllergenName));
                                }}
                                className={"severity-options-group"}
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
                                data-testid={"additional-comments"}
                                labelText={""}
                                placeholder={additionalComments}
                                onBlur={(e) => {
                                  setNotes(e.target.value);
                                }}
                            />
                          </div>
                        </Fragment>
                    )}
                  </>
              )}
            </div>
            <div>
              <SaveAndCloseButtons
                  onSave={async () => {
                    await saveAllergies(allergen, reactions, severity, notes, nonCodedAllergenName);
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
    severityOptions: propTypes.array.isRequired,
    existingAllergies: propTypes.array.isRequired,
    noKnownAllergyUuid: propTypes.string.isRequired,
    enableNoKnownAllergy: propTypes.bool.isRequired,
    nonCodedAllergenUuid: propTypes.string
  };
