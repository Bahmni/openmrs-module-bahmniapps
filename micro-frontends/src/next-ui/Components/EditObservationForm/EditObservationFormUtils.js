import axios from "axios";
import { GET_FORMS_BASE_URL,FORM_TRANSLATIONS_URL,GET_ALL_FORMS_BASE_URL,LATEST_PUBLISHED_FORMS_URL } from "../../constants"

export const getFormDetail = async (formUuid ) => {
    const apiURL = GET_FORMS_BASE_URL.replace('{formUuid}', formUuid);
    const params = { 
        v: "custom:(resources:(value))"
    };
    try {
        const response = await axios.get(apiURL, { params });
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};

export const getFormTranslations = async (url, form) => {
    try {
      if (url && url !== FORM_TRANSLATIONS_URL) {
        const response = await axios.get(url);
        return response.data;
      }
  
      const response = await axios.get(FORM_TRANSLATIONS_URL, { params: form });
      return response.data[0];
    } catch (error) {
      console.error('Error fetching form translations:', error);
      throw error;
    }
  };

  export const getAllForms = async () => {
    const apiURL = GET_ALL_FORMS_BASE_URL;
    const params = {
        v: "custom:(version,name,uuid)"
    };
    try {
        const response = await axios.get(apiURL, { params });
        if (response.status === 200) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.error(error);
    }
};

export const getFormByFormName = function (formList, formName, formVersion) {
    return formList.find( function (form) {
        return form.name === formName && form.version === formVersion;
    });
};

export const getFormNameAndVersion = function (path) {
    var formNameAndVersion = (path.split("/")[0]).split('.');
    return {
        formName: formNameAndVersion[0],
        formVersion: formNameAndVersion[1]
    };
};
