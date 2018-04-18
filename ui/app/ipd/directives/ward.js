'use strict';

angular.module('bahmni.ipd')
    .directive('ward', [function () {
        return {
            restrict: 'E',
            controller: "WardController",
            scope: {
                ward: "="
            },
            templateUrl: "../ipd/views/ward.html"
        };
    }]);
