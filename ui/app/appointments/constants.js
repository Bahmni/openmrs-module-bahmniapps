'use strict';

var Bahmni = Bahmni || {};
Bahmni.Appointments = Bahmni.Appointments || {};

Bahmni.Appointments.Constants = (function () {
    var hostURL = Bahmni.Common.Constants.hostURL + Bahmni.Common.Constants.RESTWS_V1;
    return {
        createServiceUrl: hostURL + '/appointmentService',
        getServiceLoad: hostURL + '/appointmentService/load',
        getAllSpecialitiesUrl: hostURL + '/speciality/all',
        createAppointmentUrl: hostURL + '/appointment',
        getAppointmentsForServiceTypeUrl: hostURL + '/appointment/futureAppointmentsForServiceType/',
        changeAppointmentStatusUrl: hostURL + '/appointment/{{appointmentUuid}}/changeStatus',
        undoCheckInUrl: hostURL + '/appointment/undoStatusChange/',
        getAppointmentByUuid: hostURL + '/appointment/',
        getAllAppointmentsUrl: hostURL + '/appointment/all',
        searchAppointmentUrl: hostURL + '/appointment/search',
        getAppointmentsSummaryUrl: hostURL + '/appointment/appointmentSummary',
        defaultServiceTypeDuration: 15,
        defaultCalendarSlotLabelInterval: "01:00",
        defaultCalendarSlotDuration: "00:30",
        defaultCalendarStartTime: "08:00",
        defaultCalendarEndTime: "19:00",
        minDurationForAppointment: 30,
        appointmentStatusList: [ "Scheduled", "CheckedIn", "Completed", "Cancelled", "Missed" ],
        regexForTime: /^(?:(?:1[0-2]|0?[1-9]):[0-5]\d\s*[AaPp][Mm])?$/,
        privilegeManageAppointments: 'app:appointments:manageAppointmentsTab',
        privilegeForAdmin: 'app:appointments:adminTab',
        privilegeOwnAppointments: 'Manage Own Appointments',
        availableForAppointments: 'Available for appointments'
    };
})();

