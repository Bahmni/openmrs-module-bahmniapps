'use strict';

angular.module('dhis', ['httpErrorInterceptor', 'bahmni.common.uiHelper', 'bahmni.common.i18n', 'bahmni.dhis', 'ngSanitize', 'bahmni.common.routeErrorHandler', 'ngCookies']).config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
        .state('dhis', {
            abstract: true,
            template: '<ui-view/>',
            resolve: {
                initialize: 'initialization'
            }
        })
        .state('dhis.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/dhisDashboard.html',
            controller: 'DhisDashboardController',
            data: {
                extensionPointId: 'org.bahmni.dhis.dashboard',
                backLinks: [
                    {label: "Home", url: "../home/", icon: "fa-home"}
                ]
            }
        })
        .state('dhis.report', {
            url: '/report/:taskId',
            templateUrl: 'views/report.html',
            controller: 'ReportController',
            data: {
                backLinks: [
                    {label: "DHIS Dashboard", state: "dhis.dashboard"}
                ]
            }
        });

    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    // $bahmniTranslateProvider.init({app: 'dhis', shouldMerge: true});
}]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
            $templateCache.removeAll();
        }
    )
});