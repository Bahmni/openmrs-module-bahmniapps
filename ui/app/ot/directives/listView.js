'use strict';

angular.module('bahmni.ot')
    .directive('listView', [function () {
        return {
            restrict: 'E',
            controller: "listViewController",
            scope: {
                viewDate: "=",
                filterParams: "=",
                weekStartDate: "=",
                weekEndDate: "=",
                weekOrDay: "="
            },
            templateUrl: "../ot/views/listView.html"
        };
    }]);
