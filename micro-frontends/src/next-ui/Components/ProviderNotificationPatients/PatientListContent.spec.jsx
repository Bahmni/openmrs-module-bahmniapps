import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import PatientListContent from './PatientListContent';

const TestWrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    {children}
  </IntlProvider>
);

describe('PatientListContent', () => {
  const mockProps = {
    patientMedicationDetails: {
      administered_date_time: [2023, 1, 1],
      administered_drug_name: 'Test Drug',
      medication_administration_performer_uuid: 'performer-uuid',
      medication_administration_uuid: 'medication-uuid'
    },
    handleOnClick: jest.fn()
  };

  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <PatientListContent {...mockProps} />
      </TestWrapper>
    );
  });
});