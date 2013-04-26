'use strict';


angular.module('registration', ['registration.search', 'registration.navigation', 'registration.loginController', 'http-auth-interceptor', 'registration.createPatient',
                                'registration.visitController', 'infrastructure.httpErrorInterceptor','registration.patientCommon', 'registration.editPatient',
                                'registration.initialization'])
angular.module('registration').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/search', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/search?q=:query', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/patient/new', {templateUrl: 'modules/patient/views/newpatient.html', controller: 'CreatePatientController'});
        $routeProvider.when('/printPatient', {templateUrl: 'modules/patient/views/print.html'});
        $routeProvider.when('/patient/:patientUuid', {templateUrl: 'modules/patient/views/editpatient.html', controller: 'EditPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit/new', {templateUrl: 'modules/patient/views/visit.html', controller: 'VisitController'});
        $routeProvider.when('/login', {templateUrl: 'modules/auth/views/login.html', controller: 'LoginController'});
        $routeProvider.when('/patientcommon', {templateUrl: 'modules/patient/views/patientcommon.html'});
        $routeProvider.otherwise({redirectTo: '/login'});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]);