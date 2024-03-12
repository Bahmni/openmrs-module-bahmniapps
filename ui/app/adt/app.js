'use strict';

angular.module('adt', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.adt', 'bahmni.common.domain', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler', 'bahmni.common.i18n',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.conditionsList', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails', 'bahmni.common.displaycontrol.custom',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis', 'RecursionHelper', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.displaycontrol.navigationlinks', 'pascalprecht.translate',
    'bahmni.common.displaycontrol.dashboard', 'ngCookies', 'ngDialog', 'angularFileUpload']);
angular.module('adt').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$bahmniTranslateProvider', '$compileProvider',
    function ($stateProvider, $httpProvider, $urlRouterProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/home');
        var homeBackLink = {label: "", url: "../home/", accessKey: "h", icon: "fa-home", id: "homeBackLink"};
        var adtHomeBackLink = {label: "", url: "#/home", accessKey: "p", icon: "fa-users", id: "adtHomeBackLink" };

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
                backLinks: [homeBackLink]
            },
            views: {
                'content': {
                    templateUrl: 'views/home.html',
                    controller: function ($rootScope, $scope, appService) {
                        $scope.showCareViewDashboard = false;
                        $scope.openCareView = function () {
                            $scope.showCareViewDashboard = true;
                        };
                        $scope.hostData = {
                            provider: $rootScope.currentProvider
                        };
                        $scope.hostApi = {
                            onHome: function () {
                                $scope.showCareViewDashboard = false;
                                $scope.$apply();
                            }
                        };
                        $scope.isBedManagementEnabled = appService.getAppDescriptor().getConfig("isBedManagementEnabled").value;
                        $scope.enableIPDFeature = appService.getAppDescriptor().getConfigValue('enableIPDFeature');
                    }
                },
                'wards@home': {
                    templateUrl: 'views/wards.html',
                    controller: 'WardsController'
                },
                'additional-header': {
                    templateUrl: 'views/headerAdt.html'
                }
            },
            resolve: {
                initialization: 'initialization'
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
                    templateUrl: 'views/headerAdt.html',
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
        })
        .state('patient.adt', {
            url: '/visit/:visitUuid',
            abstract: true,
            template: '<ui-view/>'
        })
        .state('patient.adt.action', {
            url: '/:action',
            templateUrl: 'views/dashboard.html',
            controller: 'AdtController'
        })
        .state('patient.adt.bedForExistingEncounter', {
            url: '/encounter/:encounterUuid/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        })
        .state('patient.adt.bedForNewEncounter', {
            url: '/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        });

        $bahmniTranslateProvider.init({app: 'adt', shouldMerge: true});
    }]).run(['$window', function ($window) {
        moment.locale($window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
    }]);
