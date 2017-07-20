'use strict';

var Bahmni = Bahmni || {};
Bahmni.Appointments = Bahmni.Appointments || {};

Bahmni.Appointments.Constants = (function () {
    var appointmentServiceURL = Bahmni.Common.Constants.hostURL + Bahmni.Common.Constants.RESTWS_V1;
    return {
        createServiceUrl: appointmentServiceURL + '/appointmentService',
        getAllSpecialitiesUrl: appointmentServiceURL + '/speciality/all',
        defaultServiceTypeDuration: 15
    };
})();

