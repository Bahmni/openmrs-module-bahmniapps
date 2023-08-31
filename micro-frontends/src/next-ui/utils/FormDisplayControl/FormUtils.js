import axios from "axios";
import { FORM_BASE_URL } from "../../constants";

export const fetchFormData = async (patientUuid, numberOfVisits) => {
  console.log('FORM_BASE_URL Before',FORM_BASE_URL);
  const apiURL = FORM_BASE_URL.replace('{patientUuid}',patientUuid)
  console.log('FORM_BASE_URL After',apiURL);

  const params = {
    formType: 'v2',
  }
  if(numberOfVisits){
    params['numberOfVisits'] = numberOfVisits;
  }
  try {
    const response = await axios.get(apiURL, { params });
    console.log('fetchFormData', response);
    if(response.status === 200){
        return response.data;
    }
  } catch (error) {
    console.error(error);
  }
};