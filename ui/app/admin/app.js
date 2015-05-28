'use strict';

angular.module('admin', ['httpErrorInterceptor', 'bahmni.admin', 'bahmni.common.routeErrorHandler', 'ngSanitize', 'bahmni.common.uiHelper', 'bahmni.common.config'])
    .config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider.state('admin', {
            abstract: true,
            template: '<ui-view/>',
            resolve: {
                initialize: 'initialization'
            }
        }).state('admin.dashboard',
            {
                url: '/dashboard',
                templateUrl: 'views/adminDashboard.html',
                controller: 'AdminDashboardController',
                data: {
                    backLinks: [{label: "Home", url: "../home/", icon: "fa-home"}],
                    extensionPointId: 'org.bahmni.admin.dashboard'
                }
            })
            .state('admin.csv',
            {
                url: '/csv',
                templateUrl: 'views/csvupload.html',
                controller: 'CSVUploadController'

            })
            .state('admin.csvExport',
            {
                url: '/csvExport',
                templateUrl: 'views/csvexport.html',
                controller: 'CSVExportController'

            })
            .state('admin.configEditor', {
                url: '/configEditor',
                templateUrl: 'views/adminDashboard.html',
                controller: function ($scope, appConfigService) {
                    appConfigService.getAllAppNames().then(function (appNames) {
                        $scope.appExtensions = appNames.data.map(appConfigService.makeExtension);
                    })
                }
            })
            .state('admin.appConfigs', {
                url: '/configEditor/:appName',
                templateUrl: 'views/adminDashboard.html',
                controller: function ($scope, appConfigService, appNameInit) {
                    appConfigService.getAllConfigs(appNameInit).then(function (configs) {
                        $scope.appExtensions = configs.data.map(appConfigService.makeExtension);
                    })
                },
                resolve: {
                    appNameInit: function ($stateParams) {
                        return $stateParams.appName;
                    }
                }
            })
            .state('admin.appConfig', {
                url: '/configEditor/:appName/:configName',
                templateUrl: 'views/configEditor.html',
                controller: "ConfigEditorController",
                resolve: {
                    appNameInit: function ($stateParams) {
                        return $stateParams.appName;
                    },
                    configNameInit: function ($stateParams) {
                        return $stateParams.configName;
                    }
                }
            });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).
    run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });