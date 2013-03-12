'use strict';

angular.module('registration', ['registration.search', 'registration.session', 'http-auth-interceptor', 'registration.createPatient', 'registration.createVisit'])
angular.module('registration').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {templateUrl: 'partials/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/create', {templateUrl: 'partials/create.html', controller: 'CreateNewPatientController'});
        $routeProvider.when('/visitinformation', {templateUrl: 'partials/visitinformation.html', controller: 'CreateVisitController'});
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'SessionController'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]).run(function($rootScope, $http){
        $rootScope.BaseUrl='/openmrs';
        $http.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    });
