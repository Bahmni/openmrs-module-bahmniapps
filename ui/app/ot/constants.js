'use strict';

var Bahmni = Bahmni || {};
Bahmni.OT = Bahmni.OT || {};

Bahmni.OT.Constants = (function () {
    var RESTWS_V1 = "/openmrs/ws/rest/v1";
    return {
        addSurgicalBlockUrl: RESTWS_V1 + "/surgicalBlock",
        updateSurgicalAppointmentUrl: RESTWS_V1 + "/surgicalAppointment",
        surgicalAppointmentAttributeTypeUrl: RESTWS_V1 + "/surgicalAppointmentAttributeType"
    };
})();

