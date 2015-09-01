'use strict';

angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
    'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies'])
    .config(['$urlRouterProvider', '$stateProvider','$httpProvider', '$bahmniTranslateProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
    .state('dashboard',
    {   url: '/dashboard',
        templateUrl: '../common/ui-helper/views/dashboard.html',
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
    });
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    $bahmniTranslateProvider.init('home');

}]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
            $templateCache.removeAll();
        });
    });
