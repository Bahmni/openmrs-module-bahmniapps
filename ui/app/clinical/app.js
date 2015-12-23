'use strict';
'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.config', 'bahmni.common.patient', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.obs', 'bahmni.common.i18n',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'bahmni.common.displaycontrol.documents', 'bahmni.common.displaycontrol.observation',
    'bahmni.common.displaycontrol.pivottable', 'bahmni.common.displaycontrol.dashboard', 'bahmni.common.gallery',
    'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.custom', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.disposition',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngAnimate', 'ngDialog',
    'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize',
    'bahmni.common.orders', 'bahmni.common.displaycontrol.orders', 'bahmni.common.displaycontrol.prescription', 'bahmni.common.displaycontrol.navigationlinks', 'bahmni.common.displaycontrol.programs',
    'bahmni.common.displaycontrol.pacsOrders', 'bahmni.common.uicontrols.programmanagment', 'pascalprecht.translate', 'ngCookies','monospaced.elastic','bahmni.common.bacteriologyresults','bahmni.common.displaycontrol.bacteriologyresults', 'bahmni.common.displaycontrol.obsVsObsFlowSheet',
    'bahmni.common.displaycontrol.chronicTreatmentChart', 'bahmni.common.displaycontrol.forms', 'bahmni.common.displaycontrol.drugOrderDetails']);
