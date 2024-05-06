import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Accordion, AccordionItem } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./formDisplayControl.scss";
import { FormattedMessage } from "react-intl";
import { fetchFormData } from "../../utils/FormDisplayControl/FormUtils";
import moment from "moment";
import { I18nProvider } from '../../Components/i18n/I18nProvider';
/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function FormDisplayControl(props) {
    const noFormText = <FormattedMessage id={'NO_FORM'} defaultMessage={'No Form found for this patient....'} />;
    const formsHeading = <FormattedMessage id={'DASHBOARD_TITLE_FORMS_2_DISPLAY_CONTROL_KEY'} defaultMessage={'Observation Forms'} />;
    const loadingMessage = <FormattedMessage id={'LOADING_MESSAGE'} defaultMessage={'Loading... Please Wait'} />;

    const [formList, setFormList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const buildResponseData = async () => {
        try {
            const formResponseData = await fetchFormData(props?.hostData?.patientUuid, props?.hostData?.numberOfVisits);
            var grouped = {};
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
            setFormList(grouped);
        } catch (e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    const showEdit = function (currentEncounterUUid) {
        return props?.hostData?.showEditForActiveEncounter ? (props?.hostData?.encounterUuid === currentEncounterUUid) : true;
    }

    useEffect(() => {
        buildResponseData();
    }, []);

    return (
        <>
        <I18nProvider>
            <div>
                <h2 className={"section-title"}>
                    {formsHeading}
                </h2>
                {isLoading ? <div className="loading-message">{loadingMessage}</div> : (
                    <div className={"placeholder-text"}>{Object.entries(formList).length > 0 ? (
                        Object.entries(formList).map(([key, value]) => {
                            const moreThanOneEntry = value.length > 1;
                            return (
                                moreThanOneEntry ? (<Accordion>
                                    <AccordionItem title={key} className={"form-accordion"} open>
                                        {
                                            value.map((entry) => {
                                                return (
                                                    <div className={"row-accordion"}>
                                                        <span className={"form-name-text"}><a className="form-link">{moment(entry.encounterDate).format("DD/MM/YYYY HH:MM")}</a>{showEdit(entry.encounterUuid) && <i className="fa fa-pencil"></i>}</span>
                                                        <span className={"form-provider-text"}>{entry.providerName}</span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </AccordionItem>
                                </Accordion>) :
                                    <div className={"row"}>
                                        <span className={"form-non-accordion-text form-heading"}>{key}</span>
                                        <span className={"form-non-accordion-text  form-date-align"}><a className="form-link">{moment(value[0].encounterDate).format("DD/MM/YYYY HH:MM")}</a>{showEdit(value[0].encounterUuid) && <i className="fa fa-pencil"></i>}</span>
                                        <span className={"form-non-accordion-text"}>{value[0].providerName}</span>
                                    </div>
                            );
                        }))
                        : (noFormText)}
                    </div>

                )}

            </div>
        </I18nProvider>
        </>
    );
}

FormDisplayControl.propTypes = {
    hostData: PropTypes.object.isRequired,
};
