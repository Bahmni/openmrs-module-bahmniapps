'use strict';


// Declare app level module which depends on filters, and services

angular.module('registration', ['registration.search'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchPatientController'});
        $routeProvider.otherwise({redirectTo: '/search'});
    }]).run(function($rootScope){
        $rootScope.BaseUrl='http://localhost:8080'
    });
