import React from "react";
import PatientListTitle from "./PatientListTitle";
import { Accordion, AccordionItem } from "carbon-components-react";
import PropTypes from "prop-types";
import "./PatientsList.scss";
import PatientListContent from "./PatientListContent";
import { calculateAgeFromEpochDOB } from "../../utils/utils";

const PatientsList = ({ patientListWithMedications, handleOnClick }) => {

  const renderPatientListTitle = (patient) => (
    <PatientListTitle
      noOfDrugs={patient.length}
      name={patient[0].name}
      age={calculateAgeFromEpochDOB(patient[0].date_of_birth)}
      gender={patient[0].gender}
      identifier={patient[0].identifier}
      patientUuid={patient[0].patient_uuid}
      visitUuid={patient[0].visit_uuid}
    />
  );

  const renderPatientListContent = (patient) => (
    patient.map((medication, index) => (
      <PatientListContent
        key={index}
        patientMedicationDetails={medication}
        handleOnClick={handleOnClick}
      />
    ))
  );

  return (
    <Accordion className="patient-list-dropdown">
      {patientListWithMedications && patientListWithMedications.map((patient, index) => (
        <AccordionItem key={index} title={renderPatientListTitle(patient)}>
          {renderPatientListContent(patient)}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

PatientsList.propTypes = {
  patientListWithMedications: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        administered_date_time: PropTypes.array.isRequired,
        administered_drug_name: PropTypes.string.isRequired,
        administered_dose: PropTypes.string.isRequired,
        administered_dose_units: PropTypes.string.isRequired,
        administered_route: PropTypes.string.isRequired,
        date_of_birth: PropTypes.array.isRequired,
        gender: PropTypes.string.isRequired,
        identifier: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        patient_uuid: PropTypes.string.isRequired,
        visit_uuid: PropTypes.string.isRequired,
        medication_administration_performer_uuid: PropTypes.string.isRequired,
        medication_administration_uuid: PropTypes.string.isRequired
      }).isRequired
    ).isRequired
  ).isRequired,
  handleOnClick: PropTypes.func.isRequired
};

export default PatientsList;