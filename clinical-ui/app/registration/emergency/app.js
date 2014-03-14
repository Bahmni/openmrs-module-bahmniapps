'use strict';


angular
    .module('emergency', ['authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.registration.emergency'])
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