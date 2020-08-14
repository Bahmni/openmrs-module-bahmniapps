'use strict';

angular.module('bahmni.ot')
    .directive('otWeeklyCalendar', [function () {
        return {
            restrict: 'E',
            controller: "otCalendarController",
            scope: {
                weekOrDay: "=",
                weekStartDate: "=",
                viewDate: "=",
                dayViewStart: "=",
                dayViewEnd: "=",
                dayViewSplit: "=",
                filterParams: "="
            },
            templateUrl: "../ot/views/otWeeklyCalendar.html"
        };
    }]);
