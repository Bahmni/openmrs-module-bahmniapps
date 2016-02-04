'use strict';

angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
    'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies', 'bahmni.common.offline'])
    .config(['$urlRouterProvider', '$stateProvider','$httpProvider', '$bahmniTranslateProvider', '$compileProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
        $stateProvider
    .state('dashboard',
    {   url: '/dashboard',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        data: {extensionPointId: 'org.bahmni.home.dashboard'},
        resolve: {
            initialize: function(initialization) {
                return initialization();
            },
            offlineDb: function(offlineDbInitialization) {
                return offlineDbInitialization();
            },
            offlineSyncInitialization: function(offlineSyncInitialization, offlineDb){
                return offlineSyncInitialization(offlineDb);
            }
        }
    }).state('login',
    {   url: '/login?showLoginMessage',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        resolve: {
            initialData: 'loginInitialization'
        }
    }).state('offline',
        {   url: '/',
            templateUrl: '../index.html'
    }).state('device',
    {  url: "/device/:deviceType",
        controller: function($stateParams,$rootScope,$state, offlineService){
            if($stateParams.deviceType === 'chrome-app' || $stateParams.deviceType === 'android'){
                offlineService.setAppPlatform($stateParams.deviceType);
            }
            $rootScope.loginDevice = $stateParams.deviceType;
            $state.go('login');
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
