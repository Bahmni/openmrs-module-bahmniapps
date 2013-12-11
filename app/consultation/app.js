'use strict';

angular.module('consultation', ['opd.consultation', 'bahmni.common.infrastructure', 'bahmni.common.patient',
    'bahmni.common.visit', 'bahmni.common.encounter', 'opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'pasvaz.bindonce', 'bahmni.common.controllers']);
angular.module('consultation').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/visit/:visitUuid/', {templateUrl: 'modules/consultation/views/empty.html', controller: 'VisitRedirectionController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/visit', {templateUrl: 'modules/consultation/views/visit.html', controller: 'VisitController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/consultation', {templateUrl: 'modules/consultation/views/consultation.html', controller: 'ConsultationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/diagnosis', {templateUrl: 'modules/consultation/views/addObservation.html', controller: 'DiagnosisController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/treatment', {templateUrl: 'modules/consultation/views/treatment.html', controller: 'TreatmentController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/investigation', {templateUrl: 'modules/consultation/views/investigations.html', controller: 'InvestigationController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/notes', {templateUrl: 'modules/consultation/views/notes.html'});
        $routeProvider.when('/visit/:visitUuid/templates', {templateUrl: 'modules/consultation/views/comingSoon.html'});
        $routeProvider.when('/visit/:visitUuid/disposition', {templateUrl: 'modules/consultation/views/disposition.html',controller: 'DispositionController',resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/:visitUuid/concept-set/:conceptSetName', {template: '<show-concept-set/>',resolve: {initialization: 'initialization'}});
        $routeProvider.otherwise({redirectTo: Bahmni.Opd.Consultation.Constants.activePatientsListUrl});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
