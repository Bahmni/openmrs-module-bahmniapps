'use strict';

angular.module('bahmni.ipd')
    .directive('adtPatientSearch', ['$timeout', function ($timeout) {
        return {
            restrict: 'E',
            controller: 'PatientsListController',
            templateUrl: "template-patient-search-patient-list"
        };
    }]);
