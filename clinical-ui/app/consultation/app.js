'use strict';

angular.module('consultation', ['ngRoute','opd.consultation', 'bahmni.common.patient', 'bahmni.common.util',
    'bahmni.common.visit', 'bahmni.common.encounter', 'opd.conceptSet', 'authentication', 'appFramework', 'opd.bedManagement',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'bahmni.common', 'bahmni.common.backlink', 'opd.patientDashboard', 'ui.select2']);
angular.module('consultation').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/patient/:patientUuid/visit/:visitUuid', {
            templateUrl: 'views/visit.html',
            controller: 'VisitController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid', {
            templateUrl: 'views/dashboard.html',
            controller: 'PatientDashboardController',
            tiles: {header: "../common/common/header.html"},
            resolve: {initialization: 'initialization', tilesLayout: 'tilesLayout'}
        });
        $routeProvider.when('/patient/:patientUuid/consultation', {
            templateUrl: 'views/consultation.html',
            controller: 'ConsultationController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid/diagnosis', {
            templateUrl: 'views/addObservation.html',
            controller: 'DiagnosisController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid/treatment', {
            templateUrl: 'views/treatment.html',
            controller: 'TreatmentController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid/investigation', {
            templateUrl: 'views/investigations.html',
            controller: 'InvestigationController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid/notes', {
            templateUrl: 'views/notes.html'
        });
        $routeProvider.when('/patient/:patientUuid/templates', {
            templateUrl: 'views/comingSoon.html'
        });
        $routeProvider.when('/patient/:patientUuid/disposition', {
            templateUrl: 'views/disposition.html',
            controller: 'DispositionController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.when('/patient/:patientUuid/concept-set/:conceptSetName', {
            templateUrl: 'views/conceptSet.html',
            controller: 'ConceptSetPageController',
            resolve: {initialization: 'initialization'}
        });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("Patient Q", "/clinical/patients/#/clinical");
    }]);
