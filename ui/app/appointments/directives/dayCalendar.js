'use strict';

angular.module('bahmni.appointments')
    .directive('dayCalendar', ['uiCalendarConfig', function (uiCalendarConfig) {
        return {
            restrict: 'E',
            controller: "AppointmentsDayCalendarController",
            scope: {
                appointments: "="
            },
            templateUrl: "../appointments/views/manage/calendar/dayCalendar.html"
        };
    }]);
