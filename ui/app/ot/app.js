'use strict';

angular.module('ot', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.ot', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload', 'bahmni.common.offline']);
angular.module('ot').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/home');

        var homeBackLink = {type: "link", name: "Home", value: "../home/", accessKey: "h", icon: "fa-home"};
        var otSchedulingLink = {type: "state", name: "OT Scheduling", value: "home", accessKey: "b"};
        var navigationLinks = [otSchedulingLink];

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
                    'content': {
                        templateUrl: 'views/home.html',
                        controller: function ($scope) {
                        }
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    }
                },
                resolve: {
                    initialization: "initialization",
                    init: function ($rootScope) {
                        $rootScope.isHome = true;
                    }
                }
            })
            .state('newSurgicalAppointment', {
                url: '/appointment/new',
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
                        templateUrl: 'views/newSurgicalAppointment.html',
                        controller: 'surgicalAppointmentController'
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    }
                },
                resolve: {
                    initialization: "initialization",
                    init: function ($rootScope) {
                        $rootScope.isHome = false;
                    }
                }
            });

        $bahmniTranslateProvider.init({app: 'ot', shouldMerge: true});
    }]);
