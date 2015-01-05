'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.config', 'bahmni.common.patient', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.obs',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'bahmni.adt',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngAnimate', 'ngDialog', 'angular-gestures', 'bahmni.common.util']);
angular.module('consultation')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/patient/search');
        var patientSearchBackLink = {label: "<u>P</u>atients", state: "patientsearch", accessKey: "p"};
        $stateProvider
            .state('patientsearch', {
                url: '/patient/search',
                views: {
                    'content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    }
                },
                data: {
                    backLinks: [
                        {label: "Home", url: "../home/"}
                    ]
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                data: {
                    backLinks: [patientSearchBackLink]
                },

                views: {
                    'additional-header': { template: '<div ui-view="additional-header"></div>' },
                    'content': {
                        template: '<div ui-view="content"></div><patient-control-panel patient="patient"/>',
                        controller: function ($scope, patientContext) {
                            $scope.patient = patientContext.patient;
                        }
                    }
                },
                resolve: {
                    initialization: 'initialization',
                    patientContext: function (patientInitialization, $stateParams) {
                        return patientInitialization($stateParams.patientUuid);
                    }
                }
            })
            .state('patient.dashboard', {
                url: '/dashboard',
                views: {
                    'additional-header': {
                        templateUrl: 'dashboard/views/dashboardHeader.html',
                        controller: function ($scope, patientContext) {
                            $scope.patient = patientContext.patient;
                        }
                    },
                    'content': {
                        templateUrl: 'dashboard/views/dashboard.html',
                        controller: 'PatientDashboardController'
                    }
                },
                resolve: {
                    dashboardInitialization: function (dashboardInitialization, $stateParams, initialization, patientContext) {
                        return dashboardInitialization(patientContext.patient.uuid);
                    }
                }
            })
            .state('patient.visit', {
                url: '/dashboard/visit/:visitUuid',
                data: {
                    backLinks: [
                        {label: "Dashboard", state: "patient.dashboard"}
                    ]
                },
                views: {
                    'additional-header': { templateUrl: 'common/views/visitHeader.html' },
                    'content': {
                        templateUrl: 'common/views/visit.html',
                        controller: 'VisitController'
                    }
                },
                resolve: {
                    visitInitialization: function (visitInitialization, $stateParams, initialization, patientContext) {
                        return visitInitialization(patientContext.patient.uuid, $stateParams.visitUuid);
                    }}
            })
            .state('patient.consultation', {
                url: '',
                abstract: true,
                data: {
                    backLinks: [patientSearchBackLink]
                },
                views: {
                    'content': { template: '<ui-view/>' },
                    'additional-header': { 
                        templateUrl: 'common/views/header.html',
                        controller: 'ConsultationController'
                    }
                },
                resolve: {
                    consultationInitialization: function (initialization, consultationInitialization, patientContext) {
                        return consultationInitialization(patientContext.patient.uuid);
                    }
                }
            })
            .state('patient.consultation.visit', {
                url: '/visit/:visitUuid',
                templateUrl: 'common/views/visit.html',
                controller: 'VisitController',
                resolve: {
                    visitInitialization: function (visitInitialization, $stateParams) {
                        return visitInitialization($stateParams.patientUuid, $stateParams.visitUuid);
                    }}
            })
            .state('patient.consultation.summary', {
                url: '/consultation',
                templateUrl: 'consultation/views/consultation.html',
                controller: 'ConsultationSummaryController'
            })
            .state('patient.consultation.investigation', {
                url: '/investigation',
                templateUrl: 'consultation/views/investigations.html',
                controller: 'InvestigationController'
            })
            .state('patient.consultation.diagnosis', {
                url: '/diagnosis',
                templateUrl: 'consultation/views/diagnosis.html',
                controller: 'DiagnosisController'
            })
            .state('patient.consultation.treatment', {
                abstract: true,
                templateUrl: 'consultation/views/treatment.html'
            })
            .state('patient.consultation.treatment.page', {
                url: '/treatment',
                views: {
                    "addTreatment": {
                        controller: 'TreatmentController',
                        templateUrl: 'consultation/views/treatmentSections/addTreatment.html',
                        resolve: {
                            treatmentConfig: 'treatmentConfig'
                        }
                    },
                    "viewHistory": {
                        controller: 'DrugOrderHistoryController',
                        templateUrl: 'consultation/views/treatmentSections/drugOrderHistory.html',
                        resolve: {
                            prescribedDrugOrders: function (TreatmentService, $stateParams) {
                                return TreatmentService.getPrescribedDrugOrders($stateParams.patientUuid, true, 3);
                            },
                            treatmentConfig: 'treatmentConfig'
                        }
                    }
                }
            })
            .state('patient.consultation.disposition', {
                url: '/disposition',
                templateUrl: 'consultation/views/disposition.html',
                controller: 'DispositionController'
            })
            .state('patient.consultation.conceptSet', {
                url: '/concept-set-group/:conceptSetGroupName',
                templateUrl: 'consultation/views/conceptSet.html',
                controller: 'ConceptSetPageController'
                
            })
            .state('patient.consultation.notes', {
                url: '/notes',
                templateUrl: 'consultation/views/notes.html'
            })
            .state('patient.consultation.templates', {
                url: '/templates',
                templateUrl: 'views/comingSoon.html'
            })
            .state('patient.visitsummaryprint', {
                url: '/latest-prescription-print',
                views: {
                    content: {
                        controller: 'LatestPrescriptionPrintController'
                    }
                },
                resolve: {
                    dashboardInitialization: function (dashboardInitialization, $stateParams, patientContext) {
                        return dashboardInitialization($stateParams.patientUuid);
                    }
                }
            });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['stateChangeSpinner', '$rootScope', function (stateChangeSpinner, $rootScope) {
//        debugUiRouter($rootScope);

        FastClick.attach(document.body);
        stateChangeSpinner.activate();
    }]);