import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import PatientListContent from './PatientListContent';

describe('PatientListContent Component', () => {
  const patientMedicationDetails = {
    administered_date_time: [2022,6,9],
    administered_drug_name: 'Drug A',
    medication_administration_performer_uuid: 'performer123',
    medication_administration_uuid: 'medication123'
  };

  const handleOnClickMock = jest.fn();

  it('renders the component without crashing', () => {
    const {container} = render(
        <PatientListContent
          patientMedicationDetails={patientMedicationDetails}
          handleOnClick={handleOnClickMock}
          
        />
      );
    expect(container).toMatchSnapshot();
  });

  it('displays the correct medication information', () => {
    const { getByText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    expect(getByText('9/6/2022')).toBeTruthy();
    expect(getByText('Drug A')).toBeTruthy();
  });

  it('calls handleOnClick with correct arguments when Acknowledge button is clicked', () => {
    const { getByText, getByPlaceholderText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    const notesInput = getByPlaceholderText('Enter Notes');
    fireEvent.change(notesInput, { target: { value: 'Some notes' } });
    expect(notesInput.value).toBe('Some notes');
    fireEvent.click(getByText('Acknowledge'));
    expect(handleOnClickMock).toHaveBeenCalledTimes(1);
    expect(handleOnClickMock).toHaveBeenCalledWith(
      'performer123',
      'medication123',
      'Some notes'
    );
  });

  it('updates providerNotes state when notes are entered', () => {
    const { getByPlaceholderText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    const notesInput = getByPlaceholderText('Enter Notes');
    fireEvent.change(notesInput, { target: { value: 'Some notes' } });
    expect(notesInput.value).toBe('Some notes');
  });

  it('clears providerNotes state after Acknowledge button is clicked', () => {
    const { getByPlaceholderText, getByText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    const notesInput = getByPlaceholderText('Enter Notes');
    fireEvent.change(notesInput, { target: { value: 'Some notes' } });
    expect(notesInput.value).toBe('Some notes');
    fireEvent.click(getByText('Acknowledge'));
    expect(handleOnClickMock).toHaveBeenCalledWith(
      'performer123',
      'medication123',
      'Some notes'
    );
    expect(notesInput.value).toBe('');
  });

  it('disables Acknowledge button when no notes are entered', () => {
    const { getByText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    const acknowledgeButton = getByText('Acknowledge');
    expect(acknowledgeButton).toHaveProperty('disabled', true); 
  });

  it('enables Acknowledge button when notes are entered', () => {
    const { getByText, getByPlaceholderText } = render(
      <PatientListContent
        patientMedicationDetails={patientMedicationDetails}
        handleOnClick={handleOnClickMock}
      />
    );
    const notesInput = getByPlaceholderText('Enter Notes');
    fireEvent.change(notesInput, { target: { value: 'Some notes' } });
    const acknowledgeButton = getByText('Acknowledge');
    expect(acknowledgeButton).toHaveProperty('disabled', false); 
  });
});
