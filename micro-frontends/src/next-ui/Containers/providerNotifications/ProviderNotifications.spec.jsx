import React from 'react';
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react';
import { ProviderNotifications } from './ProviderNotifications';
import { getCookies } from '../../utils/cookieHandler/cookieHandler';
import { getProvider, getEmergencyDrugAcknowledgements, sortMedicationList, groupByIdentifier, acknowledgeEmergencyMedication, getPatientIPDDashboardUrl } from '../../utils/providerNotifications/ProviderNotificationUtils';

jest.mock('../../utils/cookieHandler/cookieHandler', () => ({
    getCookies: jest.fn(),
}));

jest.mock('../../utils/providerNotifications/ProviderNotificationUtils', () => ({
    getProvider: jest.fn(),
    getEmergencyDrugAcknowledgements: jest.fn(),
    sortMedicationList: jest.fn(),
    groupByIdentifier: jest.fn(),
    acknowledgeEmergencyMedication: jest.fn(),
    getPatientIPDDashboardUrl: jest.fn()
}));

describe('ProviderNotifications Component', () => {
    const cookiesMock = {
        "bahmni.user.location": JSON.stringify({ uuid: 'location-uuid' }),
    };
    const providerMock = { currentProvider: { uuid: 'provider-uuid' } };
    const emergencyDrugAcknowledgementResponseMock = [
        {
        identifier: 'PID123',
        administered_date_time: [2022,6,9],
        administered_drug_name: 'Drug A',
        administered_dose: '10mg',
        administered_dose_units: 'mg',
        administered_route: 'Oral',
        date_of_birth: [1990,1,1],
        gender: 'M',
        name: 'John Doe',
        patient_uuid: 'patient123',
        visit_uuid: 'visit123',
        medication_administration_performer_uuid: 'performer123',
        medication_administration_uuid: 'medication123'
        }
    ];
    const groupedByIdentifierMock = { PID123: emergencyDrugAcknowledgementResponseMock };
    const sortedMedicationListMock = [emergencyDrugAcknowledgementResponseMock];
    const acknowledgeResponseMock = { success: true, message: 'Acknowledgement successful' };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date('2024-06-09'));
        getCookies.mockReturnValue(cookiesMock);
        getProvider.mockResolvedValue(providerMock);
        getEmergencyDrugAcknowledgements.mockResolvedValue(emergencyDrugAcknowledgementResponseMock);
        groupByIdentifier.mockReturnValue(groupedByIdentifierMock);
        sortMedicationList.mockReturnValue(sortedMedicationListMock);
        acknowledgeEmergencyMedication.mockResolvedValue(acknowledgeResponseMock);
    });

    it('should render without crashing and display no drugs to be acknowledged message', async () => {
        jest.clearAllMocks();
        sortMedicationList.mockReturnValue([]);
        await act(async () => {
            render(<ProviderNotifications />);
        });
        expect(await screen.findByText(/You have no new drugs to be acknowledged/i)).toBeTruthy();
    });

    it('renders the component without crashing when drugs are to be acknowledged', async () => {
        let container;
        await act(async () => {
            ({ container } = render(<ProviderNotifications />));
        });
        expect(container).toMatchSnapshot();
    });

    it('should render and display acknowledgment required message with patients list', async () => {
        await act(async () => {
            render(<ProviderNotifications />);
        });
        expect(await screen.findByText(/Acknowledgement required:/i)).toBeTruthy();
        expect(await screen.findByText(/John Doe - Male, 34 years 4 months 8 days/i)).toBeTruthy();
    });

    it('should call handleOnClick and display success notification on acknowledge button click', async () => {
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(screen.getByText(/John Doe - Male, 34 years 4 months 8 days/i)).toBeTruthy());
        const notesInput = screen.getByPlaceholderText('Enter Notes');
        act(() => {
            fireEvent.change(notesInput, { target: { value: 'Some notes' } });
        });
        expect(notesInput.value).toBe('Some notes');
        const acknowledgeButton = screen.getByText("Acknowledge", { exact: true });
        act(() => {
            fireEvent.click(acknowledgeButton);
        });
        await waitFor(() => expect(acknowledgeEmergencyMedication).toHaveBeenCalled());
        expect(await screen.findByText(/Acknowledgement successful/i)).toBeTruthy();
    });

    it('should display error notification if acknowledgeEmergencyMedication fails', async () => {
        const errorResponseMock = { success: false, message: 'Acknowledgement failed' };
        acknowledgeEmergencyMedication.mockResolvedValueOnce(errorResponseMock);
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(screen.getByText(/John Doe - Male, 34 years 4 months 8 days/i)).toBeTruthy());
        const notesInput = screen.getByPlaceholderText('Enter Notes');
        act(() => {
            fireEvent.change(notesInput, { target: { value: 'Some notes' } });
        });
        expect(notesInput.value).toBe('Some notes');
        const acknowledgeButton = screen.getByText("Acknowledge", { exact: true });
        act(() => {
            fireEvent.click(acknowledgeButton);
        });
        await waitFor(() => expect(acknowledgeEmergencyMedication).toHaveBeenCalled());
        expect(await screen.findByText(/Acknowledgement failed/i)).toBeTruthy();
    });

    it('should fetch provider and medications on component mount', async () => {
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(getProvider).toHaveBeenCalled());
        await waitFor(() => expect(getEmergencyDrugAcknowledgements).toHaveBeenCalled());
    });

    it('should handle errors during fetching provider and medications', async () => {
        getProvider.mockRejectedValueOnce(new Error('Failed to fetch provider'));
        console.error = jest.fn(); // Suppress error logging in test output
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(getProvider).toHaveBeenCalled());
        expect(console.error).toHaveBeenCalledWith(new Error('Failed to fetch provider'));
    });

    it('should set notification when an error occurs', async () => {
        acknowledgeEmergencyMedication.mockImplementationOnce(() => {
            throw new Error('New Error');
        });
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(screen.getByText(/John Doe - Male, 34 years 4 months 8 days/i)).toBeTruthy());
        const notesInput = screen.getByPlaceholderText('Enter Notes');
        act(() => {
            fireEvent.change(notesInput, { target: { value: 'Some notes' } });
        });
        expect(notesInput.value).toBe('Some notes');
        const acknowledgeButton = screen.getByText("Acknowledge", { exact: true });
        act(() => {
            fireEvent.click(acknowledgeButton);
        });
        expect(screen.getByText(/New Error/i)).toBeTruthy();
        const notification = screen.getByRole('alert');
        expect(notification.getAttribute("class")).toContain("error");
    });

    it('should set showNotification to false when NotificationCarbon onClose is called', async () => {
        await act(async () => {
            render(<ProviderNotifications />);
        });
        await waitFor(() => expect(screen.getByText(/John Doe - Male, 34 years 4 months 8 days/i)).toBeTruthy());
        const notesInput = screen.getByPlaceholderText('Enter Notes');
        act(() => {
            fireEvent.change(notesInput, { target: { value: 'Some notes' } });
        });
        expect(notesInput.value).toBe('Some notes');
        const acknowledgeButton = screen.getByText("Acknowledge", { exact: true });
        jest.useRealTimers();
        act(() => {
            fireEvent.click(acknowledgeButton);
        });
        await waitFor(() => expect(screen.getByText(/Acknowledgement successful/i)).toBeTruthy());
        await new Promise(res => setTimeout(res, 3000));
        expect(screen.queryByText(/Acknowledgement successful/i)).not.toBeTruthy();
    });
});
