'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.config', 'bahmni.common.patient', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.obs',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.displaycontrol.documents', 'bahmni.common.displaycontrol.observation',
    'bahmni.common.displaycontrol.pivottable', 'bahmni.common.displaycontrol.dashboard', 'bahmni.common.gallery',
    'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.disposition',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngAnimate', 'ngDialog',
    'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize',
    'bahmni.common.orders', 'bahmni.common.displaycontrol.orders' ]);
angular.module('consultation')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/patient/search');
        var patientSearchBackLink = {label: "", state: "patientsearch", accessKey: "p", id: "patients-link", icon: "fa-users"};
        var homeBackLink = {label: "", url: "../home/", icon: "fa-home"};
        $stateProvider
            .state('patientsearch', {
                url: '/patient/search',
                views: {
                    'content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    },
                    'additional-header': {
                        templateUrl: '../common/ui-helper/header.html',
                        controller: 'PatientListHeaderController'
                    }
                },
                data: {
                    backLinks: [homeBackLink]
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                data: {
                    backLinks: [homeBackLink, patientSearchBackLink]
                },

                views: {
                    'additional-header': {template: '<div ui-view="additional-header"></div>'},
                    'content': {
                        template: '<div ui-view="content"></div><patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel"/>',
                        controller: function ($scope, patientContext, visitHistory) {
                            $scope.patient = patientContext.patient;
                            $scope.visitHistory = visitHistory;
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
                    }
                }
            })
            .state('patient.consultationContext',{
                url:'/consultationcontext',
                views: {
                    'content': {
                        templateUrl: 'consultationcontext/views/consultationcontext.html',
                        controller: function ($scope, patientContext){
                            $scope.patient = patientContext.patient;
                        }
                    },
                    'additional-header': {
                        templateUrl: '../common/ui-helper/header.html',
                        controller: 'PatientListHeaderController'
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
                    dashboardInitialization: function ($rootScope, initialization, patientContext, clinicalDashboardConfig, userService) {
                        return clinicalDashboardConfig.load().then(function (data) {
                            $rootScope.currentUser.addToRecentlyViewed(patientContext.patient, clinicalDashboardConfig.getMaxRecentlyViewedPatients());
                            return userService.savePreferences();
                        });
                    },
                    visitSummary: function (visitSummaryInitialization, initialization, visitHistory) {
                        return visitHistory.activeVisit ? visitSummaryInitialization(visitHistory.activeVisit.uuid) : null;
                    }
                }
            })

            .state('patient.visit', {
                url: '/dashboard/visit/:visitUuid',
                data: {
                    backLinks: [homeBackLink, patientSearchBackLink]
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
                    visitSummary: function (visitSummaryInitialization, $stateParams) {
                        return visitSummaryInitialization($stateParams.visitUuid);
                    },
                    visitConfig: function (initialization, visitTabConfig) {
                        return visitTabConfig.load();
                    }
                }
            })
            .state('patient.consultation', {
                url: '',
                abstract: true,
                data: {
                    backLinks: [homeBackLink, patientSearchBackLink]
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
                    consultationContext: function (consultationInitialization, initialization, $stateParams) {
                        return consultationInitialization($stateParams.patientUuid);
                    }
                }
            })
            .state('patient.consultation.visit', {
                url: '/visit/:visitUuid',
                templateUrl: 'common/views/visit.html',
                controller: 'VisitController',
                resolve: {
                    visitSummary: function (visitSummaryInitialization, $stateParams) {
                        return visitSummaryInitialization($stateParams.visitUuid);
                    }
                }
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
            .state('patient.consultation.orders', {
                url: '/orders',
                templateUrl: 'consultation/views/orders.html',
                controller: 'OrderController',
                resolve: {
                    allOrderables: function (ordersTabInitialization){
                        return ordersTabInitialization();
                    }
                }
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
        //debugUiRouter($rootScope);
        FastClick.attach(document.body);
        stateChangeSpinner.activate();

        $rootScope.$on('$stateChangeSuccess', function () {
            window.scrollTo(0, 0);
        });
    }]);