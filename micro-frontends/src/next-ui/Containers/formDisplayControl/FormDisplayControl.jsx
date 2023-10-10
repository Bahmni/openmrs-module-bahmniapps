import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./formDisplayControl.scss";
import { FormattedMessage } from "react-intl";
import { fetchFormData } from "../../utils/FormDisplayControl/FormUtils";
import { buildFormMap } from "../../utils/FormDisplayControl/FormView";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import ViewObservationForm from "../../Components/ViewObservationForm/ViewObservationForm";
import { formatDate } from "../../index";

/** NOTE: for reasons known only to react2angular,
 * any functions passed in as props will be undefined at the start, even ones inside other objects
 * so you need to use the conditional operator like props.hostApi?.callback even though it is a mandatory prop
 */

export function FormDisplayControl(props) {
  const noFormText = (
    <FormattedMessage
      id={"NO_FORM"}
      defaultMessage={"No Form found for this patient...."}
    />
  );
  const formsHeading = (
    <FormattedMessage
      id={"DASHBOARD_TITLE_FORMS_2_DISPLAY_CONTROL_KEY"}
      defaultMessage={"Observation Forms"}
    />
  );
  const loadingMessage = (
    <FormattedMessage
      id={"LOADING_MESSAGE"}
      defaultMessage={"Loading... Please Wait"}
    />
  );

  const [formList, setFormList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [showViewObservationForm, setViewObservationForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formData, setFormData] = useState([]);
  const [isViewFormLoading, setViewFormLoading] = useState(false);

  const buildResponseData = async () => {
    try {
      const formResponseData = await fetchFormData(
        props?.hostData?.patientUuid,
        props?.hostData?.numberOfVisits
      );
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
            providerUuid: formEntry.providers[0].uuid,
          });
        });
      }
      Object.keys(grouped).forEach(function (key) {
        grouped[key] = grouped[key].sort((a, b) => {
          return new Date(b.encounterDate) - new Date(a.encounterDate);
        });
      });
      setFormList(grouped);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const showEdit = function (currentEncounterUUid) {
    return props?.hostData?.showEditForActiveEncounter
      ? props?.hostData?.encounterUuid === currentEncounterUUid
      : true;
  };

  const openViewObservationForm = async (formName, encounterUuid) => {
    var formMap = {
      formName: formName,
      encounterUuid: encounterUuid,
      hasNoHierarchy: props?.hostData?.hasNoHierarchy,
    };
    setFormName(formName);
    setViewFormLoading(true);
    setViewObservationForm(true);
    const data = await buildFormMap(formMap);
    setViewFormLoading(false);
    setFormData(data[0].value[0].groupMembers);
  };

  const closeViewObservationForm = () => setViewObservationForm(false);

  useEffect(() => {
    buildResponseData();
  }, []);

  return (
    <>
      <I18nProvider>
        <div>
          <h2 className={"forms-display-control-section-title"}>
            {formsHeading}
          </h2>
          {isLoading ? (
            <div className="loading-message">{loadingMessage}</div>
          ) : (
            <div className={"placeholder-text-forms-control"}>
              {Object.entries(formList).length > 0
                ? Object.entries(formList).map(([key, value]) => {
                    const moreThanOneEntry = value.length > 1;
                    return moreThanOneEntry ? (
                      <Accordion>
                        <AccordionItem
                          title={key}
                          className={"form-accordion"}
                          open
                        >
                          {value.map((entry, index) => {
                            return (
                              <div key={index} className={"row-accordion"}>
                                <span className={"form-name-text"}>
                                  <a
                                    onClick={() =>
                                      openViewObservationForm(
                                        key,
                                        entry.encounterUuid
                                      )
                                    }
                                    className="form-link"
                                  >
                                    {formatDate(entry.encounterDate)}
                                  </a>
                                  {showEdit(entry.encounterUuid) && (
                                    <i className="fa fa-pencil"></i>
                                  )}
                                </span>
                                <span className={"form-provider-text"}>
                                  {entry.providerName}
                                </span>
                              </div>
                            );
                          })}
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <div className={"form-display-control-row"}>
                        <span
                          className={
                            "form-non-accordion-text form-heading form-name"
                          }
                        >
                          {key}
                        </span>
                        <span
                          className={
                            "form-non-accordion-text form-date-align form-date-time"
                          }
                        >
                          <a
                            className="form-link"
                            onClick={() =>
                              openViewObservationForm(
                                key,
                                value[0].encounterUuid
                              )
                            }
                          >
                            {formatDate(value[0].encounterDate)}
                          </a>
                          {showEdit(value[0].encounterUuid) && (
                            <i className="fa fa-pencil"></i>
                          )}
                        </span>
                        <span
                          className={"form-non-accordion-text provider-name"}
                        >
                          {value[0].providerName}
                        </span>
                      </div>
                    );
                  })
                : noFormText}
              {showViewObservationForm ? (
                <ViewObservationForm
                  isViewFormLoading={isViewFormLoading}
                  formName={formName}
                  closeViewObservationForm={closeViewObservationForm}
                  formData={formData}
                />
              ) : null}
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
