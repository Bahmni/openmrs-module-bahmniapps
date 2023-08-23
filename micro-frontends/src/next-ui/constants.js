const hostUrl = localStorage.getItem("host")
  ? "https://" + localStorage.getItem("host")
  : "";

const RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";
export const FORM_BASE_URL = RESTWS_V1 + "/bahmnicore/patient/{patientUuid}/forms";
