'use strict';


angular
    .module('registration', ['registration.patient.controllers', 'registration.navigation', 'registration.loginController', 'http-auth-interceptor', 'registration.patient.controllers',
        'registration.patient.controllers', 'infrastructure.httpErrorInterceptor', 'registration.patient.controllers', 'registration.patient.controllers', 'registration.initialization', 'registration.util'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/login', {templateUrl: 'modules/auth/views/login.html', controller: 'LoginController'});
        $routeProvider.when('/search', {reloadOnSearch: false, templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/new', {templateUrl: 'modules/patient/views/newpatient.html', controller: 'CreatePatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid', {templateUrl: 'modules/patient/views/editpatient.html', controller: 'EditPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/visit', {templateUrl: 'modules/patient/views/visit.html', controller: 'VisitController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/printPatient', {templateUrl: 'modules/patient/views/print.html'});
        $routeProvider.when('/patientcommon', {templateUrl: 'modules/patient/views/patientcommon.html'});
        $routeProvider.otherwise({redirectTo: '/login'});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
    });