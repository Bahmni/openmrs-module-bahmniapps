import React, { useState } from 'react'
import { Button, TextArea } from 'carbon-components-react';
import './PatientListContent.scss';
import { Title } from "bahmni-carbon-ui";
import { formatArrayDateToDefaultDateFormat } from "../../utils/utils";

const PatientListContent = ({patientMedicationDetails}) => {
    const [notes, setNotes] = useState('');
    const { administered_date_time, administered_drug_name } = patientMedicationDetails;

    const handleInputChange = (e) => {
        // props.hostApi.updateNotificationMessage(event.target.value)
        setNotes(e.target.value);
    };

    const handleOnClick = () => {
        // Acknowlege api
    };

  return (
    <div className='patient-list-content'>
        <span>{formatArrayDateToDefaultDateFormat(administered_date_time)}</span>
        <div className='content-info'>
            <span>{administered_drug_name}</span>
            <div className='notes'>
                <TextArea
                    className='patient-list-text-area'
                    labelText={
                        <Title text={"Note"} isRequired={true} />
                    }
                    placeholder="Enter Notes"
                    rows={1}
                    required={true}
                    onChange={handleInputChange}
                />
                <Button
                    className='patient-list-button'
                    disabled={notes.trim() === ''}
                    onClick={handleOnClick}
                >Acknowledge</Button>
            </div>
        </div>
    </div>
  )
}

export default PatientListContent