var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.Admission = Bahmni.Opd.Admission || {};

Bahmni.Opd.Admission.Constants = {
    bahmniConfigurationUrl: "/openmrs/ws/rest/v1/bahmnicore/conf",
    encounterConfigurationUrl: "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter/config",
    encounterUrl: "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter",
    conceptUrl: "/openmrs/ws/rest/v1/concept",
    openmrsUrl: "/openmrs",
    bahmniRESTBaseURL: "/openmrs/ws/rest/v1/bahmnicore",
    encounterType : {
        registration: "REG",
        returningPatient: "REVISIT"
    },
    visitType: {
        registration: "REG",
        returningPatient: "REVISIT"
    }
};