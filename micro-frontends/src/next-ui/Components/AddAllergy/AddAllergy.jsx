import React from "react";
import propTypes from "prop-types";
import {Close24} from "@carbon/icons-react";
import SaveAndCloseButtons from "../SaveAndCloseButtons/SaveAndCloseButtons.jsx";
import "./AddAllergy.scss";
import "../../../styles/common.scss";
import {SearchAllergen} from "../SearchAllergen/SearchAllergen.jsx";
import { isEmpty } from "lodash";

export function AddAllergy(props) {
    const { onClose } = props;
    const [allergen, setAllergen] = React.useState({});
    const [reactions, setReactions] = React.useState({});
    const [severity, setSeverity] = React.useState("");
    const [notes, setNotes] = React.useState("");
    const [isFormTouched, setIsFormTouched] = React.useState(false);
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
                        : <></>
                    }
                </div>
                <div>
                    <SaveAndCloseButtons  onSave={()=>{console.log("Saved",allergen, reactions, severity,notes)}} onClose={()=>{console.log("Cancelled"); onClose()}} isSaveDisabled={!isFormTouched}/>
                </div>
            </div>
        </div>
    );
}

AddAllergy.propTypes = {
    onClose: propTypes.func.isRequired
}