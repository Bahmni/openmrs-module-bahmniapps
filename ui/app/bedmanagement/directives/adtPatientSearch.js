'use strict';

angular.module('bahmni.ipd')
    .directive('adtPatientSearch', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            controller: 'PatientsListController',
            templateUrl: '../common/patient-search/views/patientsList.html'
        };
    }]);
