'use strict';

angular.module('bahmni.registration')
    .directive('extraPatientIdentifiers', function () {
        return {
            templateUrl: 'views/patientIdentifier.html',
            scope: {
                fieldValidation: '='
            },
            restrict: 'E',
            link: function (scope) {
                scope.controllerScope = scope.$parent;
            }
        };
    });
