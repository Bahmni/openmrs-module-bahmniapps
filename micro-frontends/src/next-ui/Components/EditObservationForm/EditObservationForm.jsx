import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import {renderWithControls} from 'bahmni-form-controls';
import { getLocale } from "../i18n/utils";
import {getFormDetail, getFormTranslations} from "./EditObservationFormUtils";
import { Modal } from 'carbon-components-react';

import "./EditObservationForm.scss";

const EditObservationForm = (props) => {
    const { form, closeEditObservationForm, patient, validateForm } = props;
    const [loadedFormDetails, setLoadedFormDetails] = useState({});
    const [loadedFormTranslations, setLoadedFormTranslations] = useState({});

    // useEffect(() => {
    //     const unMountReactContainer = (formUuid) => {


    //     };


    //     const fetchFormDetails = async () => {
    //     const formUuid = form.formUuid;
    //     const formVersion = form.formVersion;
    //     const formName = form.formName;
    //     const formObservations = form.observations;
    //     const collapse = form.collapseInnerSections && form.collapseInnerSections.value;
    //     const locale = getLocale();

    //     if (!loadedFormDetails[formUuid]) {
    //         try {
    //         const response = await getFormDetail(formUuid);
    //         const formDetails = response.data;  
    //         formDetails.version = formVersion;
    //         setLoadedFormDetails((prevDetails) => ({ ...prevDetails, [formUuid]: formDetails }));

    //         const formParams = { formName, formVersion, locale, formUuid };
    //         const formTranslations = await getFormTranslations(formDetails.translationsUrl, formParams);
    //         setLoadedFormTranslations((prevTranslations) => ({ ...prevTranslations, [formUuid]: formTranslations }));

    //         const formComponent = renderWithControls(formDetails, formObservations, formUuid, collapse, patient, validateForm, locale, formTranslations);
    //         setFormComponent(formComponent);
    //         unMountReactContainer(formUuid);
    //         } catch (error) {
    //         console.error('Error fetching form details:', error);
    //         }
    //     } else {
    //         const formComponent = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse, patient, validateForm, locale, loadedFormTranslations[formUuid]);
    //         setFormComponent(formComponent);
    //         unMountReactContainer(formUuid);
    //     }
    //     };

    //     fetchFormDetails();

    //     return () => {

    //     };
    // }, [form, loadedFormDetails, loadedFormTranslations, patient, validateForm]);

    // const [formComponent, setFormComponent] = useState(null);

    // useEffect(() => {
    //     const collapse = form.collapseInnerSections && form.collapseInnerSections.value;
    //     if (loadedFormDetails[formUuid]) {
    //         const formComponent = renderWithControls(loadedFormDetails[formUuid], formObservations, formUuid, collapse, patient, validateForm, locale, loadedFormTranslations[formUuid]);
    //         setFormComponent(formComponent);
    //     }

    // }, [form.collapseInnerSections]);

    // useEffect(() => {

    // }, [loadedFormDetails]);

    return (
        <div>
            <Modal
                open
                passiveModal
                className="edit-observation-form-modal"
                onRequestClose={closeEditObservationForm}
            >
                <h1>Hello</h1>
            </Modal>
        </div>
    );
};

EditObservationForm.propTypes = {
    form: PropTypes.shape({
        formUuid: PropTypes.string.isRequired,
        formVersion: PropTypes.string.isRequired,
        formName: PropTypes.string.isRequired,
        observations: PropTypes.array.isRequired,
        collapseInnerSections: PropTypes.object,
        }).isRequired,
    patient: PropTypes.object.isRequired,
    validateForm: PropTypes.func.isRequired,

  };
export default EditObservationForm;