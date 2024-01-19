import React from 'react'
import PatientListTitle from './PatientListTitle';
import { Accordion, AccordionItem } from 'carbon-components-react';
import './PatientsList.scss';
import PatientListContent from './PatientListContent';

const PatientsList = () => {
  return (
    <>
        <Accordion className='patient-list-dropdown'>
            <AccordionItem title={<PatientListTitle />}>
                <PatientListContent />
            </AccordionItem>
        </Accordion>
    </>
  )
}

export default PatientsList