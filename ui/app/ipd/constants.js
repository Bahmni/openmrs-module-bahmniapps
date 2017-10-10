'use strict';

var Bahmni = Bahmni || {};
Bahmni.IPD = Bahmni.IPD || {};

Bahmni.IPD.Constants = (function () {
    return {
        patientsListUrl: "/patient/search",
        ipdDashboard: "#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
        admissionLocationUrl: "/openmrs/ws/rest/v1/admissionLocation/",
        getAllBedTags: "/openmrs/ws/rest/v1/bedTag",
        bedTagMapUrl: "/openmrs/ws/rest/v1/bedTagMap/",
        visitRepresentation: "custom:(uuid,startDatetime,stopDatetime,visitType,patient)",
        editTagsPrivilege: "Edit Tags",
        assignBedsPrivilege: "Assign Beds"
    };
})();

