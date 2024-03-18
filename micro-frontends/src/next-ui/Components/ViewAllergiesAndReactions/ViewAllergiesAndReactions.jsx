import React from "react";
import "./ViewAllergiesAndReactions.scss";
import "../../../styles/common.scss";
import {FormattedMessage} from "react-intl";
import { Accordion, AccordionItem } from "carbon-components-react";
import { Document } from "@carbon/icons-react/next";
import PropTypes from "prop-types";
export const ViewAllergiesAndReactions = (props) => {
    const { allergies, showTextAsAbnormal } = props;
    return <div className={"next-ui"}>
            <div className={"allergies-row allergies-row-heading"}>
                <div><FormattedMessage id={"ALLERGEN"} defaultMessage={"Allergen"}/></div>
                <div><FormattedMessage id={"REACTIONS"} defaultMessage={"Reaction(s)"}/></div>
                <div><FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"}/></div>
            </div>
            <div>
                {allergies.map((allergy, index) => {
                    const title = <div key={index}
                                       className={` allergies-row ${showTextAsAbnormal ? "allergies-red-text" 
                                           : allergy.severity === "severe" ? "allergies-red-text": ""}`}>
                        <div>{allergy.allergen}</div>
                        <div>{allergy.reactions.join(", ")}</div>
                        <div className={"capitalize"}>{allergy.severity}</div>
                    </div>
                    return (<Accordion>
                        <AccordionItem title={title}>
                            <div className={"allergies-accordion-item"}>
                                <div>
                                    {allergy.note &&
                                        <div className={"allergies-row-note"}><Document size={20}/>
                                            {allergy.note}</div>}
                                </div>
                                <div className={"allergy-provider"}>
                                    {allergy.provider}
                                </div>
                            </div>
                        </AccordionItem>
                    </Accordion>)
                })}
            </div>
        </div>
}

ViewAllergiesAndReactions.propTypes = {
    allergies: PropTypes.array.isRequired,
    showTextAsAbnormal: PropTypes.bool,
}