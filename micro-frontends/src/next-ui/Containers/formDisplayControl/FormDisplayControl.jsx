import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import { FormattedMessage } from "react-intl";
import { fetchFormData } from "../../utils/FormDisplayControl/FormUtils"
import { Accordion, AccordionItem } from "carbon-components-react";
/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function FormDisplayControl(props) {
    //     const { isAddButtonEnabled = true, hostData } = props;
    //     const { uuid } = hostData;
    //     const [showAddAllergyPanel, setShowAddAllergyPanel] = useState(false);
    const [formList, setFormList] = useState({});
    console.log('Props ', props);
    useEffect(() => {
        setFormList(buildResponseData(props?.hostData?.patientId));
    }, []);
    const noFormText = <FormattedMessage id={'NO_FORM'} defaultMessage={'No Form found for this patient....'} />;
    const formsHeading = <FormattedMessage id={'FORMS_HEADING'} defaultMessage={'Forms'} />;
    const buildResponseData = async (uuid) => {
        const formResponseData = await fetchFormData(uuid);
        var grouped = {};
        console.log('formResponseData ', formResponseData);
        if (formResponseData?.length > 0) {
            formResponseData.forEach(function (formEntry) {
                grouped[formEntry.formName] = grouped[formEntry.formName] || [];
                grouped[formEntry.formName].push({ date: formEntry.encounterDateTime, providerName: formEntry.providers[0].providerName });
            });
        }
        console.log('grouped buildResponseData', grouped);
        return grouped;
    };
    
    //     const addButtonText = <FormattedMessage id={'ADD_BUTTON_TEXT'} defaultMessage={'Add +'}/>;
    console.log('formList ', formList);
    console.log('formList ', formList?.length);
    const sampleList = {
        "Orthopaedic Triage": [
            {
                "date": 1692690519000,
                "providerName": "Patient RURANGIRWAAAAAAA"
            },
            {
                "date": 1692690265000,
                "providerName": "Patient RURANGIRWAAAAAAA"
            },
            {
                "date": 1692693805000,
                "providerName": "Tim Nunn"
            }
        ],
        "Admission Order Form": [
            {
                "date": 1692774584000,
                "providerName": "Patient RURANGIRWAAAAAAA"
            }
        ]
    }
    console.log('sampleList ', Object.entries(sampleList).length);

    return (
        <div>
            <h2 className={"section-title"}>
                {formsHeading}
            </h2>

            <div className={"placeholder-text"}>{Object.entries(formList).length > 0 ? (

                Object.entries(formList).map(([key, value]) => {
                    console.log('key ', key);
                    console.log('value ', value);
                    return (
                        <Accordion>
                            <AccordionItem title={key}>
                                {
                                    value.map((entry) => {
                                        return (
                                            <p>
                                                <ul key={entry.date}>
                                                    <li class="clearfix">{moment(new Date(entry.date)).format("DD/MM/YYYY HH:MM")}</li>
                                                    <li class="clearfix">{entry.providerName}</li>
                                                </ul>
                                            </p>
                                        );
                                    })
                                }

                            </AccordionItem>
                        </Accordion>
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
            <div className={"placeholder-text"}>{Object.entries(sampleList).length > 0 ? (

                Object.entries(sampleList).map(([key, value]) => {
                    console.log('key ', key);
                    console.log('value ', value);
                    return (
                        <Accordion>
                            <AccordionItem title={key}>
                                {
                                    value.map((entry) => {
                                        return (
                                            <div className='placeholder-text'>
                                                <ul key={entry.date}>
                                                    <li class="clearfix">{moment(new Date(entry.date)).format("DD/MM/YYYY HH:MM")}</li>
                                                    <li class="clearfix">{entry.providerName}</li>
                                                </ul>
                                            </div>
                                        );
                                    })
                                }

                            </AccordionItem>
                        </Accordion>
                    );
                }))

                : (noFormText)}
            </div>
        </div>
    );
}

FormDisplayControl.propTypes = {
    hostData: PropTypes.shape({
        patientId: PropTypes.string,
        encounterId: PropTypes.string,
    }).isRequired,
};
