'use strict';

angular
    .module('bahmni.reports')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', '$compileProvider',
        function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider , $compileProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;

        $urlRouterProvider.otherwise('/dashboard');
        // @if DEBUG='production'
        $compileProvider.debugInfoEnabled(false);
        // @endif

        // @if DEBUG='development'
        $compileProvider.debugInfoEnabled(true);
        // @endif
        $stateProvider
            .state('dashboard', {
                url: '/dashboard?appName',
                views: {
                    'additional-header': {
                        templateUrl: 'views/dashboardHeader.html'
                    },
                    'content': {
                        templateUrl: 'views/dashboard.html',
                        controller: 'DashboardController'
                    }
                },
                data: {
                    backLinks: [
                        {label: "Home", url: "../home/", accessKey: "h", icon: "fa-home"}
                    ]
                },
                resolve: {
                    initializeConfig: function(initialization, $stateParams) {
                        return initialization($stateParams.appName);
                    }
                }
            });

            var getAppName = function(){
                var val = location.hash.indexOf("appName=");
                   return location.hash.substr(val).split("&")[0].split("=")[1] || 'reports';
            };

        $bahmniTranslateProvider.init({app: getAppName(), shouldMerge: true});
    }]).run(function ($rootScope, $templateCache) {
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        );
    });