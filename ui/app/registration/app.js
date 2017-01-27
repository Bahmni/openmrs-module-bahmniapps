'use strict';

angular
    .module('registration', ['ui.router', 'bahmni.registration', 'authentication', 'bahmni.common.config',
        'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.common.photoCapture', 'bahmni.common.obs',
        'bahmni.common.displaycontrol.observation', 'bahmni.common.i18n', 'bahmni.common.displaycontrol.custom',
        'bahmni.common.routeErrorHandler', 'bahmni.common.displaycontrol.pivottable', 'RecursionHelper', 'ngSanitize',
        'bahmni.common.uiHelper', 'bahmni.common.domain', 'ngDialog', 'pascalprecht.translate', 'ngCookies',
        'monospaced.elastic', 'bahmni.common.offline', 'bahmni.common.displaycontrol.hint', 'bahmni.common.attributeTypes',
        'bahmni.common.models', 'bahmni.common.uicontrols',
        'bahmni.common.displaycontrol.diagnosis'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/search');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|blob|chrome-extension):/);

        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif

        $stateProvider
            .state('search', {
                url: '/search',
                reloadOnSearch: false,
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'SearchPatientController'},
                    'content@search': {templateUrl: 'views/search.html'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('newpatient', {
                url: '/patient/new',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'CreatePatientController'},
                    'content@newpatient': {templateUrl: 'views/newpatient.html'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('patient', {
                url: '/patient/:patientUuid',
                abstract: true,
                views: {
                    'layout': {template: '<div ui-view="layout"></div>'}
                },
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialize: function (initialization, offlineDb) {
                        return initialization(offlineDb);
                    }
                }
            })
            .state('patient.edit', {
                url: '?serverError',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'EditPatientController'},
                    'content@patient.edit': {templateUrl: 'views/editpatient.html'},
                    'headerExtension@patient.edit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.visit', {
                url: '/visit',
                views: {
                    'layout': {templateUrl: 'views/layout.html', controller: 'VisitController'},
                    'content@patient.visit': {templateUrl: 'views/visit.html'},
                    'headerExtension@patient.visit': {template: '<div print-options></div>'}
                }
            })
            .state('patient.printSticker', {
                url: '/printSticker',
                views: {
                    'layout': {templateUrl: 'views/layout.html'},
                    'content@patient.printSticker': {templateUrl: 'views/notimplemented.html'}
                }
            });
        $bahmniTranslateProvider.init({app: 'registration', shouldMerge: true});
    }]).run(['$rootScope', '$templateCache', 'offlineService', 'schedulerService', '$bahmniCookieStore', 'locationService', 'messagingService', function ($rootScope, $templateCache, offlineService, schedulerService, $bahmniCookieStore, locationService, messagingService) {
        // Disable caching view template partials

        var loginLocationUuid = $bahmniCookieStore.get(Bahmni.Common.Constants.locationCookieName).uuid;
        locationService.getVisitLocation(loginLocationUuid).then(function (response) {
            if (response.data) {
                $rootScope.visitLocation = response.data.uuid;
            }
        });
        if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
            schedulerService.sync();
        }

        $rootScope.$on('$stateChangeStart', function () {
            messagingService.hideMessages("error");
        });
    }]);
