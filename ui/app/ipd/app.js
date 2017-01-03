'use strict';

angular.module('ipd', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.ipd', 'bahmni.common.domain', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload', 'bahmni.common.offline']);
angular.module('ipd').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/admit');
        var homeBackLink = {label: "", url: "../home/", accessKey: "h", icon: "fa-home", id: "homeBackLink"};
        var adtHomeBackLink = {label: "", url: "#/admit", accessKey: "p", icon: "fa-users", id: "adtHomeBackLink"};
        var admitBackLink = {text: "New Admission", state: "admit", accessKey: "a"};
        var bedManagementBackLink = {text: "Bed Management", state: "bedManagement", accessKey: "b"};
        var backLinks = [homeBackLink, admitBackLink, bedManagementBackLink];

        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif

        $stateProvider
            .state('admit', {
                url: '/admit',
                data: {
                    backLinks: backLinks
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
                    backLinks: backLinks
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
            .state('bedManagement.patientAdmit', {
                url: '/patient/:patientUuid/visit/:visitUuid/admit',
                templateUrl: 'views/bedManagement.html',
                controller: 'BedManagementController',
                resolve: {
                    patientResolution: function ($stateParams, bedInitialization, patientInitialization) {
                        return patientInitialization($stateParams.patientUuid).then(function () {
                            return bedInitialization(undefined, $stateParams.patientUuid);
                        });
                    }
                }
            })
            .state('bedManagement.patientTransfer', {
                url: '/patient/:patientUuid/visit/:visitUuid/transfer',
                templateUrl: 'views/bedManagement.html',
                controller: 'BedManagementController',
                resolve: {
                    patientResolution: function ($stateParams, bedInitialization, patientInitialization) {
                        return patientInitialization($stateParams.patientUuid).then(function () {
                            return bedInitialization(undefined, $stateParams.patientUuid);
                        });
                    }
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                data: {
                    backLinks: [homeBackLink, adtHomeBackLink]
                },
                abstract: true,
                views: {
                    'header': {
                        templateUrl: 'views/header.html',
                        controller: function ($scope) {
                            $scope.showClinicalDashboardLink = true;
                        }
                    },
                    'content': {
                        template: '<ui-view/>'
                    },
                    'additional-header': {
                        templateUrl: '../common/patient/header/views/header.html'
                    }
                },

                resolve: {
                    patientResolution: function ($stateParams, patientInitialization) {
                        return patientInitialization($stateParams.patientUuid);
                    }
                }
            });

        $bahmniTranslateProvider.init({app: 'ipd', shouldMerge: true});
    }]);
