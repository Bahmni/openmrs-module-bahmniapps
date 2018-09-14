'use strict';

angular.module('bahmni.appointments')
    .directive('weekCalendar', [function () {
        return {
            restrict: 'E',
            controller: "AppointmentsWeekCalendarController",
            scope: {
                appointments: "=",
                date: "="
            },
            templateUrl: "../appointments/views/manage/calendar/weekCalendar.html"
        };
    }]);
