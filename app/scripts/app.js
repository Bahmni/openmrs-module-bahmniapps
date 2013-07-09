'use strict';


angular.module('opd', ['navigation.navigationController','opd.diagnosisController','opd.treatmentController','opd.investigationController', 'opd.activePatientsListController', 'opd.treeSelect.controllers'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/opd/views/consultation.html'});
        $routeProvider.when('/patient/:patientUuid/diagnosis', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'DiagnosisController'});
        $routeProvider.when('/patient/:patientUuid/treatment', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'TreatmentController'});
        $routeProvider.when('/patient/:patientUuid/investigation', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'InvestigationController'});
        $routeProvider.when('/patient/:patientUuid/notes', {templateUrl: 'modules/opd/views/notes.html'});
        $routeProvider.when('/patient/:patientUuid/templates', {templateUrl: 'modules/navigation/views/comingSoon.html'});
        $routeProvider.when(constants.activePatientsListUrl , { templateUrl: 'modules/opd/views/activePatientsList.html', controller: 'ActivePatientsListController'});
        $routeProvider.when('/column' , { templateUrl: 'modules/tree-select/views/tree-selector.html', controller: 'TreeSelectController'});
        $routeProvider.otherwise('/blank', {templateUrl: 'modules/navigation/views/comingSoon.html'});
    }]);