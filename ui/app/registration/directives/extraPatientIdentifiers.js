'use strict';

angular.module('bahmni.registration')
    .directive('extraPatientIdentifiers', function () {
        return {
            templateUrl: 'views/patientIdentifier.html',
            scope: {
                fieldValidation: '=',
                patient: '='
            },
            restrict: 'E'
        };
    });
