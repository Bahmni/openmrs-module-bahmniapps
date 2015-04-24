var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};

Bahmni.Registration.Constants = {
    patientIdentifierTypeName: "Bahmni Id",
    openmrsUrl: "/openmrs",
    registrationEncounterType: "REG",
    baseOpenMRSRESTURL: "/openmrs/ws/rest/v1",
    patientImageURL: "/patient_images/",
    bahmniRESTBaseURL: "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: "/openmrs/ws/rest/v1",
    patientSearchURL: "/search",
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"],
    nextStepConfigId: "org.bahmni.registration.patient.next"
};

