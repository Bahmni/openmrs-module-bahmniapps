'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.patient', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'bahmni.adt',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'opd.patientDashboard', 'ui.select2', 'infinite-scroll', 'bahmni.common.util']);
angular.module('consultation').config(['$stateProvider', '$httpProvider', function ($stateProvider, $httpProvider) {

        $stateProvider
            .state('patientsearch', {
                url: '/patient/search',
                views: {
                    'content': { 
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller : 'PatientsListController'
                    }
                },
                data: {
                    backLinks: [{label: "Home", url: "/home"}]
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                data: {
                    backLinks: [{label: "Patient Q", url: "/clinical/#/patient/search"}]
                },
                views: {
                    'additional-header': { template: '<div ui-view="additional-header"></div>' },
                    'content': { template: '<div ui-view="content"></div>' }
                },
                resolve: {
                    consultationInitialization: function(consultationInitialization, $stateParams) {
                    return consultationInitialization($stateParams.patientUuid);
                }}
            })
            .state('patient.dashboard', {
                url: '/dashboard',
                views: {
                    'content': {
                        templateUrl: 'views/dashboard.html',
                        controller: 'PatientDashboardController'
                    }
                }
            })
            .state('patient.consultation', {
                url: '',
                abstract: true,
                views: {
                    'content': { template: '<ui-view/>' },
                    'additional-header': { templateUrl: '../common/patient/header/views/header.html' }
                }
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
                templateUrl: 'views/diagnosis.html',
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
                url: '/concept-set-group/:conceptSetGroupName',
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
            .state('patient.consultation.new', {
                url: '/new',
                templateUrl: 'views/patientDashboard.html'
            })
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]);
