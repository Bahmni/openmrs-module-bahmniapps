import axios from "axios";
import { EMERGENCY_MEDICATIONS_BASE_URL, GET_DRUG_ACKNOWLEDGEMENT_URL, GET_PROVIDER_UUID_URL } from "../../constants";

export const getPatientDashboardUrl = (patientUuid) =>
    `/bahmni/clinical/#/default/patient/${patientUuid}/dashboard?currentTab=DASHBOARD_TAB_GENERAL_KEY`;
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

export const updateEmergencyMedication = async (emergencyMedication, medicationAdministrationUuid) => {
    try {
        return await axios.put(
            EMERGENCY_MEDICATIONS_BASE_URL.replace("{medication_administration_uuid}",medicationAdministrationUuid),
            emergencyMedication
        );
    } catch (error) {
        return error;
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