angular.module('consultation')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider','$bahmniTranslateProvider', function ($stateProvider, $httpProvider, $urlRouterProvider,$bahmniTranslateProvider) {
        $urlRouterProvider.otherwise('/' + Bahmni.Clinical.Constants.defaultExtensionName + '/patient/search');
        var patientSearchBackLink = {
            label: "",
            state: "search.patientsearch",
            accessKey: "p",
            id: "patients-link",
            icon: "fa-users"
        };
        var homeBackLink = {label: "", url: "../home/", accessKey: "h", icon: "fa-home"};

        $stateProvider
            .state('search', {
                abstract: true,
                views: {
                    'content': {
                        template: '<div ui-view="patientSearchPage-header"></div> <div ui-view="patientSearchPage-content"></div>'
                    }
                },
                data: {
                    backLinks: [homeBackLink]
                },
                resolve: {
                    retrospectiveIntialization: function(retrospectiveEntryService){
                        return retrospectiveEntryService.initializeRetrospectiveEntry();
                    }
                }
            })
            .state('search.patientsearch', {
                url: '/:configName/patient/search',
                views: {
                    'patientSearchPage-header': {
                        templateUrl: '../common/ui-helper/header.html',
                        controller: 'PatientListHeaderController'
                    },
                    'patientSearchPage-content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    }
                },
                resolve:{
                    initializeConfigs: function (initialization, $stateParams) {
                        $stateParams.configName = $stateParams.configName || Bahmni.Clinical.Constants.defaultExtensionName;
                        patientSearchBackLink.state = 'search.patientsearch({configName: \"' + $stateParams.configName + '\"})';
                        return initialization($stateParams.configName);
                    }
                }
            })
            .state('patient', {
                url: '/:configName/patient/:patientUuid?encounterUuid',
                abstract: true,
                data: {
                    backLinks: [patientSearchBackLink]
                },
                views: {
                    'content': {
                        template: '<div ui-view="content"></div>',
                        controller: function ($scope, patientContext) {
                            $scope.patient = patientContext.patient;
                        }
                    }
                },
                resolve: {
                    initialization: function (initialization, $stateParams) {
                        $stateParams.configName = $stateParams.configName || Bahmni.Clinical.Constants.defaultExtensionName;
                        patientSearchBackLink.state = 'search.patientsearch({configName: \"' + $stateParams.configName + '\"})';
                        return initialization($stateParams.configName);
                    },
                    patientContext: function (initialization, patientInitialization, $stateParams) {
                        return patientInitialization($stateParams.patientUuid);
                    }
                }
            })
            .state('patient.dashboard', {
                abstract : true,
                views: {
                    'content': {
                        template: '<div ui-view="dashboard-header"></div> <div ui-view="dashboard-content"></div>' +
                                    '<patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel" consultation="consultation"/>',
                        controller: function($scope, visitHistory, consultationContext){
                            $scope.visitHistory = visitHistory;
                            $scope.consultation = consultationContext;
                            $scope.lastConsultationTabUrl = {url : undefined};
                        }
                    }
                },
                resolve: {
                    visitHistory: function (visitHistoryInitialization, $stateParams) {
                        return visitHistoryInitialization($stateParams.patientUuid);
                    },
                    retrospectiveIntialization: function(retrospectiveEntryService){
                        return retrospectiveEntryService.initializeRetrospectiveEntry();
                    },
                    consultationContext: function (consultationInitialization, initialization, $stateParams) {
                        return consultationInitialization($stateParams.patientUuid, $stateParams.encounterUuid, $stateParams.programUuid);
                    },
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
            .state('patient.dashboard.show', {
                url: '/dashboard?programUuid,dateEnrolled,dateCompleted',
                params: {
                    dashboardCachebuster: null
                },
                views: {
                    'dashboard-header': {
                        templateUrl: 'dashboard/views/clinicalDashboardHeader.html',
                        controller: 'ConsultationController'
                    },
                    'dashboard-content': {
                        templateUrl: 'dashboard/views/dashboard.html',
                        controller: 'PatientDashboardController'
                    }
                }
            })
            .state('patient.dashboard.show.observations', {
                url: '/concept-set-group/:conceptSetGroupName',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/conceptSet.html',
                        controller: 'ConceptSetPageController'
                    }
                }
            })
            .state('patient.dashboard.show.diagnosis', {
                url: '/diagnosis',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/diagnosis.html',
                        controller: 'DiagnosisController'
                    }
                }
            })
            .state('patient.dashboard.show.treatment', {
                abstract: true,
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/treatment.html'
                    }
                }
            })
            .state('patient.dashboard.show.treatment.page', {
                url: '/treatment',
                params: {
                  cachebuster: null
                },
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
                            activeDrugOrders: function (TreatmentService, $stateParams) {
                                return TreatmentService.getActiveDrugOrders($stateParams.patientUuid);
                            },
                            treatmentConfig: 'treatmentConfig'
                        }
                    }
                }
            })
            .state('patient.dashboard.show.disposition', {
                url: '/disposition',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/disposition.html',
                        controller: 'DispositionController'
                    }
                }

            })
            .state('patient.dashboard.show.summary', {
                url: '/consultation',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/consultation.html',
                        controller: 'ConsultationSummaryController'
                    }
                }
            })
            .state('patient.dashboard.show.orders', {
                url: '/orders',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/orders.html',
                        controller: 'OrderController'
                    }
                },
                resolve: {
                    allOrderables: function (ordersTabInitialization) {
                        return ordersTabInitialization();
                    }
                }
            })
            .state('patient.dashboard.show.bacteriology', {
                url: '/bacteriology',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/bacteriology.html',
                        controller: 'BacteriologyController'
                    }
                },
                resolve: {
                    bacteriologyConceptSet: function (bacteriologyTabInitialization) {
                        return bacteriologyTabInitialization();
                    }
                }
            })
            .state('patient.dashboard.show.investigation', {
                url: '/investigation',
                params: {
                    cachebuster: null
                },
                views: {
                    'consultation-content': {
                        templateUrl: 'consultation/views/investigations.html',
                        controller: 'InvestigationController'
                    }
                }
            })
            .state('patient.visit', {
                abstract: true,
                views: {
                    'content': {
                        template: '<div ui-view="visit-content"></div>',
                        controller: function ($scope, visitHistory) {
                            $scope.visitHistory = visitHistory;
                        }
                    }
                },
                resolve: {
                    visitHistory: function (visitHistoryInitialization, $stateParams) {
                        return visitHistoryInitialization($stateParams.patientUuid);
                    }
                }
            })
            .state('patient.visit.summaryprint', {
                url: '/latest-prescription-print',
                views: {
                    'visit-content': {
                        controller: 'LatestPrescriptionPrintController'
                    }
                }
            })
            .state('patient.dashboard.visit', {
                url: '/dashboard/visit/:visitUuid/:tab',
                data: {
                    backLinks: [patientSearchBackLink]
                },
                views: {
                    'dashboard-header': {
                        templateUrl: 'common/views/visitHeader.html',
                        controller: 'VisitHeaderController'
                    },
                    'dashboard-content': {
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
            .state('patient.dahsboard.visit.tab', {
                url: '/:tab',
                data: {
                    backLinks: [patientSearchBackLink]
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
                        return visitSummaryInitialization($stateParams.visitUuid, $stateParams.tab);
                    },
                    visitConfig: function (initialization, visitTabConfig) {
                        return visitTabConfig.load();
                    }
                }
            })
            .state('patient.patientProgram', {
                abstract: true,
                views: {
                    'content': {
                        template: '<div ui-view="patientProgram-header"></div> <div ui-view="patientProgram-content"></div>'
                    }
                },
                resolve:{
                    retrospectiveIntialization: function(retrospectiveEntryService){
                        return retrospectiveEntryService.initializeRetrospectiveEntry();
                    }
                    //consultationContext: function (consultationInitialization, initialization, $stateParams) {
                    //    return consultationInitialization($stateParams.patientUuid, $stateParams.encounterUuid, $stateParams.programUuid);
                    //}
                }
            })
            .state('patient.patientProgram.show', {
                url: '/consultationContext',
                data: {
                    backLinks: [patientSearchBackLink]
                },
                views: {
                    'patientProgram-header': {
                        templateUrl: '../common/ui-helper/header.html',
                        controller: 'PatientListHeaderController'
                    },
                    'patientProgram-content': {
                        templateUrl: 'common/views/consultationContext.html',
                        controller: 'consultationContextController'
                    }
                }
            });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

        $bahmniTranslateProvider.init({app: 'clinical', shouldMerge: true});
    }]).run(['stateChangeSpinner', '$rootScope', function (stateChangeSpinner, $rootScope) {
        FastClick.attach(document.body);
        stateChangeSpinner.activate();

        $rootScope.$on('$stateChangeSuccess', function () {
            window.scrollTo(0, 0);
        });
    }]);

