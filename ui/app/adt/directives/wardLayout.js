'use strict';

angular.module('bahmni.adt')
    .directive('wardLayout', [ function () {
        return {
            restrict: 'E',
            controller: "WardLayoutController",
            scope: {
                ward: "=",
                readOnly: "=",
                encounterUuid: "=",
                patientUuid: "=",
                visitUuid: "="
            },
            templateUrl: "../adt/views/wardLayout.html"
        };
    }]);
