'use strict';

angular
    .module('bahmni.reports')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider, $compileProvider) {
            $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

            $urlRouterProvider.otherwise('/dashboard/reports');
            $urlRouterProvider.when('/dashboard', '/dashboard/reports');
        // @if DEBUG='production'
            $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
            $compileProvider.debugInfoEnabled(true);
        // @endif
            $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                abstract: true,
                views: {
                    'additional-header': {
                        templateUrl: 'views/dashboardHeader.html',
                        controller: 'DashboardHeaderController'
                    },
                    'mainContent': {
                        template: '<div class="opd-wrapper">' +
                        '<div ui-view="content" class="opd-content-wrapper"></div>' +
                        '</div>'
                    }
                },
                data: {
                    backLinks: []
                },
                resolve: {
                    initializeConfig: function (initialization, $stateParams) {
                        return initialization($stateParams.appName);
                    }
                }
            }).state('dashboard.reports', {
                url: '/reports?appName',
                views: {
                    'content': {
                        templateUrl: 'views/reports.html',
                        controller: 'ReportsController'
                    }
                }
            }).state('dashboard.myReports', {
                url: '/myReports?appName',
                views: {
                    'content': {
                        templateUrl: 'views/myReports.html',
                        controller: 'MyReportsController'
                    }
                }
            });

            var getAppName = function () {
                var val = location.hash.indexOf("appName=");
                return location.hash.substr(val).split("&")[0].split("=")[1] || 'reports';
            };

            $bahmniTranslateProvider.init({app: getAppName(), shouldMerge: true});
        }]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
            moment.locale(window.localStorage["NG_TRANSLATE_LANG_KEY"] || "en");
            $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        );
        }]);
