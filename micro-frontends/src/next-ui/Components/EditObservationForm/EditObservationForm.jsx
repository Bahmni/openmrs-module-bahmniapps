import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import { getLocale } from "../i18n/utils";
import { getAllForms, getFormByFormName ,getFormDetail, getFormTranslations, setEditableObservations } from "./EditObservationFormUtils";
import { Modal, Loading } from 'carbon-components-react';
import { FormattedMessage } from "react-intl";
import { I18nProvider } from '../i18n/I18nProvider';

import "./EditObservationForm.scss";

const EditObservationForm = (props) => {
    const saveButtonText = (
        <FormattedMessage
          id={"SAVE_BUTTON_TEXT"}
          defaultMessage={"SAVE"}
        />
    );

    const { formName, closeEditObservationForm, isEditFormLoading, patient, formData, handleEditSave } = props;
    const [loadedFormDetails, setLoadedFormDetails] = useState({});
    const [loadedFormTranslations, setLoadedFormTranslations] = useState({});
    const [updatedObservations, setUpdatedObservations] = useState(null);

    const handleSave = () => {
        handleEditSave(formData, updatedObservations.getValue());
    };

    useEffect(() => {
        const fetchFormDetails = async () => {
            if( formData.length > 0 ) {
                const formVersion = "1";
                const allForms = await getAllForms();
                const observationForm = getFormByFormName(allForms, formName, formVersion);
                const formUuid = observationForm.uuid;
                const locale = getLocale();
                
                const validateForm = false;
                const collapse = false;
                const nodeId = "form-renderer";

                if (!loadedFormDetails[formUuid]) {
                    var formDetails = await getFormDetail(formUuid);
                    const formDetailsAsString = formDetails.resources[0].value;
                    formDetails = JSON.parse(formDetailsAsString);
                    formDetails.version = formVersion;

                    setLoadedFormDetails((prevDetails) => ({ ...prevDetails, [formUuid]: formDetails }));
                    
                    const formParams = { formName, formVersion, locale, formUuid };
                    const formTranslations = await getFormTranslations(formDetails.translationsUrl, formParams);
                    setLoadedFormTranslations((prevTranslations) => ({ ...prevTranslations, [formUuid]: formTranslations }));

                    var editableObservations = [];
                    formData.forEach(function (observation) {
                        setEditableObservations(observation, formName, formVersion, editableObservations);
                    });
                    
                    setUpdatedObservations(window.renderWithControls(formDetails, editableObservations, nodeId, collapse, patient, validateForm, locale, formTranslations));
                }
            }
        };
        fetchFormDetails();
    }, [formData, formName, loadedFormDetails, loadedFormTranslations, patient]);

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
                                <h2 className="section-title">{formName}</h2>
                                <button className='confirm' onClick={handleSave}>{saveButtonText}</button>
                            </div>
                        <section className="content-body">
                            <section className='section-body'>
                                <div id="form-renderer"></div>
                            </section>
                        </section>
                        </div>
                    }
                </Modal>
            </I18nProvider>
        </>
    );
};

EditObservationForm.propTypes = {
    formName: PropTypes.string.isRequired,
    closeEditObservationForm: PropTypes.func.isRequired,
    isEditFormLoading: PropTypes.bool.isRequired,
    patient: PropTypes.object.isRequired,
    formData: PropTypes.object.isRequired,
    handleSave: PropTypes.func.isRequired
  };
export default EditObservationForm;