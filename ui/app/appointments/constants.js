'use strict';

var Bahmni = Bahmni || {};
Bahmni.Appointments = Bahmni.Appointments || {};

Bahmni.Appointments.Constants = (function () {
    var hostURL = Bahmni.Common.Constants.hostURL + Bahmni.Common.Constants.RESTWS_V1;
    return {
        createServiceUrl: hostURL + '/appointmentService',
        getAllSpecialitiesUrl: hostURL + '/speciality/all',
        createAppointmentUrl: hostURL + '/appointment',
        getAllAppointmentsUrl: hostURL + '/appointment/all',
        searchAppointmentUrl: hostURL + '/appointment/search',
        defaultServiceTypeDuration: 15,
        defaultCalendarSlotLabelInterval: "01:00:00",
        defaultCalendarSlotDuration: "00:30:00",
        defaultCalendarStartTime: "08:00",
        defaultCalendarEndTime: "19:00",
        defaultAppointmentStatus: 'Scheduled'
    };
})();

