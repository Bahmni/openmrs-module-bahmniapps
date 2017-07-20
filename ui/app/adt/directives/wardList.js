'use strict';

angular.module('bahmni.adt')
    .directive('wardList', [function () {
        return {
            restrict: 'E',
            controller: 'WardListController',
            scope: {
                ward: "="
            },
            templateUrl: "../adt/views/wardList.html"
        };
    }]);
