import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PatientsList from './PatientsList';

describe('PatientsList Component', () => {
  const patientListWithMedications = [
    [{
      administered_date_time: '2022-06-09',
      administered_drug_name: 'Drug A',
      administered_dose: '10mg',
      administered_dose_units: 'mg',
      administered_route: 'Oral',
      date_of_birth: '1990-01-01',
      gender: 'M',
      identifier: 'PID123',
      name: 'John Doe',
      patient_uuid: 'patient123',
      visit_uuid: 'visit123',
      medication_administration_performer_uuid: 'performer123',
      medication_administration_uuid: 'medication123'
    }]
  ];

  const handleOnClickMock = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-09'));
  });

  it('renders the component without crashing', () => {
    const {container} = render(
      <PatientsList
        patientListWithMedications={patientListWithMedications}
        handleOnClick={handleOnClickMock}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders AccordionItem components for each patient', () => {
    const { getAllByRole } = render(
      <PatientsList
        patientListWithMedications={patientListWithMedications}
        handleOnClick={handleOnClickMock}
      />
    );
    const accordionItems = getAllByRole('button', { name: /John Doe - Male, 34 years 5 months 8 days/i });
    expect(accordionItems).toHaveLength(patientListWithMedications.length);
  });

  it('renders PatientListTitle with correct props', () => {
    const { getByText } = render(
      <PatientsList
        patientListWithMedications={patientListWithMedications}
        handleOnClick={handleOnClickMock}
      />
    );
    const patientName = getByText('John Doe - Male, 34 years 5 months 8 days');
    expect(patientName).toBeTruthy();
  });

  it('renders PatientListContent with correct props', () => {
    const { getByText } = render(
      <PatientsList
        patientListWithMedications={patientListWithMedications}
        handleOnClick={handleOnClickMock}
      />
    );
    const drugName = getByText('Drug A');
    expect(drugName).toBeTruthy();
  });
});
