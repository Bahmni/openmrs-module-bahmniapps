'use strict';

angular.module('admin', ['httpErrorInterceptor', 'bahmni.admin', 'bahmni.common.routeErrorHandler', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.config',  'bahmni.common.i18n', 'pascalprecht.translate', 'ngCookies', 'angularFileUpload', 'bahmni.common.offline'])
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/dashboard');
    $stateProvider.state('admin', {
        abstract: true,
        template: '<ui-view/>',
        resolve: {
            initialize: 'initialization'
        }
    }).state('admin.dashboard',
        {   url: '/dashboard',
            templateUrl: 'views/adminDashboard.html',
            controller: 'AdminDashboardController',
            data: {
                backLinks: [{label: "Home", accessKey: "h", url: "../home/", icon: "fa-home"}],
                extensionPointId: 'org.bahmni.admin.dashboard'
            }
        })
        .state('admin.csv',
        {   url: '/csv',
            templateUrl: 'views/csvupload.html',
            controller: 'CSVUploadController'

        })
        .state('admin.csvExport',
        {   url: '/csvExport',
            templateUrl: 'views/csvexport.html',
            controller: 'CSVExportController'

        })
        .state('admin.formBuilder',
        {   url: '/formBuilder',
            templateUrl: 'views/formBuilder.html',
            controller: ''
        })
        .state('admin.formIndex',
        {   url: '/formIndex',
            templateUrl: 'views/formIndex.html',
            controller: ''
        });
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    // $bahmniTranslateProvider.init({app: 'admin', shouldMerge: true});
}]).
    run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });