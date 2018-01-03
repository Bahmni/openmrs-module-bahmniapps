'use strict';

angular.module('bahmni.appointments')
    .directive('dayCalendar', [function () {
        return {
            restrict: 'E',
            controller: "AppointmentsDayCalendarController",
            scope: {
                appointments: "=",
                date: "="
            },
            templateUrl: "../appointments/views/manage/calendar/dayCalendar.html"
        };
    }]);
