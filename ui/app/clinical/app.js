'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.config', 'bahmni.common.patient', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.obs',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.pivottable', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.routeErrorHandler',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngAnimate', 'ngDialog', 'angular-gestures', 'bahmni.common.util']);
angular.module('consultation')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/patient/search');
        var patientSearchBackLink = {label: "<u>P</u>atients", state: "patientsearch", accessKey: "p", id: "patients-link"};
        var patientDashboardLink = {label: "<i class='icon-user'>", state: "patient.dashboard", id: "dashboard-link"};
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
                        template: '<div ui-view="content"></div><patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel"/>',
                        controller: function ($scope, patientContext, visitHistory, visitContext) {
                            $scope.patient = patientContext.patient;
                            $scope.visitHistory = visitHistory;
                            $scope.visit = visitContext;
                        }
                    }
                },
                resolve: {
                    initialization: 'initialization',
                    patientContext: function (initialization, patientInitialization, $stateParams) {
                        return patientInitialization($stateParams.patientUuid);
                    },
                    visitHistory: function (visitHistoryInitialization, $stateParams) {
                        return visitHistoryInitialization($stateParams.patientUuid);
                    },
                    visitContext: function (visitInitialization, visitHistory, initialization) {
                        if (visitHistory.activeVisit) {
                            return visitInitialization(visitHistory.activeVisit.uuid);
                        }
                        return null;
                    }
                }
            })
            .state('patient.dashboard', {
                url: '/dashboard',
                views: {
                    'additional-header': {
                        templateUrl: 'dashboard/views/dashboardHeader.html',
                        controller: 'DashboardHeaderController'
                    },
                    'content': {
                        templateUrl: 'dashboard/views/dashboard.html',
                        controller: 'PatientDashboardController'
                    }
                },
                resolve: {
                    dashboardInitialization: function(initialization, dashboardConfig) {
                        return dashboardConfig.load();
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
                    'additional-header': {
                        templateUrl: 'common/views/visitHeader.html',
                        controller: 'VisitHeaderController'
                    },
                    'content': {
                        templateUrl: 'common/views/visit.html',
                        controller: 'VisitController'
                    }
                },
                resolve: {
                    visitContext: function (visitInitialization, $stateParams, initialization, patientContext) {
                        return visitInitialization($stateParams.visitUuid);
                    },
                    visitSummary: function(visitSummaryInitialization, $stateParams){
                        return visitSummaryInitialization($stateParams.visitUuid);
                    },
                    visitConfigInitialization: function(initialization, visitTabConfig) {
                        return visitTabConfig.load();
                    }
                }
            })
            .state('patient.consultation', {
                url: '',
                abstract: true,
                data: {
                    backLinks: [patientSearchBackLink,patientDashboardLink]
                },
                views: {
                    'additional-header': {
                        templateUrl: 'consultation/views/header.html',
                        controller: 'ConsultationController'
                    },
                    'content': {
                        template: '<ui-view/>',
                        controller: function ($scope, consultationContext) {
                            $scope.consultation = consultationContext;
                        }
                    }
                },
                resolve: {
                    consultationContext: function (consultationInitialization, initialization, visitContext, $stateParams) {
                        return consultationInitialization($stateParams.patientUuid);
                    }
                }
            })
            .state('patient.consultation.visit', {
                url: '/visit/:visitUuid',
                templateUrl: 'common/views/visit.html',
                controller: 'VisitController',
                resolve:{
                visitSummary: function(visitSummaryInitialization, $stateParams) {
                    return visitSummaryInitialization($stateParams.visitUuid);
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
                }
            });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['stateChangeSpinner', '$rootScope', function (stateChangeSpinner, $rootScope) {
//        debugUiRouter($rootScope);
        FastClick.attach(document.body);
        stateChangeSpinner.activate();

        $rootScope.$on('$stateChangeSuccess', function() {
            window.scrollTo(0,0);
        });
    }]);