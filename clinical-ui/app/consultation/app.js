'use strict';

angular.module('consultation', ['ui.router', 'opd.consultation', 'bahmni.common.patient', 'bahmni.common.util', 'bahmni.common.patientSearch',
    'bahmni.common.visit', 'bahmni.common.encounter', 'opd.conceptSet', 'authentication', 'appFramework', 'opd.bedManagement',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'bahmni.common', 'bahmni.common.backlink', 'opd.patientDashboard', 'ui.select2', 'infinite-scroll']);
angular.module('consultation').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {

        $stateProvider
            .state('patientsearch', {
                url: '/patient/search',
                templateUrl: '../common/patient-search/views/activePatientsList.html',
                controller : 'ActivePatientsListController',
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    consultationInitialization: function(consultationInitialization, $stateParams) {
                    return consultationInitialization($stateParams.patientUuid);
                }}
            })
            .state('patient.dashboard', {
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'PatientDashboardController'
            })
            .state('patient.consultation', {
                url: '',
                abstract: true,
                templateUrl: 'consultation_layout.html'
            })
            .state('patient.consultation.visit', {
                url: '/visit/:visitUuid',
                templateUrl: 'views/visit.html',
                controller: 'VisitController'
            })
            .state('patient.consultation.summary', {
                url: '/consultation',
                templateUrl: 'views/consultation.html',
                controller: 'ConsultationController'
            })
            .state('patient.consultation.investigation', {
                url: '/investigation',
                templateUrl: 'views/investigations.html',
                controller: 'InvestigationController'
            })
            .state('patient.consultation.diagnosis', {
                url: '/diagnosis',
                templateUrl: 'views/addObservation.html',
                controller: 'DiagnosisController'
            })
            .state('patient.consultation.treatment', {
                url: '/treatment',
                templateUrl: 'views/treatment.html',
                controller: 'TreatmentController'
            })
            .state('patient.consultation.disposition', {
                url: '/disposition',
                templateUrl: 'views/disposition.html',
                controller: 'DispositionController'
            })
            .state('patient.consultation.conceptSet', {
                url: '/concept-set/:conceptSetName',
                templateUrl: 'views/conceptSet.html',
                controller: 'ConceptSetPageController'
            })
            .state('patient.consultation.notes', {
                url: '/notes',
                templateUrl: 'views/notes.html'
            })
            .state('patient.consultation.templates', {
                url: '/templates',
                templateUrl: 'views/comingSoon.html'
            })
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("Patient Q", "/clinical/consultation/#/patient/search");
    }]);
