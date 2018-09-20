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
        changeAppointmentStatusUrl: hostURL + '/appointments/{{appointmentUuid}}/status-change',
        getAppointmentByUuid: hostURL + '/appointment/',
        getAllAppointmentsUrl: hostURL + '/appointment/all',
        searchAppointmentUrl: hostURL + '/appointment/search',
        searchAppointmentsUrl: hostURL + '/appointments/search',
        getAppointmentsSummaryUrl: hostURL + '/appointment/appointmentSummary',
        defaultServiceTypeDuration: 15,
        defaultCalendarSlotLabelInterval: "01:00",
        defaultCalendarSlotDuration: "00:30",
        defaultCalendarStartTime: "08:00",
        defaultCalendarEndTime: "19:00",
        defaultExpandServiceFilter: -1,
        collapseServiceFilter: 0,
        angularCalendarDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        defaultWeekStartDayName: 'Sunday',
        minDurationForAppointment: 30,
        appointmentStatusList: [ "Scheduled", "CheckedIn", "Completed", "Cancelled", "Missed" ],
        regexForTime: /^(?:(?:1[0-2]|0?[1-9]):[0-5]\d\s*[AaPp][Mm])?$/,
        privilegeManageAppointments: 'app:appointments:manageAppointmentsTab',
        privilegeForAdmin: 'app:appointments:adminTab',
        privilegeOwnAppointments: 'Manage Own Appointments',
        privilegeResetAppointmentStatus: 'Reset Appointment Status',
        availableForAppointments: 'Available for appointments',
        weekDays: {"Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 },
        providerResponses: { ACCEPTED: "ACCEPTED", REJECTED: "REJECTED", TENTATIVE: "TENTATIVE", CANCELLED: "CANCELLED", AWAITING: "AWAITING" }
    };
})();

