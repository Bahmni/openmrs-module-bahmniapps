import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./patientAllergiesControl.scss";
import {AddAllergy} from "../../Components/AddAllergy/AddAllergy";
import {FormattedMessage} from "react-intl";
import {fetchAllergensOrReactions} from "../../utils/PatientAllergiesControl/AllergyControlUtils";

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function PatientAlergiesControl(props) {
    const {  hostData } = props;
    const { activeVisit, allergyControlConceptIdMap } = hostData;
    const isAddButtonEnabled = activeVisit !== undefined || activeVisit !== null;


  const extractData = (allergenData, allergenKind) =>
    allergenData?.setMembers
    ?.filter((allergen) => allergen.display !== "Other non-coded")
    .map((allergen) => {
      return {  name: allergen.display, kind: allergenKind, uuid: allergen.uuid };
    });

    const TransformReactionData = (reactionData) => {
      const extractedReactionData = extractData(reactionData, "Reaction");
      const reactions = {};

      extractedReactionData.forEach(item => {
      reactions[item.uuid] = { name: item.name };
    });
      return reactions;
  }

    
const TransformAllergenData = (drugAllergenData,foodAllergenData,environmentAllergenData) => {


  const drugAllergens = extractData(drugAllergenData, "Drug");
  const environmentalAllergens = extractData(environmentAllergenData, "Environment");
  const foodAllergens = extractData(foodAllergenData, "Food");


     const allergens = [
        ...drugAllergens,
        ...environmentalAllergens,
        ...foodAllergens,
        ];
        return allergens;
};     

    const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [transformedAllergenData, setTransformedAllergenData] = useState([]);
    const [transformedReactionData, setTransformedReactionData] = useState({});

    const noAllergiesText = <FormattedMessage id={'NO_ALLERGIES'} defaultMessage={'No Allergies for this patient.'}/>;
    const allergiesHeading = <FormattedMessage id={'ALLERGIES_HEADING'} defaultMessage={'Allergies'}/>;
    const addButtonText = <FormattedMessage id={'ADD_BUTTON_TEXT'} defaultMessage={'Add +'}/>;

    const drugAllergenURL = allergyControlConceptIdMap.drugAllergenUuid;
    const foodAllergenURL = allergyControlConceptIdMap.foodAllergenUuid;
    const environmentAllergenURL = allergyControlConceptIdMap.environmentalAllergenUuid;
    const allergyReactionURL = allergyControlConceptIdMap.allergyReactionUuid;

    const buildAllergenAndReactionsData = async () => {

      const urls = [drugAllergenURL, foodAllergenURL, environmentAllergenURL, allergyReactionURL];

        try {
            const [drugResponseData, foodResponseData, environmentalResponseData, reactionResponseData] = await Promise.all(
              urls.map(url => fetchAllergensOrReactions(url))
          );


            const allergenData = TransformAllergenData(drugResponseData, foodResponseData, environmentalResponseData);
            const reactionsData = TransformReactionData(reactionResponseData);

            setTransformedAllergenData(allergenData);
            setTransformedReactionData(reactionsData);

            
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
      buildAllergenAndReactionsData();
  }, []);

    if(isLoading) {
        return <div>Loading...</div>;
    }
  
    return (
      <div>
        <h2 className={"section-title"}>
            {allergiesHeading}
            { isAddButtonEnabled && <div className={"add-button"} onClick={()=> {setShowAddAllergyPanel(true);}}>{addButtonText}</div>}
        </h2>
        <div className={"placeholder-text"}>{noAllergiesText}</div>
          { showAddAllergyPanel && <AddAllergy reaction={transformedReactionData} allergens={transformedAllergenData} data-testid={"allergies-overlay"} onClose={() => {setShowAddAllergyPanel(false);}}/>}
      </div>
  );
}

PatientAlergiesControl.propTypes = {
    hostData: PropTypes.object.isRequired
};
