'use strict';

angular
    .module('bahmni.reports')
    .config(['$urlRouterProvider', '$stateProvider', '$httpProvider', function ($urlRouterProvider, $stateProvider, $httpProvider) {
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        $urlRouterProvider.otherwise('/dashboard');
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                views: {
                    'content': {
                        templateUrl: 'views/dashboard.html',
                        controller: 'DashboardController'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            });
    }]).run(function ($rootScope, $templateCache) {
//                debugUiRouter($rootScope);
//        Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });