'use strict';

angular.module('consultation', ['ui.router', 'bahmni.clinical', 'bahmni.common.config', 'bahmni.common.patient',
    'bahmni.common.uiHelper', 'bahmni.common.patientSearch', 'bahmni.common.obs', 'bahmni.common.i18n',
    'bahmni.common.domain', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'bahmni.common.displaycontrol.documents', 'bahmni.common.displaycontrol.observation',
    'bahmni.common.displaycontrol.pivottable', 'bahmni.common.displaycontrol.dashboard', 'bahmni.common.gallery',
    'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.custom', 'bahmni.common.displaycontrol.admissiondetails',
    'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.disposition',
    'httpErrorInterceptor', 'pasvaz.bindonce', 'infinite-scroll', 'bahmni.common.util', 'ngAnimate', 'ngDialog',
    'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'bahmni.common.displaycontrol.conditionsList', 'RecursionHelper', 'ngSanitize',
    'bahmni.common.orders', 'bahmni.common.displaycontrol.orders', 'bahmni.common.displaycontrol.prescription',
    'bahmni.common.displaycontrol.navigationlinks', 'bahmni.common.displaycontrol.programs',
    'bahmni.common.displaycontrol.pacsOrders', 'bahmni.common.uicontrols', 'bahmni.common.uicontrols.programmanagment', 'pascalprecht.translate',
    'ngCookies', 'monospaced.elastic', 'bahmni.common.bacteriologyresults', 'bahmni.common.displaycontrol.bacteriologyresults',
    'bahmni.common.displaycontrol.obsVsObsFlowSheet', 'bahmni.common.displaycontrol.chronicTreatmentChart',
    'bahmni.common.displaycontrol.forms', 'bahmni.common.displaycontrol.drugOrderDetails',
    'bahmni.common.displaycontrol.hint', 'bahmni.common.displaycontrol.drugOrdersSection', 'bahmni.common.attributeTypes',
    'bahmni.common.services', 'bahmni.common.models']);
angular.module('consultation')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
            $urlRouterProvider.otherwise('/' + Bahmni.Clinical.Constants.defaultExtensionName + '/patient/search');
            var patientSearchBackLink = {
                label: "",
                state: "search.patientsearch",
                accessKey: "p",
                id: "patients-link",
                icon: "fa-users"
            };
            var homeBackLink = {label: "", url: "../home/index.html", accessKey: "h", icon: "fa-home"};

        // @if DEBUG='production'
            $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
            $compileProvider.debugInfoEnabled(true);
        // @endif

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
                    retrospectiveIntialization: function (retrospectiveEntryService) {
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
                resolve: {
                    initializeConfigs: function (initialization, $stateParams) {
                        $stateParams.configName = $stateParams.configName || Bahmni.Clinical.Constants.defaultExtensionName;
                        patientSearchBackLink.state = 'search.patientsearch({configName: \"' + $stateParams.configName + '\"})';
                        return initialization($stateParams.configName);
                    }
                }
            })
            .state('patient', {
                url: '/:configName/patient/:patientUuid?encounterUuid,programUuid,enrollment',
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
                abstract: true,
                views: {
                    'content': {
                        template: '<div ui-view="dashboard-header"></div> <div ui-view="dashboard-content"></div>' +
                        '<patient-control-panel patient="patient" visit-history="visitHistory" visit="visit" show="showControlPanel" consultation="consultation"/>',
                        controller: function ($scope, visitHistory, consultationContext, followUpConditionConcept) {
                            $scope.visitHistory = visitHistory;
                            $scope.consultation = consultationContext;
                            $scope.followUpConditionConcept = followUpConditionConcept;
                            $scope.lastConsultationTabUrl = {url: undefined};
                        }
                    }
                },
                resolve: {
                    visitHistory: function (visitHistoryInitialization, $stateParams, $rootScope) {
                        return visitHistoryInitialization($stateParams.patientUuid, $rootScope.visitLocation);
                    },
                    retrospectiveIntialization: function (retrospectiveEntryService) {
                        return retrospectiveEntryService.initializeRetrospectiveEntry();
                    },
                    followUpConditionConcept: function (conditionsService) {
                        return conditionsService.getFollowUpConditionConcept().then(function (response) {
                            return response.data.results[0];
                        });
                    },
                    consultationContext: function (consultationInitialization, initialization, $stateParams, followUpConditionConcept) {
                        return consultationInitialization(
                            $stateParams.patientUuid, $stateParams.encounterUuid, $stateParams.programUuid, $stateParams.enrollment, followUpConditionConcept);
                    },
                    dashboardInitialization: function ($rootScope, initialization, patientContext, clinicalDashboardConfig, userService) {
                        return clinicalDashboardConfig.load().then(function () {
                            $rootScope.currentUser.addToRecentlyViewed(patientContext.patient, clinicalDashboardConfig.getMaxRecentlyViewedPatients());
                            return userService.savePreferences();
                        });
                    },
                    visitSummary: function (visitSummaryInitialization, initialization, visitHistory) {
                        return visitHistory.activeVisit ? visitSummaryInitialization(visitHistory.activeVisit.uuid) : null;
                    },
                    visitConfig: function (initialization, visitTabConfig) {
                        return visitTabConfig.load();
                    }
                }
            })
            .state('patient.dashboard.show', {
                url: '/dashboard?dateEnrolled,dateCompleted',
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
                    cachebuster: null,
                    lastOpenedTemplate: null
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
                params: {
                    tabConfigName: null
                },
                resolve: {
                    treatmentConfig: function (initialization, treatmentConfig, $stateParams) {
                        return treatmentConfig($stateParams.tabConfigName);
                    }
                },
                views: {
                    'consultation-content': {
                        controller: 'TreatmentController',
                        templateUrl: 'consultation/views/treatment.html'
                    }
                }
            })
            .state('patient.dashboard.show.treatment.page', {
                url: "/treatment?tabConfigName",
                params: {
                    cachebuster: null
                },
                resolve: {
                    activeDrugOrders: function (treatmentService, $stateParams) {
                        return treatmentService.getActiveDrugOrders($stateParams.patientUuid, $stateParams.dateEnrolled, $stateParams.dateCompleted);
                    }
                },
                views: {
                    "addTreatment": {
                        controller: 'AddTreatmentController',
                        templateUrl: 'consultation/views/treatmentSections/addTreatment.html',
                        resolve: {
                            treatmentConfig: 'treatmentConfig'
                        }
                    },
                    "defaultHistoryView": {
                        controller: 'DrugOrderHistoryController',
                        templateUrl: 'consultation/views/treatmentSections/drugOrderHistory.html'
                    },
                    "customHistoryView": {
                        controller: 'CustomDrugOrderHistoryController',
                        templateUrl: 'consultation/views/treatmentSections/customDrugOrderHistory.html'
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
                    }
                }
            })
            .state('patient.dashboard.visitPrint', {
                url: '/dashboard/visit/:visitUuid/:tab/:print',
                views: {
                    'dashboard-content': {
                        template: '<div>Print is getting ready</div>',
                        controller: 'VisitController'
                    },
                    'print-content': {
                        templateUrl: 'common/views/visit.html'
                    }
                },
                resolve: {
                    visitSummary: function (visitSummaryInitialization, $stateParams) {
                        return visitSummaryInitialization($stateParams.visitUuid);
                    }
                }
            })
            .state('patient.dashboard.observation', {
                url: '/dashboard/observation/:observationUuid',
                data: {
                    backLinks: [homeBackLink]
                },
                resolve: {
                    observation: function (observationsService, $stateParams) {
                        return observationsService.getRevisedObsByUuid($stateParams.observationUuid).then(function (results) {
                            return results.data;
                        });
                    }
                },
                views: {
                    'dashboard-header': {
                        templateUrl: '../common/ui-helper/header.html',
                        controller: 'PatientListHeaderController'
                    },
                    'dashboard-content': {
                        controller: function ($scope, observation, patientContext) {
                            $scope.observation = observation;
                            $scope.patient = patientContext.patient;
                        },
                        template: '<patient-context patient="patient"></patient-context>' +
                        '<edit-observation  observation="observation" concept-set-name="{{observation.concept.name}}" concept-display-name="{{observation.conceptNameToDisplay}}"></edit-observation>'
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
                        template: '<div ui-view="patientProgram-header"></div> <div ui-view="patientProgram-content" class="patientProgram-content-container"></div>'
                    }
                },
                resolve: {
                    retrospectiveIntialization: function (retrospectiveEntryService) {
                        return retrospectiveEntryService.initializeRetrospectiveEntry();
                    }
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
                },
                resolve: {
                    visitHistory: function (visitHistoryInitialization, $stateParams) {
                        return visitHistoryInitialization($stateParams.patientUuid);
                    }
                }
            });

            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

            $bahmniTranslateProvider.init({app: 'clinical', shouldMerge: true});
        }]).run(['stateChangeSpinner', '$rootScope', 'auditLogService',
            function (stateChangeSpinner, $rootScope, auditLogService) {
                moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
                FastClick.attach(document.body);
                stateChangeSpinner.activate();
                var cleanUpStateChangeSuccess = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
                    auditLogService.log(toParams.patientUuid, Bahmni.Clinical.StateNameEvenTypeMap[toState.name], undefined, "MODULE_LABEL_CLINICAL_KEY");
                    window.scrollTo(0, 0);
                });
                var cleanUpNgDialogOpened = $rootScope.$on('ngDialog.opened', function () {
                    $('html').addClass('ngdialog-open');
                });
                var cleanUpNgDialogClosing = $rootScope.$on('ngDialog.closing', function () {
                    $('html').removeClass('ngdialog-open');
                });

                $rootScope.$on("$destroy", function () {
                    cleanUpStateChangeSuccess();
                    cleanUpNgDialogOpened();
                    cleanUpNgDialogClosing();
                });
            }]);

