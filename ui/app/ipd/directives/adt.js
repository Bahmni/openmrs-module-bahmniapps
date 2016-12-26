'use strict';

angular.module('bahmni.ipd')
    .directive('adt', [function () {
        return {
            restrict: 'E',
            controller: "AdtController",
            scope: {
                patient: "=",
                encounterConfig: "=?bind",
                bed: "="
            },
            templateUrl: "../ipd/views/adt.html"
        };
    }]);
