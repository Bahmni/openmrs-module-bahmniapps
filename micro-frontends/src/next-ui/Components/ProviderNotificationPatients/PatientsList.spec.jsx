import React from 'react';
import { render, waitFor } from '@testing-library/react';
import PatientsList from './PatientsList';
import { mockData, mockSortedData } from "./PatientListMockData";

const mockGetEmergencyDrugAcknowledgements = jest.fn();
const mockSortMedicationList = jest.fn();

jest.mock('../../utils/providerNotifications/ProviderNotificationUtils', () => ({
  getEmergencyDrugAcknowledgements: () => mockGetEmergencyDrugAcknowledgements(),
  getProvider: jest.fn().mockResolvedValue({currentProvider: {uuid: 'mock-provider-uuid'}}),
  sortMedicationList: () => mockSortMedicationList,
}));

jest.mock('./PatientListContent', () => 'PatientListContent');

jest.mock('../../utils/utils', () => ({
  calculateAgeFromEpochDOB: jest.fn().mockReturnValue(30),
  formatArrayDateToDefaultDateFormat: jest.fn().mockReturnValue(1 / 1 / 2000),
  formatGender: jest.fn().mockReturnValue("Male")
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
  beforeEach(() => {
    mockSortMedicationList.mockReturnValue(mockSortedData)
    jest.clearAllMocks();
  });
  it('should render without crashing', () => {
    const {container} = render(<PatientsList/>);
    expect(container).toMatchSnapshot();
  })

  it('should render PatientListWithMedications correctly with mocked data', async () => {
    mockGetEmergencyDrugAcknowledgements.mockImplementation(() => (mockData));
    const {queryByText, debug} = render(<PatientsList/>);

    debug();
    await waitFor(() => {
      expect(queryByText('Aby K - Male, 30')).toBeTruthy();
      expect(queryByText('Hanif Oreo - Male, 30')).toBeTruthy();
    })
  });
});