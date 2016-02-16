var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
var hostUrl = Bahmni.Common.Constants.hostURL;
Bahmni.Registration.Constants = {
    patientIdentifierTypeName: "Bahmni Id",
    openmrsUrl: hostUrl + "/openmrs",
    registrationEncounterType: "REG",
    baseOpenMRSRESTURL: hostUrl + "/openmrs/ws/rest/v1",
    patientImageURL: "/patient_images/",
    bahmniRESTBaseURL: hostUrl + "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: hostUrl + "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: hostUrl + "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: hostUrl + "/openmrs/ws/rest/v1",
    patientSearchURL: "/search",
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"],
    nextStepConfigId: "org.bahmni.registration.patient.next"
};

Bahmni.Registration.Constants.Errors = {
    manageIdentifierSequencePrivilege:"You don't have the privilege to create a patient with the given ID."
};
