'use strict';


angular
    .module('emergency', ['registration.loginController', 'http-auth-interceptor', 'infrastructure.httpErrorInterceptor', 'registration.patient.models', 'registration.emergency'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/create', {templateUrl: 'views/create.html', controller: 'CreateEmergencyPatientController'});
        $routeProvider.otherwise({redirectTo: '/create'});
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });