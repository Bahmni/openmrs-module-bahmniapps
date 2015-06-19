'use strict';

angular.module('bahmni.adt')
    .directive('ward', [function () {
        return {
            restrict: 'E',
            controller: "WardController",
            scope: {
                ward: "=",
                readOnly: "=",
                encounterUuid: "=",
                patientUuid: "=",
                visitUuid: "="
            },
            templateUrl: "../adt/views/ward.html"
        };
    }]);
