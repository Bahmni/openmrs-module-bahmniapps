'use strict';


angular
    .module('emergency', ['authentication', 'appFramework', 'infrastructure.httpErrorInterceptor', 'registration.patient.models', 'registration.emergency', 'registration.initialization', 'registration.util'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/create', {templateUrl: 'views/create.html', controller: 'CreateEmergencyPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/summary', {templateUrl: 'views/summary.html', controller: 'EmergencyRegistrationSummaryController'});
        $routeProvider.otherwise({redirectTo: '/create'});
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });