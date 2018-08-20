'use strict';

angular.module('ipd', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.ipd', 'bahmni.common.domain', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload', 'monospaced.elastic']);
angular.module('ipd').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/home');

        var homeBackLink = {type: "link", name: "Home", value: "../home/", accessKey: "h", icon: "fa-home"};
        var admitLink = {type: "state", name: "ADMIT_HOME_KEY", value: "home", accessKey: "a"};
        var bedManagementLink = {type: "state", name: "BED_MANAGEMENT_KEY", value: "bedManagement", accessKey: "b"};
        var navigationLinks = [admitLink, bedManagementLink];

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
                        controller: function ($scope, appService) {
                            $scope.isBedManagementEnabled = appService.getAppDescriptor().getConfig("isBedManagementEnabled").value;
                        }
                    },
                    'additional-header': {
                        templateUrl: ' views/header.html',
                        controller: 'HeaderController'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('bedManagement', {
                url: '/bedManagement',
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
                        templateUrl: 'views/bedManagement.html',
                        controller: 'BedManagementController'
                    },
                    'additional-header': {
                        templateUrl: 'views/header.html',
                        controller: 'HeaderController'
                    }
                },
                resolve: {
                    initialization: 'initialization',
                    init: function ($rootScope) {
                        $rootScope.patient = undefined;
                        $rootScope.bedDetails = undefined;
                    }
                }
            })
            .state('bedManagement.bed', {
                url: '/bed/:bedId',
                templateUrl: 'views/bedManagement.html',
                controller: 'BedManagementController',
                params: {
                    dashboardCachebuster: null,
                    context: null
                },
                resolve: {
                    bedResolution: function ($stateParams, bedInitialization, patientInitialization) {
                        return bedInitialization($stateParams.bedId).then(function (response) {
                            if (response.patients.length) {
                                return patientInitialization(response.patients[0].uuid);
                            }
                        });
                    }
                }
            })
            .state('bedManagement.patient', {
                url: '/patient/:patientUuid',
                templateUrl: 'views/bedManagement.html',
                controller: 'BedManagementController',
                resolve: {
                    patientResolution: function ($stateParams, bedInitialization, patientInitialization) {
                        return patientInitialization($stateParams.patientUuid).then(function () {
                            return bedInitialization(undefined, $stateParams.patientUuid);
                        });
                    }
                }
            }).state('dashboard', {
                url: '/patient/:patientUuid/visit/:visitUuid/dashboard',
                data: {
                    homeBackLink: homeBackLink,
                    navigationLinks: navigationLinks
                },
                views: {
                    'content': {
                        templateUrl: 'views/dashboard.html',
                        controller: 'AdtController'
                    },
                    'additional-header': {
                        templateUrl: ' views/header.html',
                        controller: 'HeaderController'
                    }
                },
                resolve: {
                    initialization: 'initialization',
                    patientResolution: function ($stateParams, bedInitialization, patientInitialization) {
                        return patientInitialization($stateParams.patientUuid).then(function () {
                            return bedInitialization(undefined, $stateParams.patientUuid);
                        });
                    }
                }
            });

        $bahmniTranslateProvider.init({app: 'ipd', shouldMerge: true});
    }]);
