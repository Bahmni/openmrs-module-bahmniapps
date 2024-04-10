import axios from "axios";
import { FORM_BASE_URL, LATEST_PUBLISHED_FORMS_URL } from "../../constants";

export const fetchFormData = async (patientUuid, numberOfVisits) => {
  const apiURL = FORM_BASE_URL.replace('{patientUuid}',patientUuid);
  const params = {
    formType: 'v2',
  }
  if(numberOfVisits){
    params['numberOfVisits'] = numberOfVisits;
  }
  try {
    const response = await axios.get(apiURL, { params });
    if(response.status === 200){
        return response.data;
    }
  } catch (error) {
    console.error(error);
  }
};

export const getLatestPublishedForms = async (encounterUuid) => {
  const apiURL = LATEST_PUBLISHED_FORMS_URL;
  const params = {
      encounterUuid: encounterUuid,
  };
  try {
      const response = await axios.get(apiURL, { params });
      if (response.status === 200) {
          return response.data;
      }
      return [];
  } catch (error) {
      return error;
  }
};