import axios from "axios";
import {GET_DRUG_ACKNOWLEDGEMENT_URL, GET_PROVIDER_UUID_URL} from "../../constants";

export const getEmergencyDrugAcknowledgements = async (location_uuid, property, provider_uuid) => {
    const apiURL = GET_DRUG_ACKNOWLEDGEMENT_URL.replace("{location_uuid}", location_uuid).replace("{property}", property).replace("{provider_uuid}",provider_uuid);

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

export const getProviderUuid = async () => {
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