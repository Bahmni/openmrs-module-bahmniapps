import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./patientAllergiesControl.scss";
import { AddAllergy } from "../../Components/AddAllergy/AddAllergy";
import { FormattedMessage } from "react-intl";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import { fetchAllergensOrReactions } from "../../utils/PatientAllergiesControl/AllergyControlUtils";

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

const AllergenKind = {
  MEDICATION: "Medication",
  FOOD: "Food",
  ENVIRONMENT: "Environment",
};
export function PatientAlergiesControl(props) {
  const { hostData } = props;
  const { activeVisit, allergyControlConceptIdMap } = hostData;

  const isAddButtonEnabled = activeVisit && activeVisit.uuid;

  const extractAllergenData = (allergenData, allergenKind) =>
    allergenData?.setMembers
      ?.filter((allergen) => allergen.display !== "Other non-coded")
      .map((allergen) => {
        return {
          name: allergen.display,
          kind: allergenKind,
          uuid: allergen.uuid,
        };
      });

  const extractReactionData = (reactionData) =>
    reactionData?.setMembers
      ?.filter((reaction) => reaction.display !== "Other non-coded")
      .map((reaction) => {
        return { name: reaction.names[0].display, uuid: reaction.uuid };
      });

  const TransformReactionData = (reactionData) => {
    const extractedReactionData = extractReactionData(reactionData, "Reaction");
    const reactions = {};

    extractedReactionData.forEach((item) => {
      reactions[item.uuid] = { name: item.name };
    });
    return reactions;
  };

  const TransformAllergenData = (
    medicationAllergenData,
    foodAllergenData,
    environmentAllergenData
  ) => {
    const medicationAllergens = extractAllergenData(
      medicationAllergenData,
      AllergenKind.MEDICATION
    );
    const environmentalAllergens = extractAllergenData(
      environmentAllergenData,
      AllergenKind.ENVIRONMENT
    );
    const foodAllergens = extractAllergenData(
      foodAllergenData,
      AllergenKind.FOOD
    );

    const allergens = [
      ...medicationAllergens,
      ...environmentalAllergens,
      ...foodAllergens,
    ];
    return allergens;
  };

  const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [transformedAllergenData, setTransformedAllergenData] = useState([]);
  const [transformedReactionData, setTransformedReactionData] = useState({});

  const noAllergiesText = (
    <FormattedMessage
      id={"NO_ALLERGIES"}
      defaultMessage={"No Allergies for this patient."}
    />
  );
  const allergiesHeading = (
    <FormattedMessage id={"ALLERGIES_HEADING"} defaultMessage={"Allergies"} />
  );
  const addButtonText = (
    <FormattedMessage id={"ADD_BUTTON_TEXT"} defaultMessage={"Add +"} />
  );
  const loadingMessage = (
    <FormattedMessage
      id={"LOADING_MESSAGE"}
      defaultMessage={"Loading... Please Wait"}
    />
  );

  const medicationAllergenURL =
    allergyControlConceptIdMap.medicationAllergenUuid;
  const foodAllergenURL = allergyControlConceptIdMap.foodAllergenUuid;
  const environmentAllergenURL =
    allergyControlConceptIdMap.environmentalAllergenUuid;
  const allergyReactionURL = allergyControlConceptIdMap.allergyReactionUuid;

  const buildAllergenAndReactionsData = async () => {
    const urls = [
      medicationAllergenURL,
      foodAllergenURL,
      environmentAllergenURL,
      allergyReactionURL,
    ];

    try {
      setLoading(true);
      const [
        medicationResponseData,
        foodResponseData,
        environmentalResponseData,
        reactionResponseData,
      ] = await Promise.all(urls.map((url) => fetchAllergensOrReactions(url)));
      const allergenData = TransformAllergenData(
        medicationResponseData,
        foodResponseData,
        environmentalResponseData
      );
      const reactionsData = TransformReactionData(reactionResponseData);

      setTransformedAllergenData(allergenData);
      setTransformedReactionData(reactionsData);
      setLoading(false);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildAllergenAndReactionsData();
  }, []);

  return (
    <>
      <I18nProvider>
        {isLoading ? (
          <div>{loadingMessage}</div>
        ) : (
          <div>
            <h2 className={"section-title-next-ui"}>
              {allergiesHeading}
              {isAddButtonEnabled && (
                <div
                  className={"add-button"}
                  onClick={() => {
                    setShowAddAllergyPanel(true);
                  }}
                >
                  {addButtonText}
                </div>
              )}
            </h2>
            <div className={"placeholder-text"}>{noAllergiesText}</div>
            {showAddAllergyPanel && (
              <AddAllergy
                reaction={transformedReactionData}
                allergens={transformedAllergenData}
                data-testid={"allergies-overlay"}
                onClose={() => {
                  setShowAddAllergyPanel(false);
                }}
              />
            )}
          </div>
        )}
      </I18nProvider>
    </>
  );
}

PatientAlergiesControl.propTypes = {
  hostData: PropTypes.object.isRequired,
};
