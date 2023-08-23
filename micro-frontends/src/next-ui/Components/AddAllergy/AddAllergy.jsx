import React, {Fragment} from "react";
import propTypes from "prop-types";
import { Close24 } from "@carbon/icons-react";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
import "./AddAllergy.scss";
import "../../../styles/common.scss";
import { SearchAllergen } from "../SearchAllergen/SearchAllergen.jsx";
import { isEmpty } from "lodash";
import {RadioButton, RadioButtonGroup, TextArea} from "carbon-components-react";
import { FormattedMessage } from "react-intl";
import { ArrowLeft } from "@carbon/icons-react/next";
import { SelectReactions } from "../SelectReactions/SelectReactions";

export function AddAllergy(props) {
    const { onClose } = props;
    const [allergen, setAllergen] = React.useState({});
    const [reactions, setReactions] = React.useState([]);
    const [severity, setSeverity] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const mild = { label: <FormattedMessage id={"MILD"} defaultMessage={"Mild"}/>, uuid: "1498AAAAA"};
    const moderate = {label: <FormattedMessage id={"MODERATE"} defaultMessage={"Moderate"}/>, uuid: "1499AAAAA"};
    const severe = {label: <FormattedMessage id={"SEVERE"} defaultMessage={"Severe"}/>, uuid: "1500AAAAA"};
    const backToAllergenText = <FormattedMessage id={"BACK_TO_ALLERGEN"} defaultMessage={"Back to Allergies"}/>;
    const allergiesHeading = <FormattedMessage id={"ALLERGIES_HEADING"} defaultMessage={"Allergies and Reactions"}/>;
    const [isSaveEnabled, setIsSaveEnabled] = React.useState(false);
    const clearForm = () =>{
        setAllergen({});
        setReactions([]);
        setNotes("");
        setSeverity("");
    }
    return (
        <div className={"next-ui"}>
            <div className={"overlay-next-ui"}>
                <div className={"heading"}>{allergiesHeading}</div>
                <span className="close" onClick={onClose}>
                    <Close24/>
                </span>
                <div className={"add-allergy-container"}>
                    {  isEmpty(allergen) ?
                        <div data-testid={"search-allergen"} >
                            <SearchAllergen onChange={(allergen) => {setAllergen(allergen);}}/>
                        </div>
                        :<Fragment>
                            <div className={"back-button"}>
                                <ArrowLeft size={20} onClick={clearForm}/>
                                <div onClick={clearForm}>{backToAllergenText}</div>
                            </div>
                            <div data-testid={"select-reactions"}>
                                <SelectReactions  onChange={(reactions) =>{
                                    setReactions(reactions);
                                    setIsSaveEnabled(reactions && reactions.length > 0)
                                }}/>
                            </div>

                            <div className={"section"}>
                                <div className={"font-large bold"}>
                                    <FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"}/>
                                </div>
                                <RadioButtonGroup name={"severity"}
                                    key={"Severity"} onChange={(e) => {setSeverity(e);}}>
                                    <RadioButton labelText={mild.label} value={mild.uuid}></RadioButton>
                                    <RadioButton labelText={moderate.label} value={moderate.uuid}></RadioButton>
                                    <RadioButton labelText={severe.label} value={severe.uuid}></RadioButton>
                                </RadioButtonGroup>
                                <TextArea labelText={""} placeholder={"Additional comments such as onset date etc."} onBlur={(e) => {setNotes(e.target.value);}}/>
                            </div>
                        </Fragment>
                    }
                </div>
                <div>
                    <SaveAndCloseButtons  onSave={()=>{console.log("Saved",allergen, reactions, severity,notes)}} onClose={ onClose } isSaveDisabled={!isSaveEnabled}/>
                </div>
            </div>
        </div>
    );
}

AddAllergy.propTypes = {
    onClose: propTypes.func.isRequired
}
