'use strict';

angular.module('ot', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.ot', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.uicontrols.programmanagment', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload', 'monospaced.elastic', 'dndLists', 'bahmni.common.services']);
angular.module('ot').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/home');

        var homeBackLink = {type: "link", name: "Home", value: "../home/", accessKey: "h", icon: "fa-home"};
        var otSchedulingLink = {type: "state", name: "OT_SCHEDULING_KEY", value: "otScheduling", accessKey: "b"};
        var queuesLink = {type: "state", name: "OT_SURGICAL_QUEUES_KEY", value: "home", accessKey: "b"};
        var navigationLinks = [queuesLink, otSchedulingLink];

        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif

        $stateProvider
            .state('home', {
                url: '/home',
                data: {
                    homeBackLink: homeBackLink,
                    navigationLinks: navigationLinks
                },
                views: {
                    'additional-header': {
                        templateUrl: 'views/header.html'
                    },
                    'content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('otScheduling', {
                url: '/otScheduling',
                data: {
                    homeBackLink: homeBackLink,
                    navigationLinks: navigationLinks
                },
                params: {
                    viewDate: null
                },
                views: {
                    'content': {
                        templateUrl: 'views/home.html',
                        controller: 'calendarViewController'
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html'
                    }
                },
                resolve: {
                    initialization: "initialization"
                }
            })
            .state('newSurgicalAppointment', {
                url: '/surgicalblock/new',
                data: {
                    homeBackLink: homeBackLink,
                    navigationLinks: navigationLinks
                },
                params: {
                    dashboardCachebuster: null,
                    context: null
                },
                views: {
                    'content': {
                        templateUrl: 'views/surgicalBlock.html',
                        controller: 'surgicalBlockController'
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html'
                    }
                },
                resolve: {
                    initialization: "initialization"
                }
            })
            .state('editSurgicalAppointment', {
                url: '/surgicalblock/:surgicalBlockUuid/edit',
                data: {
                    homeBackLink: homeBackLink,
                    navigationLinks: navigationLinks
                },
                params: {
                    dashboardCachebuster: null,
                    surgicalAppointmentId: null
                },
                views: {
                    'content': {
                        templateUrl: 'views/surgicalBlock.html',
                        controller: 'surgicalBlockController'
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html'
                    }
                },
                resolve: {
                    initialization: "initialization"
                }
            });

        $bahmniTranslateProvider.init({app: 'ot', shouldMerge: true});
    }]);
