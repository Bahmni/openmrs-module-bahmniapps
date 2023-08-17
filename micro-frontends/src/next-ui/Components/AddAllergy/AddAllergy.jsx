import React from "react";
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
    const [isFormTouched, setIsFormTouched] = React.useState(false);
    const clearForm = () =>{
        setAllergen({});
        setReactions([]);
        setNotes("");
        setSeverity("");
    }
    return (
        <div className={"next-ui"}>
            <div className={"overlay-next-ui"}>
                <div className={"heading"}>Allergies and reactions</div>
                <span className="close" onClick={onClose}>
                    <Close24/>
                </span>
                <div className={"add-allergy-container"}>
                    {  isEmpty(allergen)?
                        <div>
                            <SearchAllergen onChange={(allergen) => {setAllergen(allergen);}}/>
                        </div>
                        : <>
                            <div style={{color: "#0F62FE", display: "flex", gap: "5px", alignItems: "center", paddingBottom:"10px"}}>
                                <ArrowLeft size={20} onClick={clearForm}/>
                                <div style={{cursor: "pointer"}} onClick={clearForm}>back to Allergies</div>
                            </div>
                            <SelectReactions onChange={setReactions}/>
                            <div className={"section"}>
                                <div style={{fontSize: "16px", fontWeight: 600, marginBottom:"10px"}}>
                                    <FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"}/>
                                </div>
                                <div style={{marginBottom: "10px"}}>
                                    <RadioButtonGroup
                                        key={"Severity"} onChange={(e) => {setSeverity(e);}}>
                                        <RadioButton labelText={mild.label} value={mild.uuid}></RadioButton>
                                        <RadioButton labelText={moderate.label} value={moderate.uuid}></RadioButton>
                                        <RadioButton labelText={severe.label} value={severe.uuid}></RadioButton>
                                    </RadioButtonGroup>
                                </div>
                                <div style={{marginBottom:"10px"}}>
                                    <TextArea placeholder={"Additional comments such as onset date etc."} onBlur={(e) => {setNotes(e.target.value);}}/>
                                </div>
                            </div>
                        </>
                    }
                </div>
                <div>
                    <SaveAndCloseButtons  onSave={()=>{console.log("Saved",allergen, reactions, severity,notes)}} onClose={ onClose } isSaveDisabled={false}/>
                </div>
            </div>
        </div>
    );
}

AddAllergy.propTypes = {
    onClose: propTypes.func.isRequired
}