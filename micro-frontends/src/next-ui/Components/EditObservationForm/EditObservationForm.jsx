import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { getLocale } from "../i18n/utils";
import { getFormByFormName, getFormDetail, getFormTranslations } from "./EditObservationFormUtils";
import { findByEncounterUuid } from '../../utils/FormDisplayControl/FormView';
import { getLatestPublishedForms } from '../../utils/FormDisplayControl/FormUtils';
import { Modal, Loading } from 'carbon-components-react';
import { FormattedMessage } from "react-intl";
import { I18nProvider } from '../i18n/I18nProvider';
import ErrorNotification from '../ErrorNotification/ErrorNotification';

import "./EditObservationForm.scss";

const EditObservationForm = (props) => {
    const saveButtonText = (
        <FormattedMessage
          id={"SAVE"}
          defaultMessage={"SAVE"}
        />
    );

    const { 
        formName, 
        formNameTranslations,
        closeEditObservationForm, 
        isEditFormLoading,
        setEditFormLoading, 
        patient, 
        formData, 
        encounterUuid, 
        consultationMapper,
        handleEditSave,
        editErrorMessage
    } = props;

    const [loadedFormDetails, setLoadedFormDetails] = useState({});
    const [loadedFormTranslations, setLoadedFormTranslations] = useState({});
    const [updatedObservations, setUpdatedObservations] = useState(null);
    const [editError, setEditError] = useState(false);
    const [encounter, setEncounter] = useState(null);
    const nodeId = "form-renderer";

    const handleSave = () => {
        const editedObservations = updatedObservations.getValue();
        if(editedObservations.errors && editedObservations.errors.length > 0) {
            setEditError(true);
            return;
        }
        encounter.observations = editedObservations.observations;
        encounter.orders = [];
        handleEditSave(encounter);
    };

    const getFormVersion = (latestForms, formName) => {
        var formVersion = 1;
        latestForms.forEach(function (form) {
            if(form.name === formName) {
                formVersion = form.version;
            }
        });
        return formVersion;
    };

    useEffect(() => {
        const fetchFormDetails = async () => {
            if( formData.length > 0 && encounterUuid !== null) {
                const encounterTransaction = await findByEncounterUuid(encounterUuid);
                setEncounter(consultationMapper.map(encounterTransaction));
                
                const latestForms = await getLatestPublishedForms();
                const formVersion = getFormVersion(latestForms, formName);
                const observationForm = getFormByFormName(latestForms, formName, formVersion);
                const formUuid = observationForm.uuid;
                const locale = getLocale();
                const validateForm = false;
                const collapse = false;

                if (!loadedFormDetails[formUuid]) {
                    var formDetails = await getFormDetail(formUuid);
                    const formDetailsAsString = formDetails.resources[0].value;
                    formDetails = JSON.parse(formDetailsAsString);
                    formDetails.version = formVersion;
                    setLoadedFormDetails((prevDetails) => ({ ...prevDetails, [formUuid]: formDetails }));
                    
                    const formParams = { formName: formName, formVersion: formVersion, locale: locale, formUuid: formUuid };
                    const formTranslations = await getFormTranslations(formDetails.translationsUrl, formParams);
                    setLoadedFormTranslations((prevTranslations) => ({ ...prevTranslations, [formUuid]: formTranslations }));

                    setEditFormLoading(false);
                    setUpdatedObservations(window.renderWithControls(formDetails, formData, nodeId, collapse, patient, validateForm, locale, formTranslations));
                }
            }
        };

        fetchFormDetails();
    }, [formData, formName, loadedFormDetails, loadedFormTranslations, patient, encounterUuid]);

    return (
        <>
            <I18nProvider>
                <Modal
                    open
                    passiveModal
                    className="edit-observation-form-modal"
                    onRequestClose={closeEditObservationForm}
                >
                    {
                        isEditFormLoading ? (<Loading />) :
                        <div>
                            <div className='section-title-wrapper'>
                                <h2 className="section-title">{formNameTranslations}</h2>
                                <button className='confirm' onClick={handleSave}>{saveButtonText}</button>
                            </div>
                        <section className="content-body">
                            <section className='section-body'>
                                <div id={nodeId}></div>
                            </section>
                        </section>
                        </div>
                    }
                </Modal>
                { editError && <ErrorNotification setEditError={setEditError} errorMessage={editErrorMessage}/> }
            </I18nProvider>
        </>
    );
};

EditObservationForm.propTypes = {
    formName: PropTypes.string.isRequired,
    formNameTranslations: PropTypes.string.isRequired,
    closeEditObservationForm: PropTypes.func.isRequired,
    isEditFormLoading: PropTypes.bool.isRequired,
    patient: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    encounterUuid: PropTypes.string.isRequired,
    consultationMapper: PropTypes.object.isRequired,
    handleSave: PropTypes.func.isRequired,
    handleSaveError: PropTypes.func.isRequired
};

export default EditObservationForm;