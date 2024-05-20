import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import EditObservationForm from './EditObservationForm';
import { getFormByFormName, getFormDetail, getFormTranslations } from "./EditObservationFormUtils";
import { findByEncounterUuid } from '../../utils/FormDisplayControl/FormView';
import { getLatestPublishedForms } from '../../utils/FormDisplayControl/FormUtils';

jest.mock('../i18n/utils');
jest.mock('./EditObservationFormUtils');
jest.mock('../../utils/FormDisplayControl/FormView');
jest.mock('../../utils/FormDisplayControl/FormUtils');

window.renderWithControls = jest.fn();

describe('EditObservationForm', () => {
    const props = {
        formName: 'Test Form',
        formNameTranslations: 'Test Form Translations',
        closeEditObservationForm: jest.fn(),
        isEditFormLoading: true,
        setEditFormLoading: jest.fn(),
        patient: { id: 1, name: 'Test Patient' },
        formData: [{
            "formType": "v2",
            "formName": "Orthopaedic Triage",
            "formVersion": 1,
            "visitUuid": "1bf8c151-1786-479b-9ea9-9d26b4247dc7",
            "visitStartDateTime": 1693277349000,
            "encounterUuid": "6e52cecd-a095-457f-9515-38cf9178cb50",
            "encounterDateTime": 1693277657000,
            "providers": [
                {
                    "providerName": "Doctor Two",
                    "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
                }
            ]
        },
        {
            "formType": "v2",
            "formName": "Pre Anaesthesia Assessment",
            "formVersion": 1,
            "visitUuid": "3f5145bb-70b1-4240-97c8-66c5cb1944af",
            "visitStartDateTime": 1692871165000,
            "encounterUuid": "8a5598e3-0598-410a-a8aa-778ca2264791",
            "encounterDateTime": 1693217959000,
            "providers": [
                {
                    "providerName": "Doctor One",
                    "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
                }
            ]
        },
        {
            "formType": "v2",
            "formName": "Patient Progress Notes and Orders",
            "formVersion": 1,
            "visitUuid": "1bf8c151-1786-479b-9ea9-9d26b4247dc7",
            "visitStartDateTime": 1693277349000,
            "encounterUuid": "6e52cecd-a095-457f-9515-38cf9178cb50",
            "encounterDateTime": 1693277657000,
            "providers": [
                {
                    "providerName": "Doctor One",
                    "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
                }
            ]
        },
        {
            "formType": "v2",
            "formName": "Pre Anaesthesia Assessment",
            "formVersion": 1,
            "visitUuid": "3f5145bb-70b1-4240-97c8-66c5cb1944af",
            "visitStartDateTime": 1692871165000,
            "encounterUuid": "4c73a202-0b2b-4195-b415-3151d69bfb73",
            "encounterDateTime": 1692950695000,
            "providers": [
                {
                    "providerName": "Doctor One",
                    "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
                }
            ]
        }],
        encounterUuid: 'encounter-uuid',
        consultationMapper: { map: jest.fn().mockReturnValue({}) },
        handleEditSave: jest.fn(),
        handleSave: jest.fn(),
        handleSaveError: jest.fn(),
        editErrorMessage: 'Error saving form',
    };

    beforeEach(() => {
        findByEncounterUuid.mockResolvedValue({});
        getLatestPublishedForms.mockResolvedValue([]);
        getFormByFormName.mockReturnValue({ uuid: 'form-uuid' });
        getFormDetail.mockResolvedValue({ resources: [{ value: '{}' }] });
        getFormTranslations.mockResolvedValue({});
        props.setEditFormLoading.mockClear();
        window.renderWithControls.mockReturnValue({
            getValue: jest.fn().mockReturnValue({
                errors: [],
                observations: []
            })
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading state correctly', async () => {
        act(() =>{
            const { container } = render(<EditObservationForm {...props} />);
            expect(container.getElementsByClassName('edit-observation-form-modal').length).toBe(0);
        });
        
    });

    test('renders form correctly after loading', async () => {
        props.isEditFormLoading = false;
        act(() =>render(<EditObservationForm {...props} />));
        await waitFor(() => expect(screen.getByText('Test Form Translations')).toBeTruthy());
        expect(screen.getByText(/SAVE/i)).toBeTruthy();
        expect(screen.getByText('Test Form Translations')).toBeTruthy();
    });

    test('calls handleSave on save button click', async () => {
        props.isEditFormLoading = false;
        act(() =>render(<EditObservationForm {...props} />));
        await waitFor(() => expect(screen.getByText(/SAVE/i)).toBeTruthy());
        await act(() =>fireEvent.click(screen.getByText(/SAVE/i)));
        await waitFor(() => expect(props.handleEditSave).toHaveBeenCalled());
    });

    test('fetches form details and sets state correctly', async () => {
        props.isEditFormLoading = false;
        act(() =>render(<EditObservationForm {...props} />));
        await waitFor(() => expect(getLatestPublishedForms).toHaveBeenCalled());
        await waitFor(() => expect(findByEncounterUuid).toHaveBeenCalledWith(props.encounterUuid));
        await waitFor(() => expect(getFormDetail).toHaveBeenCalledWith('form-uuid'));
        await waitFor(() => expect(getFormTranslations).toHaveBeenCalled());
    });

    test('does not call handleEditSave on save button click when error occurs', async () => {
        props.isEditFormLoading = false;
        window.renderWithControls.mockReturnValue({
            getValue: jest.fn().mockReturnValue({
                errors: ["error", "error1"],
                observations: []
            })
        });
        act(() =>render(<EditObservationForm {...props} />));
        await waitFor(() => expect(screen.getByText(/SAVE/i)).toBeTruthy());
        await act(() =>fireEvent.click(screen.getByText(/SAVE/i)));
        await waitFor(() => expect(props.handleEditSave).not.toHaveBeenCalled());
    });
});
