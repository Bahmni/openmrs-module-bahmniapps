'use strict';


// Declare app level module which depends on filters, and services
angular.module('registration', ['registration.filters', 'registration.services', 'registration.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: SearchPatientController});
    $routeProvider.otherwise({redirectTo: '/search'});
  }]);
