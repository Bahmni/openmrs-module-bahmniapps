'use strict';

angular.module('bahmni.offline', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.i18n', 'bahmni.common.uiHelper', 'bahmni.common.util',
        'bahmni.common.appFramework', 'bahmni.common.logging', 'bahmni.common.routeErrorHandler', 'pascalprecht.translate', 'ngCookies'])
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
            .state('dashboard',
                {
                    url: '/dashboard',
                    templateUrl: 'views/dashboard.html',
                    controller: 'DashboardController'
                });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

    }]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
        $templateCache.removeAll();
    });
});
