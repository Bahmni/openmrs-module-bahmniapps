'use strict';

angular
    .module('bahmni.reports')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', '$bahmniTranslateProvider', function ($urlRouterProvider, $stateProvider, $httpProvider, $bahmniTranslateProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
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
                    initialization: 'initialization'
                }
            });
        $bahmniTranslateProvider.init({app: 'reports', shouldMerge: true});
    }]).run(function ($rootScope, $templateCache) {
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        );
    });