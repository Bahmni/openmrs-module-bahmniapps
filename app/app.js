'use strict';

angular.module('registration', ['registration.search', 'registration.session', 'http-auth-interceptor', 'registration.createPatient', 'registration.visitController', 'infrastructure', 'infrastructure.httpErrorInterceptor','registration.patientCommon', 'registration.editPatient'])
angular.module('registration').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/search', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/search?q=:query', {templateUrl: 'modules/patient/views/search.html', controller: 'SearchPatientController'});
        $routeProvider.when('/patient/new', {templateUrl: 'modules/patient/views/newpatient.html', controller: 'CreatePatientController'});
        $routeProvider.when('/printPatient', {templateUrl: 'modules/patient/views/print.html'});
        $routeProvider.when('/patient/:patientUuid', {templateUrl: 'modules/patient/views/editpatient.html', controller: 'EditPatientController'});
        $routeProvider.when('/visit/new', {templateUrl: 'modules/patient/views/visit.html', controller: 'VisitController'});
        $routeProvider.when('/login', {templateUrl: 'modules/auth/views/login.html', controller: 'SessionController'});
        $routeProvider.when('/patientcommon', {templateUrl: 'modules/patient/views/patientcommon.html'});
        $routeProvider.otherwise({redirectTo: '/login'});
    }]).run(['$rootScope', '$http', 'configurationService', function($rootScope, $http, configurationService){
        $rootScope.BaseUrl='/openmrs';        
        $http.defaults.headers.common['Disable-WWW-Authenticate'] = true;
        configurationService.getAll().success(function(data){
            $rootScope.bahmniConfiguration = data;
        });
    }]);
