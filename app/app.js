'use strict';

angular.module('registration', ['registration.search', 'registration.session', 'http-auth-interceptor', 'registration.createPatient', 'registration.visitController', 'infrastructure.httpErrorInterceptor'])
angular.module('registration').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/create', {templateUrl: 'modules/patient/views/create.html', controller: 'CreateNewPatientController'});
        $routeProvider.when('/visitinformation', {templateUrl: 'modules/patient/views/visitinformation.html', controller: 'VisitController'});
        $routeProvider.when('/login', {templateUrl: 'modules/auth/views/login.html', controller: 'SessionController'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]).run(function($rootScope, $http){
        $rootScope.BaseUrl='/openmrs';
        $http.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    });
