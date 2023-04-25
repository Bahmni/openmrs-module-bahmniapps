var Bahmni = Bahmni || {};
Bahmni.Registration = Bahmni.Registration || {};
var hostUrl = Bahmni.Common.Constants.hostURL;
var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";

Bahmni.Registration.Constants = {
    openmrsUrl: hostUrl + "/openmrs",
    registrationEncounterType: "REG",
    baseOpenMRSRESTURL: RESTWS_V1,
    patientImageUrlByPatientUuid: RESTWS_V1 + "/patientImage?patientUuid=",
    bahmniRESTBaseURL: hostUrl + "/openmrs/ws/rest/v1/bahmnicore",
    emrApiRESTBaseURL: hostUrl + "/openmrs/ws/rest/emrapi",
    emrApiEncounterUrl: hostUrl + "/openmrs/ws/rest/emrapi/encounter",
    webServiceRestBaseURL: hostUrl + "/openmrs/ws/rest/v1",
    basePatientUrl: RESTWS_V1 + "/patient/",
    patientSearchURL: "/search",
    existingPatient: "/bahmni/registration/index.html#/patient/",
    newPatient: "/bahmni/registration/index.html#/patient/new",
    allAddressFileds: ["uuid", "preferred", "address1", "address2", "address3", "address4", "address5", "address6", "cityVillage", "countyDistrict", "stateProvince", "postalCode", "country", "latitude", "longitude"],
    nextStepConfigId: "org.bahmni.registration.patient.next",
    patientNameDisplayOrder: ["firstName", "middleName", "lastName"],
    registrationMessage: "REGISTRATION_MESSAGE",
    enableWhatsAppButton: false,
    enableDashboardRedirect: false,
    dashboardUrl: "/bahmni/clinical/index.html#/default/patient/{{patientUuid}}/dashboard",
    certificateHeader: "Print Header"
};

Bahmni.Registration.Constants.Errors = {
    manageIdentifierSequencePrivilege: "You don't have the privilege to create a patient with the given ID."
};
