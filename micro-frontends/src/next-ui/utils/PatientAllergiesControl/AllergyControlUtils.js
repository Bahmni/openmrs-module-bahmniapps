import axios from "axios";
import { BAHMNI_ENCOUNTER_URL, ENCOUNTER_TYPE_URL, FETCH_CONCEPT_URL, GET_ALLERGIES_URL, SAVE_ALLERGIES_URL } from "../../constants";
import { getLocale } from "../../Components/i18n/utils";

export const fetchAllergensOrReactions = async (conceptId) => {
  const locale = getLocale();
  const apiURL = FETCH_CONCEPT_URL.replace("{locale}", locale);

  const replaceConceptIdInapiURL = (conceptId) => {
    return apiURL.replace("{conceptUuid}", conceptId);
  };

  const allergenOrReactionURL = replaceConceptIdInapiURL(conceptId);

  try {
    const response = await axios.get(allergenOrReactionURL);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const fetchAllergiesAndReactionsForPatient = async (patientId) => {
  try {
    const response = await axios.get(GET_ALLERGIES_URL.replace("{patientId}", patientId));
    return response.data;
  }
  catch (error) {
    console.log(error);
  }
}

export const bahmniEncounter = async (payload) => {
  try{
    return await axios.post(BAHMNI_ENCOUNTER_URL, payload, {
      withCredentials: true,
      headers: {"Accept": "application/json", "Content-Type": "application/json"}
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const saveAllergiesAPICall = async (payload, patientId) => {
  const saveAllergies = SAVE_ALLERGIES_URL.replace("{patientId}", patientId);
  try {
    return await axios.post(saveAllergies, payload, {
      withCredentials: true,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return error;
  }
}

export const getEncounterType = async (encounterType) => {
    try {
        const response = await axios.get(ENCOUNTER_TYPE_URL.replace("{encounterType}", encounterType));
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}