import React, { useState } from 'react';
import { Button, TextArea } from "carbon-components-react";
import "./PatientListContent.scss";
import { Title } from "bahmni-carbon-ui";
import { formatArrayDateToDefaultDateFormat } from "../../utils/utils";
import PropTypes from "prop-types";
import { FormattedMessage, useIntl } from "react-intl";

const PatientListContent = ({ patientMedicationDetails, providerUuid , refreshPatients}) => {
  const [notes, setNotes] = useState("");
  const intl = useIntl();
  const { administered_date_time, administered_drug_name, medication_administration_performer_uuid, medication_administration_uuid } =
    patientMedicationDetails;

  const handleOnClick = async () => {
    await updateEmergencyMedication({ providers: [
        {
          uuid:medication_administration_performer_uuid,
          providerUuid,
          function: verifierFunction
        }
      ],
      notes: [{ authorUuid: providerUuid, text: notes }]}, medication_administration_uuid
    );
    refreshPatients();
    setNotes("");
  };

  return (
    <div className="patient-list-content">
      <span>{formatArrayDateToDefaultDateFormat(administered_date_time)}</span>
      <div className="content-info">
        <span>{administered_drug_name}</span>
        <div className="notes">
          <TextArea
            className="patient-list-text-area"
            labelText={
              <Title text={intl.formatMessage({id: "NOTE",defaultMessage: "Note"})} isRequired={true}/>
            }
            placeholder={intl.formatMessage({id: "ENTER_NOTES",defaultMessage: "Enter Notes"})}
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
