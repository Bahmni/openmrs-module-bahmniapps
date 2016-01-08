'use strict';

angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
    'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies', 'bahmni.common.offline'])
    .config(['$urlRouterProvider', '$stateProvider','$httpProvider', '$bahmniTranslateProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
    .state('dashboard',
    {   url: '/dashboard',
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController',
        data: {extensionPointId: 'org.bahmni.home.dashboard'},
        resolve: {
            initialize: function(dashboardInitialization) {
                return dashboardInitialization();
            }
        }
    }).state('login',
    {   url: '/login?showLoginMessage',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        resolve: {
            initialData: 'loginInitialization'
        }
    }).state('device',
    {  url: "/device/:deviceType",
        controller: function($stateParams,$rootScope,$state){
            if($stateParams.deviceType === 'chrome-app'){
               $rootScope.loginDevice = $stateParams.deviceType;
            }
            $state.go('dashboard');
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
