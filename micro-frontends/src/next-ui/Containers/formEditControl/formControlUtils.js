import axios from "axios";
import { GET_FORMS_BASE_URL,FORM_TRANSLATIONS_URL,GET_ALL_FORMS_BASE_URL } from "../../constants"

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
      return response.data;
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

  export const setFormDetails = async (formUuid, formVersion, formName, editableObservations) => {
    const allForms = await getAllForms();
    const observationForm = getFormByFormName(allForms, formName, formVersion);
    let label = formName;
    if (observationForm) {
        const locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
        const currentLabel = observationForm.nameTranslation && JSON.parse(observationForm.nameTranslation)
            .find(function (formNameTranslation) {
                return formNameTranslation.locale === locale;
            }
        );
        if (currentLabel) {
            label = currentLabel.display;
        }
        return new Bahmni.ObservationForm(
            observationForm.uuid, $rootScope.currentUser, formName,
            formVersion, editableObservations, label
        );
    }
}




  var setFormDetails = function () {
    formService.getAllForms().then(function (response) {
        var allForms = response.data;
        var observationForm = getFormByFormName(allForms, $scope.observation.formName, $scope.observation.formVersion);
        var label = $scope.observation.formName;
        if (observationForm) {
            var locale = localStorage.getItem("NG_TRANSLATE_LANG_KEY") || "en";
            var currentLabel = observationForm.nameTranslation && JSON.parse(observationForm.nameTranslation)
                .find(function (formNameTranslation) {
                    return formNameTranslation.locale === locale;
                });
            if (currentLabel) {
                label = currentLabel.display;
            }
            $scope.formDetails = new Bahmni.ObservationForm(
                observationForm.uuid, $rootScope.currentUser, $scope.observation.formName,
                $scope.observation.formVersion, $scope.editableObservations, label);
        }
    });
};