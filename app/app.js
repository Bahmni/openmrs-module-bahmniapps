'use strict';

angular.module('registration', ['registration.search', 'registration.session', 'http-auth-interceptor', 'registration.createPatient', 'registration.visitController', 'infrastructure.httpErrorInterceptor', 'registration.patientCommon'])
angular.module('registration').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/search?q=:query', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/patient/new', {templateUrl: 'modules/patient/views/newpatient.html', controller: 'CreatePatientController'});
        $routeProvider.when('/visitinformation', {templateUrl: 'modules/patient/views/visitinformation.html', controller: 'VisitController'});
        $routeProvider.when('/login', {templateUrl: 'modules/auth/views/login.html', controller: 'SessionController'});
        $routeProvider.when('/patientcommon', {templateUrl: 'modules/patient/views/patientcommon.html'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]).run(function($rootScope, $http){
        $rootScope.BaseUrl='/openmrs';
        $http.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    });
