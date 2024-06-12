import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Accordion, AccordionItem } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import "./formDisplayControl.scss";
import { FormattedMessage } from "react-intl";
import {
  fetchFormData,
  getLatestPublishedForms,
} from "../../utils/FormDisplayControl/FormUtils";
import {
  buildFormMap,
  findByEncounterUuid,
  doesUserHaveAccessToTheForm,
} from "../../utils/FormDisplayControl/FormView";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import ViewObservationForm from "../../Components/ViewObservationForm/ViewObservationForm";
import { formatDate } from "../../utils/utils";
import EditObservationForm from "../../Components/EditObservationForm/EditObservationForm";

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
  const [showEditObservationForm, setEditObservationForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formNameTranslations, setFormNameTranslations] = useState("");
  const [formData, setFormData] = useState([]);
  const [isViewFormLoading, setViewFormLoading] = useState(false);
  const [isEditFormLoading, setEditFormLoading] = useState(false);
  const [encounterUuid, setEncounterUuid] = useState("");

  const buildResponseData = async () => {
    try {
      const formResponseData = await fetchFormData(
        props?.hostData?.patientUuid,
        props?.hostData?.numberOfVisits
      );
      const latestForms = await getLatestPublishedForms();
      var grouped = {};
      if (formResponseData?.length > 0 && latestForms?.length > 0) {
        formResponseData.forEach(function (formEntry) {
          const latestForm = latestForms.find(
            (latestForm) => formEntry.formName == latestForm.name
          );
          grouped[formEntry.formName] = grouped[formEntry.formName] || [];
          grouped[formEntry.formName].push({
            encounterDate: formEntry.encounterDateTime,
            encounterUuid: formEntry.encounterUuid,
            visitUuid: formEntry.visitUuid,
            visitDate: formEntry.visitStartDateTime,
            providerName: formEntry.providers[0].providerName,
            providerUuid: formEntry.providers[0].uuid,
            formVersion: formEntry.formVersion,
            formNameTranslations: getFormDisplayName(latestForm),
            privileges: latestForm?.privileges,
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

  const getFormDisplayName = function (form) {
    const locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
    const formNameTranslations = form?.nameTranslation
      ? JSON.parse(form.nameTranslation)
      : [];
    let formDisplayName = form?.name;
    if (formNameTranslations.length > 0) {
      const currentLabel = formNameTranslations.find(function (
        formNameTranslation
      ) {
        return formNameTranslation.locale === locale;
      });
      formDisplayName = currentLabel ? currentLabel.display : form?.name;
    }
    return formDisplayName;
  };

  const showEdit = function (currentEncounterUuid) {
    return props?.hostData?.showEditForActiveEncounter
      ? props?.hostData?.encounterUuid === currentEncounterUuid
      : true;
  };

  const handleEditSave = (encounter) => {
    props?.hostApi?.handleEditSave(encounter);
  };

  const openViewObservationForm = async (
    formName,
    encounterUuid,
    formNameTranslations
  ) => {
    var formMap = {
      formName: formName,
      encounterUuid: encounterUuid,
      hasNoHierarchy: props?.hostData?.hasNoHierarchy,
    };
    setFormName(formName);
    setFormNameTranslations(formNameTranslations);
    setViewFormLoading(true);
    setViewObservationForm(true);
    const data = await buildFormMap(formMap);
    setViewFormLoading(false);
    setFormData(data[0].value[0].groupMembers);
  };

  const openEditObservationForm = async (
    formName,
    encounterUuid,
    formNameTranslations
  ) => {
    var formMap = {
      formName: formName,
      encounterUuid: encounterUuid,
      hasNoHierarchy: props?.hostData?.hasNoHierarchy,
    };
    setEditFormLoading(true);
    setEditObservationForm(true);
    const data = await findByEncounterUuid(formMap.encounterUuid);
    const filteredFormObs = data.observations.filter((obs) =>
      obs.formFieldPath?.includes(formName)
    );
    setFormName(formName);
    setFormNameTranslations(formNameTranslations);
    setEncounterUuid(encounterUuid);
    setFormData(filteredFormObs);
  };

  const closeViewObservationForm = () => {
    setFormData([]);
    setFormName("");
    setFormNameTranslations("");
    setViewObservationForm(false);
  };
  const closeEditObservationForm = () => {
    setFormData([]);
    setFormName("");
    setFormNameTranslations("");
    setEditObservationForm(false);
  };

  const checkForPrivileges = (data, action) => {
    return doesUserHaveAccessToTheForm(
      props?.hostData?.currentUser?.privileges,
      data,
      action
    );
  };

  const printForm = () => {
    formData.map(function(obs) {
      if (obs?.groupMembers?.length > 0) {
        obs.encounterDateTime = obs?.groupMembers[0].encounterDateTime;
      }
    })
    props?.hostApi?.printForm(formData);
  };

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
                          title={value[0].formNameTranslations}
                          className={"form-accordion"}
                          open
                        >
                          {value.map((entry, index) => {
                            return (
                              <div key={index} className={"row-accordion"}>
                                <span className={"form-name-text"}>
                                  {checkForPrivileges(entry, "view") ? (
                                    <a
                                      onClick={() =>
                                        openViewObservationForm(
                                          key,
                                          entry.encounterUuid,
                                          entry.formNameTranslations
                                        )
                                      }
                                      className="form-link"
                                    >
                                      {formatDate(entry.encounterDate)}
                                    </a>
                                  ) : (
                                    formatDate(entry.encounterDate)
                                  )}
                                  {checkForPrivileges(entry, "edit") &&
                                    showEdit(entry.encounterUuid) && (
                                      <i
                                        className="fa fa-pencil"
                                        onClick={() => {
                                          openEditObservationForm(
                                            key,
                                            entry.encounterUuid,
                                            entry.formNameTranslations
                                          );
                                        }}
                                      ></i>
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
                          {value[0].formNameTranslations}
                        </span>
                        <span
                          className={
                            "form-non-accordion-text form-date-align form-date-time"
                          }
                        >
                          {checkForPrivileges(value[0], "view") ? (
                            <a
                              className="form-link"
                              onClick={() =>
                                openViewObservationForm(
                                  key,
                                  value[0].encounterUuid,
                                  value[0].formNameTranslations
                                )
                              }
                            >
                              {formatDate(value[0].encounterDate)}
                            </a>
                          ) : (
                            formatDate(value[0].encounterDate)
                          )}
                          {checkForPrivileges(value[0], "edit") &&
                            showEdit(value[0].encounterUuid) && (
                              <i
                                className="fa fa-pencil"
                                onClick={() => {
                                  openEditObservationForm(
                                    key,
                                    value[0].encounterUuid,
                                    value[0].formNameTranslations
                                  );
                                }}
                              ></i>
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
                  formNameTranslations={formNameTranslations}
                  closeViewObservationForm={closeViewObservationForm}
                  formData={formData}
                  showPrintOption={props?.hostData?.showPrintOption}
                  printForm={printForm}
                />
              ) : null}
              {showEditObservationForm ? (
                <EditObservationForm
                  isEditFormLoading={isEditFormLoading}
                  formName={formName}
                  formNameTranslations={formNameTranslations}
                  closeEditObservationForm={closeEditObservationForm}
                  patient={props?.hostData?.patient}
                  formData={formData != [] && formData}
                  encounterUuid={encounterUuid}
                  consultationMapper={props?.hostData?.consultationMapper}
                  handleEditSave={handleEditSave}
                  setEditFormLoading={setEditFormLoading}
                  editErrorMessage={props?.hostData?.editErrorMessage}
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
  hostApi: PropTypes.object.isRequired
};
