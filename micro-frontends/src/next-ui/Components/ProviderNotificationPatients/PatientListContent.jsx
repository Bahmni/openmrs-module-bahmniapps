import React from 'react'
import { Button, TextArea } from 'carbon-components-react';
import './PatientListContent.scss';

const PatientListContent = () => {
  return (
    <div className='patient-list-content'>
        <span>dd/mm/yyyy</span>
        <div className='content-info'>
            <span>Drug Name</span>
            <div className='notes'>
                <TextArea
                    className='patient-list-text-area'
                    labelText='Note'
                    placeholder="Enter Notes"
                    rows={1}
                    required={true}
                    // value={props.hostData.notificationMessage}
                    // onChange={(event) => props.hostApi.updateNotificationMessage(event.target.value)}
                />
                <Button
                    className='patient-list-button'
                    // onClick={() => props.hostApi.sendNotification()}
                >Acknowledge</Button>
            </div>
        </div>
    </div>
  )
}

export default PatientListContent