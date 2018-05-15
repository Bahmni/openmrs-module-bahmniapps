'use strict';

angular.module('bahmni.ot')
    .directive('otCalendar', [function () {
        return {
            restrict: 'E',
            controller: "otCalendarController",
            scope: {
                viewDate: "=",
                dayViewStart: "=",
                dayViewEnd: "=",
                dayViewSplit: "=",
                filterParams: "="
            },
            templateUrl: "../ot/views/otCalendar.html"
        };
    }]);
