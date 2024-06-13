export const defaultDateFormat = "DD MMM YYYY";
export const defaultDateTimeFormat = "DD MMM YYYY hh:mm a";

export const LS_LANG_KEY = "NG_TRANSLATE_LANG_KEY";
export const MEDICATION_ACKNOWLEDGE_SQL_PROPERTY = "emrapi.sqlSearch.emergencyMedicationToAcknowledge";
export const BASE_URL =
  typeof __webpack_public_path__ !== "undefined"
    ? __webpack_public_path__
    : "/";

const hostUrl = localStorage.getItem("host")
  ? "https://" + localStorage.getItem("host")
  : "";

export const verifierFunction = "Verifier";
export const document_images_path = "../../document_images/";
const RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

export const FORM_BASE_URL = RESTWS_V1 + "/bahmnicore/patient/{patientUuid}/forms";
export const ENCOUNTER_BASE_URL = RESTWS_V1 + "/bahmnicore/bahmniencounter/{encounterUuid}";
export const GET_ALL_FORMS_BASE_URL = RESTWS_V1 + "/bahmniie/form/allForms";
export const GET_FORMS_BASE_URL = RESTWS_V1 + "/form/{formUuid}";
export const GET_FORM_TRANSLATE_URL = RESTWS_V1 + "/bahmniie/form/translate";
export const FETCH_CONCEPT_URL = RESTWS_V1 + "/concept/{conceptUuid}?v=full&locale={locale}";
export const BAHMNI_ENCOUNTER_URL = RESTWS_V1 + "/bahmnicore/bahmniencounter";
export const ENCOUNTER_TYPE_URL = RESTWS_V1 + "/encountertype/{encounterType}";
export const GET_ALLERGIES_URL = "/openmrs/ws/fhir2/R4/AllergyIntolerance?patient={patientId}&_summary=data"
export const FORM_TRANSLATIONS_URL =  RESTWS_V1 + "/bahmniie/form/translations";
export const OBSERVATIONS_URL = RESTWS_V1 + "bahmnicore/observations";
export const LATEST_PUBLISHED_FORMS_URL = RESTWS_V1 + "/bahmniie/form/latestPublishedForms";
export const GET_DRUG_ACKNOWLEDGEMENT_URL = RESTWS_V1 + "/bahmnicore/sql?q={property}&v=full&location_uuid={location_uuid}&provider_uuid={provider_uuid}";
export const EMERGENCY_MEDICATIONS_BASE_URL = RESTWS_V1 + "/ipd/adhocMedicationAdministrations/{medication_administration_uuid}";
export const GET_PROVIDER_UUID_URL = RESTWS_V1 + "/session";
export const SAVE_ALLERGIES_URL =  RESTWS_V1 + "/patient/{patientId}/allergy";
export const OT_NOTES_BASE_URL = RESTWS_V1 + "/notes";

