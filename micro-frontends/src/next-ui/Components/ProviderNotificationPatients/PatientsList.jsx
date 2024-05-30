import React, { useEffect, useState } from "react";
import PatientListTitle from "./PatientListTitle";
import { Accordion, AccordionItem  } from "carbon-components-react";
import "./PatientsList.scss";
import PatientListContent from "./PatientListContent";
import {
  getEmergencyDrugAcknowledgements,
  getProvider,
  sortMedicationList,
} from "../../utils/providerNotifications/ProviderNotificationUtils";
import { getCookies } from "../../utils/cookieHandler/cookieHandler";
import { SQL_PROPERTY } from "../../constants";
import { calculateAgeFromEpochDOB } from "../../utils/utils";
const PatientsList = () => {
  const [PatientListWithMedications, setPatientListWithMedications] = useState(
    []
  );
  const [openedWindow, setOpenedWindow] = useState(null);
  const [providerUuid, setProviderUuid] = useState()
  const cookies = getCookies();
  const { uuid: locationUuid } = JSON.parse(cookies["bahmni.user.location"]);
  const getAllPatientList = async () => {
    try {
      const provider = await getProvider();
      setProviderUuid(provider.currentProvider.uuid);
      const response = await getEmergencyDrugAcknowledgements(
        locationUuid,
        SQL_PROPERTY,
        provider.currentProvider.uuid
      );
      const PatientListGroupedByIdentifier = response.reduce(
        (accumulator, item) => {
          if (!accumulator[item.identifier]) {
            accumulator[item.identifier] = [];
          }
          accumulator[item.identifier].push(item);
          return accumulator;
        },
        {}
      );
      const sortedMedicationList = sortMedicationList(Object.values(PatientListGroupedByIdentifier));
      setPatientListWithMedications(sortedMedicationList);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllPatientList();
  }, []);

  return (
    <>
      <Accordion className="patient-list-dropdown">
        {PatientListWithMedications &&
          PatientListWithMedications.map((item, index) => (
            <AccordionItem
              key={index}
              title={
                <PatientListTitle
                  noOfDrugs={item.length}
                  name={item[0].name}
                  age={calculateAgeFromEpochDOB(item[0].date_of_birth)}
                  gender={item[0].gender}
                  identifier={item[0].identifier}
                  patientUuid={item[0].patient_uuid}
                  visitUuid={item[0].visit_uuid}
                  openedWindow={openedWindow}
                  setOpenedWindow={setOpenedWindow}
                />
              }
            >
              {item &&
                item.map((medication, index) => (
                  <PatientListContent key={index} patientMedicationDetails={medication} providerUuid={providerUuid} refreshPatients={getAllPatientList}/>
                ))}
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
};

export default PatientsList;
