export const LS_LANG_KEY = "NG_TRANSLATE_LANG_KEY";
export const BASE_URL =
  typeof __webpack_public_path__ !== "undefined"
    ? __webpack_public_path__
    : "/";

const hostUrl = localStorage.getItem("host")
  ? "https://" + localStorage.getItem("host")
  : "";

const RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";
export const FORM_BASE_URL =
  RESTWS_V1 + "/bahmnicore/patient/{patientUuid}/forms";
export const FETCH_CONCEPT_URL =
  RESTWS_V1 + "/concept/{conceptUuid}?v=full&locale={locale}";
