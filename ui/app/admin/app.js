'use strict';

angular.module('admin', ['httpErrorInterceptor', 'bahmni.admin', 'bahmni.common.routeErrorHandler', 'ngSanitize',
    'bahmni.common.uiHelper', 'bahmni.common.config', 'bahmni.common.orders', 'bahmni.common.i18n', 'pascalprecht.translate',
    'ngCookies', 'angularFileUpload', 'bahmni.common.offline', 'bahmni.common.services']);
angular.module('admin')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$compileProvider',
        function ($stateProvider, $httpProvider, $urlRouterProvider, $compileProvider) {
            $urlRouterProvider.otherwise('/dashboard');
            $stateProvider.state('admin', {
                abstract: true,
                template: '<ui-view/>',
                resolve: {
                    initialize: 'initialization'
                }
            }).state('admin.dashboard', {
                url: '/dashboard',
                templateUrl: 'views/adminDashboard.html',
                controller: 'AdminDashboardController',
                data: {
                    backLinks: [{label: "Home", accessKey: "h", url: "../home/", icon: "fa-home"}],
                    extensionPointId: 'org.bahmni.admin.dashboard'
                }
            }).state('admin.csv', {
                url: '/csv',
                templateUrl: 'views/csvupload.html',
                controller: 'CSVUploadController',
                data: {
                    backLinks: [{label: "Home", state: "admin.dashboard", icon: "fa-home"}]
                }
            }).state('admin.csvExport', {
                url: '/csvExport',
                templateUrl: 'views/csvexport.html',
                controller: 'CSVExportController',
                data: {
                    backLinks: [{label: "Home", state: "admin.dashboard", icon: "fa-home"}]
                }
            }).state('admin.orderSetDashboard', {
                url: '/ordersetdashboard',
                templateUrl: 'views/orderSetDashboard.html',
                controller: 'OrderSetDashboardController',
                data: {
                    backLinks: [{label: "Home", state: "admin.dashboard", icon: "fa-home"}]
                }
            }).state('admin.orderSet', {
                url: '/orderset/:orderSetUuid',
                templateUrl: 'views/orderSet.html',
                data: {
                    backLinks: [{label: "Home", state: "admin.orderSetDashboard", icon: "fa-users"}]
                }
            });
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        }
    ]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
        // Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', $templateCache.removeAll);
    }]);
