'use strict';


angular
    .module('bahmnihome', ['http-auth-interceptor', 'httpErrorInterceptor', 'infrastructure'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/login', 
            { 
                templateUrl: 'modules/auth/views/login.html', 
                controller: 'LoginController'
            });
        $routeProvider.when('/dashboard', 
            {
                templateUrl: 'modules/dashboard/views/dashboard.html', 
                controller: 'DashboardController'
            });
        $routeProvider.otherwise({redirectTo: '/login'});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });
