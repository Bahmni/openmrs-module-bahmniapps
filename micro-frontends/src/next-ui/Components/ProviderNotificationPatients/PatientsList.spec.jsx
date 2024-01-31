import React from 'react';
import { render, waitFor } from '@testing-library/react';
import PatientsList from './PatientsList';

const mockGetEmergencyDrugAcknowledgements = jest.fn().mockResolvedValue([]);

jest.mock('../../utils/providerNotifications/ProviderNotificationUtils', () => ({
    getEmergencyDrugAcknowledgements: () => mockGetEmergencyDrugAcknowledgements,
    getProvider: jest.fn().mockResolvedValue({ currentProvider: { uuid: 'mock-provider-uuid' } }),
}));

jest.mock('../../utils/utils', () => ({
    calculateAgeFromEpochDOB: jest.fn().mockReturnValue(30)
}));

jest.mock("../../utils/cookieHandler/cookieHandler", () => {
    const originalModule = jest.requireActual("../../utils/cookieHandler/cookieHandler");
    return {
        ...originalModule,
        getCookies: jest.fn().mockReturnValue({
            "bahmni.user.location": '{"uuid":"0fbbeaf4-f3ea-11ed-a05b-0242ac120002"}',
        }),
    };
});

describe('PatientsList', () => {
    it('should render without crashing', () => {
        const {container} = render(<PatientsList/>);
        expect(container).toMatchSnapshot();
    })
});