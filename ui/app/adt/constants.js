'use strict';

var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.Constants = (function () {
    return {
        patientsListUrl: "/patient/search",
        ipdDashboardUrl: "#/patient/{{patientUuid}}/visit/{{visitUuid}}/",
        admissionLocationUrl: "/openmrs/ws/rest/v1/admissionLocation/",
        mfeIpdDashboardUrl: Bahmni.Common.Constants.hostURL + '/bahmni/clinical/#/default/patient/{{patientUuid}}/dashboard/visit/ipd/{{visitUuid}}?source=adt'
    };
})();

