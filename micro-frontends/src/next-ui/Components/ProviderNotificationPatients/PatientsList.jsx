import React, { useEffect, useState } from "react";
import PatientListTitle from "./PatientListTitle";
import { Accordion, AccordionItem  } from "carbon-components-react";
import "./PatientsList.scss";
import PatientListContent from "./PatientListContent";
import {
  getEmergencyDrugAcknowledgements,
  getProvider,
} from "../../utils/providerNotifications/ProviderNotificationUtils";
import { getCookies } from "../../utils/cookieHandler/cookieHandler";
import { SQL_PROPERTY } from "../../constants";
import { calculateAgeFromEpochDOB } from "../../utils/utils";
import moment from "moment";

const PatientsList = () => {
  const [PatientListWithMedications, setPatientListWithMedications] = useState(
    []
  );
  const [providerUuid, setProviderUuid] = useState()
  const cookies = getCookies();
  const { uuid: locationUuid } = JSON.parse(cookies["bahmni.user.location"]);
  const getAllPatientList = async () => {
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

    const sortMedicationList = Object.values(PatientListGroupedByIdentifier);
    sortMedicationList.map((item) => {
      return item.sort((a, b) => {
        const dateA = moment(a.administered_date_time);
        const dateB = moment(b.administered_date_time);
        return dateB.diff(dateA);
      });
    });

    setPatientListWithMedications(sortMedicationList);
  };

  useEffect(() => {
    getAllPatientList();
  }, []);

  return (
    <>
      <Accordion className="patient-list-dropdown">
        {PatientListWithMedications &&
          PatientListWithMedications.map((item) => (
            <AccordionItem
              title={
                <PatientListTitle
                  noOfDrugs={item.length}
                  name={item[0].name}
                  age={calculateAgeFromEpochDOB(item[0].date_of_birth)}
                  gender={item[0].gender}
                  identifier={item[0].identifier}
                  patientUuid={item[0].patient_uuid}
                />
              }
            >
              {item &&
                item.map((medication) => (
                  <PatientListContent patientMedicationDetails={medication} providerUuid={providerUuid} refreshPatients={getAllPatientList}/>
                ))}
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
};

export default PatientsList;
