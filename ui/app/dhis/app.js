'use strict';

angular.module('dhis', ['httpErrorInterceptor', 'bahmni.dhis']).config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider.state('dhis', {
        abstract: true,
        template: '<ui-view/>',
        resolve: {
            initialize: 'initialization' }
        })
        .state('dhis.dashboard',
        {   url: '/dashboard',
            templateUrl: 'views/dhisDashboard.html',
            controller: 'DhisDashboardController',
            data: {extensionPointId: 'org.bahmni.dhis.dashboard'}
        })
        .state('dhis.report',
        {   url: '/report/:taskId',
            templateUrl: 'views/report.html',
            controller: 'ReportController'
        });

    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

}]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
            $templateCache.removeAll();
        }
    )
});