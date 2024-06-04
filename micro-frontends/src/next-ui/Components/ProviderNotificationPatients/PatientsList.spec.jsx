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
  getPatientIPDDashboardUrl: jest.fn(),
}));

jest.mock('./PatientListContent', () => 'PatientListContent');
