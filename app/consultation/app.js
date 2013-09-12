'use strict';

angular.module('consultation', ['opd.consultation', 'bahmni.common.infrastructure', 'bahmni.common.patient'])
angular.module('consultation').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/visit/:visitUuid/', {templateUrl: 'modules/consultation/views/consultation.html', controller: 'ConsultationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/diagnosis', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'DiagnosisController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/treatment', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'TreatmentController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/investigation', {templateUrl: 'modules/consultation/views/investigations.html', controller: 'InvestigationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/notes', {templateUrl: 'modules/consultation/views/notes.html'});
        $routeProvider.when('/visit/:visitUuid/templates', {templateUrl: 'modules/consultation/views/comingSoon.html'});
        $routeProvider.otherwise({redirectTo: Bahmni.Opd.Constants.activePatientsListUrl});
}]);