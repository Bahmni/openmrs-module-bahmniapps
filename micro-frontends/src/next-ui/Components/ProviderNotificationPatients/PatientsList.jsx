import React, { useEffect, useState } from "react";
import PatientListTitle from "./PatientListTitle";
import { Accordion, AccordionItem } from "carbon-components-react";
import "./PatientsList.scss";
import PatientListContent from "./PatientListContent";
import {
  getEmergencyDrugAcknowledgements,
  getProviderUuid,
} from "../../utils/providerNotifications/ProviderNotificationUtils";
import { getCookies } from "../../utils/cookieHandler/cookieHandler";
import { SQL_PROPERTY } from "../../constants";
import {
  formatArrayDateToDefaultDateFormat,
  calculateAgeFromEpochDOB,
} from "../../utils/utils";

const PatientsList = () => {
  const [PatientListWithMedications, setPatientListWithMedications] = useState(
    []
  );
  const cookies = getCookies();
  const { uuid: locationUuid } = JSON.parse(cookies["bahmni.user.location"]);
  const getAllPatientList = async () => {
    const provider_uuid = await getProviderUuid();
    const response = await getEmergencyDrugAcknowledgements(
      locationUuid,
      SQL_PROPERTY,
      provider_uuid.currentProvider.uuid
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
    setPatientListWithMedications(
      Object.values(PatientListGroupedByIdentifier)
    );
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
                />
              }
            >
              hello ipd
            </AccordionItem>
          ))}
      </Accordion>
    </>
  );
};

export default PatientsList;