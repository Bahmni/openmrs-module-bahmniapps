'use strict';

angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
        'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies', 'bahmni.common.offline',
          'bahmni.common.models'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/dashboard');

        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|file):/);

        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif
        $stateProvider
            .state('dashboard',
                {
                    url: '/dashboard',
                    templateUrl: 'views/dashboard.html',
                    controller: 'DashboardController',
                    data: {extensionPointId: 'org.bahmni.home.dashboard'},
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        initialize: function (initialization, offlineConfigInitialization) {
                            return initialization(offlineConfigInitialization);
                        },
                        offlineSyncInitialization: function (offlineSyncInitialization, offlineDb, offlineReferenceDataInitialization) {
                            return offlineSyncInitialization(offlineDb, offlineReferenceDataInitialization);
                        },
                        offlineConfigInitialization: function(offlineConfigInitialization, offlineSyncInitialization){
                            return offlineConfigInitialization(offlineSyncInitialization)
                        },
                        offlineReferenceDataInitialization: function(offlineReferenceDataInitialization, offlineDb){
                            return offlineReferenceDataInitialization(offlineDb, true);
                        },
                        offlinePush: function(offlinePush, offlineDb, offlineSyncInitialization){
                            return offlinePush(offlineDb);
                        }
                    }
                }).state('login',
            {
                url: '/login?showLoginMessage',
                templateUrl: 'views/login.html',
                controller: 'LoginController',
                resolve: {
                    offlineDb: function (offlineDbInitialization) {
                        return offlineDbInitialization();
                    },
                    initialData: function(loginInitialization,referenceDataDbService, offlineDb){
                        referenceDataDbService.init(offlineDb);
                        return loginInitialization()
                    }
                }
            });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $bahmniTranslateProvider.init({app: 'home', shouldMerge: true});

    }]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
        $templateCache.removeAll();
    });
});
