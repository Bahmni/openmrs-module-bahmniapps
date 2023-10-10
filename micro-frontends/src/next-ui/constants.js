export const defaultDateFormat = "DD MMM YYYY";
export const defaultDateTimeFormat = "DD MMM YYYY hh:mm a";

export const LS_LANG_KEY = "NG_TRANSLATE_LANG_KEY";
export const BASE_URL =
  typeof __webpack_public_path__ !== "undefined"
    ? __webpack_public_path__
    : "/";

const hostUrl = localStorage.getItem("host")
  ? "https://" + localStorage.getItem("host")
  : "";

const RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

export const FORM_BASE_URL = RESTWS_V1 + "/bahmnicore/patient/{patientUuid}/forms";
export const ENCOUNTER_BASE_URL = RESTWS_V1 + "/bahmnicore/bahmniencounter/{encounterUuid}";
export const GET_ALL_FORMS_BASE_URL = RESTWS_V1 + "/bahmniie/form/allForms";
export const GET_FORMS_BASE_URL = RESTWS_V1 + "/form/{formUuid}";
export const GET_FORM_TRANSLATE_URL = RESTWS_V1 + "/bahmniie/form/translate";
export const FETCH_CONCEPT_URL = RESTWS_V1 + "/concept/{conceptUuid}?v=full&locale={locale}";