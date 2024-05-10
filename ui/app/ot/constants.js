'use strict';

var Bahmni = Bahmni || {};
Bahmni.OT = Bahmni.OT || {};

Bahmni.OT.Constants = (function () {
    var RESTWS_V1 = "/openmrs/ws/rest/v1";
    return {
        cancelled: "CANCELLED",
        postponed: "POSTPONED",
        completed: "COMPLETED",
        scheduled: "SCHEDULED",
        addSurgicalBlockUrl: RESTWS_V1 + "/surgicalBlock",
        updateSurgicalAppointmentUrl: RESTWS_V1 + "/surgicalAppointment",
        surgicalAppointmentAttributeTypeUrl: RESTWS_V1 + "/surgicalAppointmentAttributeType",
        defaultCalendarEndTime: '23:59',
        defaultCalendarStartTime: '00:00',
        weekDays: {"Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 7 },
        defaultWeekStartDayName: 'Sunday',
        providerSurgicalAttributeFormat: 'org.openmrs.Provider',
        notesUrl: RESTWS_V1 + '/notes'
    };
})();

