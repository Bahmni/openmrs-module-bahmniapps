import React from "react";
import "./ViewAllergiesAndReactions.scss";
import "../../../styles/common.scss";
import {FormattedMessage} from "react-intl";
import { Accordion, AccordionItem } from "carbon-components-react";
import { Document } from "@carbon/icons-react/next";
import PropTypes from "prop-types";
import {NO_KNOWN_ALLERGY} from "../../constants";
export const ViewAllergiesAndReactions = (props) => {
    const { allergies, showTextAsAbnormal } = props;

    const hasMultipleAllergies = allergies.length > 1;
    const hasNoKnownAllergy = allergies.some(allergy => allergy.allergen === NO_KNOWN_ALLERGY);
    const shouldStrikethroughNoKnown = hasMultipleAllergies && hasNoKnownAllergy;

    return <div className={"next-ui"}>
            <div className={"allergies-row allergies-row-heading"}>
                <div><FormattedMessage id={"ALLERGEN"} defaultMessage={"Allergen"}/></div>
                <div><FormattedMessage id={"REACTIONS"} defaultMessage={"Reaction(s)"}/></div>
                <div><FormattedMessage id={"SEVERITY"} defaultMessage={"Severity"}/></div>
            </div>
            <div>
                {allergies.map((allergy, index) => {
                    const isNoKnownAllergy = allergy.allergen === NO_KNOWN_ALLERGY;
                    const isSevere = allergy.severity?.toLowerCase() === "severe";
                    const className = isNoKnownAllergy && shouldStrikethroughNoKnown
                        ? "no-known-allergy"
                            : showTextAsAbnormal || isSevere
                                ? "red-text"
                                : "";
                    const title = <div key={index}
                                       className={`allergies-row ${className}`}>
                        <div>{allergy.allergen}</div>
                        <div>{allergy.reactions.join(", ")}</div>
                        <div className={"capitalize"}>{allergy.severity}</div>
                    </div>
                    return (<Accordion key={index}>
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