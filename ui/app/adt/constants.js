'use strict';

var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.Constants = (function () {
    return {
        patientsListUrl: "/patient/search",
        ipdDashboard: "#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
        admissionLocationUrl: "/openmrs/ws/rest/v1/admissionLocation/"
    };
})();

