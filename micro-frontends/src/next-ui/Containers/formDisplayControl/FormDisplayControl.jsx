import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionItem } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./FormDisplayControl.scss";
import { FormattedMessage } from "react-intl";
import { fetchFormData } from "../../utils/FormDisplayControl/FormUtils";
import moment from "moment";
/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function FormDisplayControl(props) {
    //     const { isAddButtonEnabled = true, hostData } = props;
    //     const { uuid } = hostData;
    //     const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    const noFormText = <FormattedMessage id={'NO_FORM'} defaultMessage={'No Form found for this patient....'} />;
    const formsHeading = <FormattedMessage id={'FORMS_HEADING'} defaultMessage={'Forms'} />;

    const [formList, setFormList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const buildResponseData = async () => {
        try {
            const formResponseData = await fetchFormData(props?.hostData?.uuid);
            var grouped = {};
            console.log('formResponseData ', formResponseData);
            if (formResponseData?.length > 0) {
                formResponseData.forEach(function (formEntry) {
                    grouped[formEntry.formName] = grouped[formEntry.formName] || [];
                    grouped[formEntry.formName].push({
                        encounterDate: formEntry.encounterDateTime,
                        encounterUuid: formEntry.encounterUuid,
                        visitUuid: formEntry.visitUuid,
                        visitDate: formEntry.visitStartDateTime,
                        providerName: formEntry.providers[0].providerName,
                        providerUuid: formEntry.providers[0].uuid
                    });
                });
            }
            Object.keys(grouped).forEach(function (key) {
                grouped[key] = grouped[key].sort((a, b) => {
                    return new Date(b.encounterDate) - new Date(a.encounterDate);
                });
            })
            console.log('grouped buildResponseData', grouped);
            setFormList(grouped);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        buildResponseData();
    }, []);

    return (
        <div>
            <h2 className={"section-title"}>
                {formsHeading}
            </h2>
            {isLoading ? <div>Loading... Please Wait</div> : (
                <div className={"placeholder-text"}>{Object.entries(formList).length > 0 ? (

                    Object.entries(formList).map(([key, value]) => {
                        console.log('key ', key);
                        console.log('value ', value);
                        const moreThanOneEntry = value.length > 1;
                        return (
                            moreThanOneEntry ? (<Accordion>
                                <AccordionItem title={key} className={"form-accordion"} open>
                                    {
                                        value.map((entry) => {
                                            return (
                                                <div className={"row acc-spacing"}>
                                                    <span className={"form-name-text"}><a className="form-link">{moment(entry.encounterDate).format("DD/MM/YYYY HH:MM")}</a><i className="fa fa-pencil"></i></span>
                                                    <span className={"form-provider-text"}>{entry.providerName}</span>
                                                </div>
                                            );
                                        })
                                    }
                                </AccordionItem>
                            </Accordion>) :
                                <div className={"row"}>
                                    <span className={"form-non-accordion-text"}>{key}</span>
                                    <span className={"form-non-accordion-text  form-date-align"}><a className="form-link">{moment(value[0].encounterDate).format("DD/MM/YYYY HH:MM")}</a><i className="fa fa-pencil"></i></span>
                                    <span className={"form-non-accordion-text"}>{value[0].providerName}</span>
                                </div>

                        );
                    }))
                    /* (sampleList?.map((key, value) => {
                        console.log('key ', key);
                        console.log('value ', value);
                        <Accordion>
                            {sampleList[key]?.length > 1 ? (sampleList[key].forEach(entry => {
                                return (
                                    <AccordionItem title={key}>
                                        <span>{entry['date']}</span>
                                        <span>{entry['providerName']}</span>
                                    </AccordionItem>
                                );
                            })) : <span>{sampleList[key]}   {sampleList[key]['date']}  {sampleList[key]['providerName']}</span>}
    
                        </Accordion>
                    }))
    
                    (formList?.map(key => {
                        return (
                            <div key={key}>
                                <span>{key}</span>
                                <span>{formList[key]}</span>
                            </div>
                        );
                    }))  */

                    : (noFormText)}
                </div>

            )}

        </div>
    );
}

FormDisplayControl.propTypes = {
    hostData: PropTypes.object.isRequired,
};
