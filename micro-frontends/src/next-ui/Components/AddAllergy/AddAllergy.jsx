  import { Close24 } from "@carbon/icons-react";
  import "./AddAllergy.scss";
  import "../../../styles/common.scss";
  import { isEmpty } from "lodash";
  import {
    RadioButton,
    RadioButtonGroup,
    TextArea,
  } from "carbon-components-react";
  import { FormattedMessage, useIntl } from "react-intl";
  import { ArrowLeft } from "@carbon/icons-react/next";
  import propTypes from "prop-types";
  import React, { Fragment, useEffect } from "react";
  import "../../../styles/common.scss";
  import {
    saveAllergiesAPICall
  } from "../../utils/PatientAllergiesControl/AllergyControlUtils";
  import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
  import { SearchAllergen } from "../SearchAllergen/SearchAllergen.jsx";
  import { SelectReactions } from "../SelectReactions/SelectReactions";
  import "./AddAllergy.scss";

  export function AddAllergy(props) {
    const { patient, onClose, allergens, reaction, severityOptions, onSave, existingAllergies } = props;
    const [allergen, setAllergen] = React.useState({});
    const [reactions, setReactions] = React.useState([]);
    const [severity, setSeverity] = React.useState("");
    const [notes, setNotes] = React.useState("");
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
    const NO_KNOWN_ALLERGY = "No Known Allergy";
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
        severity: severity ? { uuid: severity } : null,
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

    const handleKnownAllergyChange = (value) => {
      const isYes = value === "yes";
      setPatientHasAllergies(isYes);
      if (!isYes) {
        const noKnownAllergyValue = allergens.find(allergen => allergen?.name === NO_KNOWN_ALLERGY);
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

    const showKnownAllergySelector = existingAllergies?.length === 0

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
                      legendText="Does the patient have any known allergies?"
                      onChange={handleKnownAllergyChange}
                      orientation="horizontal"
                      defaultSelected="yes"
                      className={"font-large known-allergy-radio-group"}
                  >
                    <RadioButton labelText="Yes" value="yes" />
                    <RadioButton labelText="No" value="no" />
                  </RadioButtonGroup>
              )}

              {patientHasAllergies === false ? (
                  <div className={"font-large no-known-allergy-textarea"}>{NO_KNOWN_ALLERGY}</div>
              ) : (
                  <>
                    {isEmpty(allergen) && (
                        <div data-testid={"search-allergen"}>
                          <SearchAllergen
                              allergens={allergens.filter(allergen => allergen?.name !== NO_KNOWN_ALLERGY)}
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
                                name={<FormattedMessage
                                    id={"SEVERITY"}
                                    defaultMessage={"Severity"}
                                />}
                                key={"Severity"}
                                onChange={(e) => {
                                  setSeverity(e);
                                  setIsSaveEnabled(reactions && reactions.length > 0 && e);
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
    severityOptions: propTypes.array.isRequired,
    existingAllergies: propTypes.array.isRequired,
  };
