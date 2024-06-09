import React, { useState } from 'react';
import { Button, TextArea } from "carbon-components-react";
import { FormattedMessage } from 'react-intl';
import "./PatientListContent.scss";
import { Title } from "bahmni-carbon-ui";
import { formatArrayDateToDefaultDateFormat } from "../../utils/utils";
import PropTypes from "prop-types";

const PatientListContent = ({ patientMedicationDetails, handleOnClick }) => {
  const { administered_date_time, administered_drug_name, medication_administration_performer_uuid, medication_administration_uuid } = patientMedicationDetails;
  const acknowledgementRequiredText = (<FormattedMessage id="AKNOWLEDGE_BUTTON" defaultMessage="Acknowledge" />);
  const [providerNotes, setProviderNotes] = useState("");

  function acknowledgeMedication() {
    handleOnClick(medication_administration_performer_uuid, medication_administration_uuid, providerNotes);
    setProviderNotes("");
  }

  const handleNotesChange = (e) => {
    setProviderNotes(e.target.value);
  };

  return (
    <div className="patient-list-content">
      <span>{formatArrayDateToDefaultDateFormat(administered_date_time)}</span>
      <div className="content-info">
        <span>{administered_drug_name}</span>
        <div className="notes">
          <TextArea
            className="patient-list-text-area"
            labelText={<Title text="Note" isRequired />}
            placeholder="Enter Notes"
            rows={1}
            required
            value={providerNotes}
            onChange={handleNotesChange}
          />
          <Button
            className="patient-list-button"
            disabled={providerNotes.trim() === ""}
            onClick={acknowledgeMedication}
          >
            {acknowledgementRequiredText}
          </Button>
        </div>
      </div>
    </div>
  );
};

PatientListContent.propTypes = {
    patientMedicationDetails: PropTypes.shape({
        administered_date_time: PropTypes.array.isRequired,
        administered_drug_name: PropTypes.string.isRequired,
        medication_administration_performer_uuid: PropTypes.string.isRequired,
    }).isRequired,
    handleOnClick: PropTypes.func.isRequired
};

export default PatientListContent;
