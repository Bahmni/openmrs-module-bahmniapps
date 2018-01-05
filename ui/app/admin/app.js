'use strict';

angular.module('admin', ['httpErrorInterceptor', 'bahmni.admin', 'bahmni.common.routeErrorHandler', 'ngSanitize',
    'bahmni.common.uiHelper', 'bahmni.common.config', 'bahmni.common.orders', 'bahmni.common.i18n', 'pascalprecht.translate',
    'ngCookies', 'angularFileUpload', 'bahmni.common.services']);
angular.module('admin')
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', '$compileProvider', '$bahmniTranslateProvider',
        function ($stateProvider, $httpProvider, $urlRouterProvider, $compileProvider, $bahmniTranslateProvider) {
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
            }).state('admin.auditLog', {
                url: '/auditLog',
                templateUrl: 'views/auditLog.html',
                controller: 'auditLogController',
                data: {
                    backLinks: [{label: "Home", state: "admin.dashboard", icon: "fa-home"}]
                }
            });
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
            $bahmniTranslateProvider.init({app: 'admin', shouldMerge: true});
        }
    ]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
        moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
        // Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', $templateCache.removeAll);
    }]);
