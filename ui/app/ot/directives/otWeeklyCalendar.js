'use strict';

angular.module('bahmni.ot')
    .directive('otWeeklyCalendar', [function () {
        return {
            restrict: 'E',
            controller: "otCalendarController",
            scope: {
                weekStartDate: "=",
                viewDate: "=",
                dayViewStart: "=",
                dayViewEnd: "=",
                dayViewSplit: "="
            },
            templateUrl: "../ot/views/otWeeklyCalendar.html"
        };
    }]);
