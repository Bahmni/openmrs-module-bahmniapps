'use strict';

var Bahmni = Bahmni || {};
Bahmni.Appointments = Bahmni.Appointments || {};

Bahmni.Appointments.Constants = (function () {
    var hostURL = Bahmni.Common.Constants.hostURL + Bahmni.Common.Constants.RESTWS_V1;
    return {
        createServiceUrl: hostURL + '/appointmentService',
        getAllSpecialitiesUrl: hostURL + '/speciality/all',
        defaultServiceTypeDuration: 15,
        createAppointmentUrl: hostURL
    };
})();

