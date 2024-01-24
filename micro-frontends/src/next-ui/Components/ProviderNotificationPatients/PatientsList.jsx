import React, {useEffect} from 'react'
import PatientListTitle from './PatientListTitle';
import { Accordion, AccordionItem } from 'carbon-components-react';
import './PatientsList.scss';
import PatientListContent from './PatientListContent';
import {
    getEmergencyDrugAcknowledgements,
    getProviderUuid
} from "../../utils/providerNotifications/ProviderNotificationUtils";
import {getCookies} from "../../utils/cookieHandler/cookieHandler";
import {SQL_PROPERTY} from "../../constants";

const PatientsList = () => {
    const dataToRender = [1, 2, 3];
    const cookies = getCookies();
    let response;
    const {uuid:locationUuid} = JSON.parse(cookies["bahmni.user.location"])
    const getAllPatientList = async () => {
        const provider_uuid = await getProviderUuid();
        const response = await getEmergencyDrugAcknowledgements(locationUuid,SQL_PROPERTY,provider_uuid.currentProvider.uuid);
        console.log("response",response);
    }

    useEffect(() => {
        getAllPatientList();
    }, []);


  return (
    <>
        <Accordion className='patient-list-dropdown'>
            {response && response.map((item, index) => (
                <AccordionItem title={<PatientListTitle noOfDrugs={response.length} item={item}/>}>
                    <PatientListContent item={item} key={index}/>
                </AccordionItem>
            ))}
        </Accordion>
    </>
  )
}

export default PatientsList