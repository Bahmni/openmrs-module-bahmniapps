'use strict';


angular.module('opd', ['navigation.navigationController','opd.diagnosisController','opd.treatmentController','opd.investigationController'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/opd/views/consultation.html'});
        $routeProvider.when('/patient/:patientUuid/diagnosis', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'DiagnosisController'});
        $routeProvider.when('/patient/:patientUuid/treatment', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'TreatmentController'});
        $routeProvider.when('/patient/:patientUuid/investigation', {templateUrl: 'modules/opd/views/addObservation.html', controller: 'InvestigationController'});
        $routeProvider.when('/patient/:patientUuid/notes', {templateUrl: 'modules/opd/views/notes.html'});
        $routeProvider.when('/patient/:patientUuid/templates', {templateUrl: 'modules/navigation/views/comingSoon.html'});
        $routeProvider.otherwise('/blank', {templateUrl: 'modules/navigation/views/comingSoon.html'});
    }]);