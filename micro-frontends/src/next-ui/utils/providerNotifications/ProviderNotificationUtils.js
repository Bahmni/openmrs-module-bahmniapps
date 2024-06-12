import axios from "axios";
import { EMERGENCY_MEDICATIONS_BASE_URL, GET_DRUG_ACKNOWLEDGEMENT_URL, GET_PROVIDER_UUID_URL } from "../../constants";
import { parseDateArray } from "../utils";

export const getPatientIPDDashboardUrl = (patientUuid, visitUuid) =>
    `/bahmni/clinical/index.html#/default/patient/${patientUuid}/dashboard/visit/ipd/${visitUuid}?source=clinical`;

export const getEmergencyDrugAcknowledgements = async (locationUuid, property, providerUuid) => {
    const apiURL = GET_DRUG_ACKNOWLEDGEMENT_URL.replace("{location_uuid}", locationUuid).replace("{property}", property).replace("{provider_uuid}",providerUuid);

    try {
        const response = await axios.get(apiURL);
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
}

export const sortMedicationList = (medicationList) => {
    medicationList.forEach(group => {
        group.sort((a, b) => parseDateArray(a.administered_date_time).diff(parseDateArray(b.administered_date_time)));
    });
    medicationList.sort((a, b) => parseDateArray(a[0].administered_date_time).diff(parseDateArray(b[0].administered_date_time)));
    return medicationList;
};

export const acknowledgeEmergencyMedication = async (emergencyMedication, medicationAdministrationUuid) => {
    try {
        const response = await axios.put(
            EMERGENCY_MEDICATIONS_BASE_URL.replace("{medication_administration_uuid}",medicationAdministrationUuid),
            emergencyMedication
        );
        if (response.status === 200) {
            return { success: true, message: 'Emergency Medication Acknowledged Successfully' };
        } else {
            const errorMessage = response.data.error.message;
            return { success: false, message: `Error: ${errorMessage}` };
        }
    } catch (error) {
        return { success: false, message: `Error: ${error}` };
    }
};

export const getProvider = async () => {
    try {
        const response = await axios.get(GET_PROVIDER_UUID_URL);
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
}

export const groupByIdentifier = (data, key) => {
    return data.reduce((accumulator, item) => {
      if (!accumulator[item[key]]) {
        accumulator[item[key]] = [];
      }
      accumulator[item[key]].push(item);
      return accumulator;
    }, {});
  };
  