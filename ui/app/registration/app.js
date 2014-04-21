'use strict';


angular
    .module('registration', ['ngRoute', 'bahmni.registration', 'authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.common.photoCapture'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/search', {reloadOnSearch: false, templateUrl: 'views/search.html', controller: 'SearchPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/new', {templateUrl: 'views/newpatient.html', controller: 'CreatePatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid', {templateUrl: 'views/editpatient.html', controller: 'EditPatientController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:patientUuid/visit', {templateUrl: 'views/visit.html', controller: 'VisitController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patientcommon', {templateUrl: 'views/patientcommon.html'});
        $routeProvider.when('/patient/:patientUuid/print', {templateUrl: 'views/print.html', controller: 'PrintController', resolve: {initialization: 'initialization'}});
        $routeProvider.when('/patient/:uuid/printSticker', {templateUrl: 'views/notimplemented.html'});
        $routeProvider.otherwise({redirectTo: '/search'});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            }
        )
        // $rootScope.$on( "$routeChangeStart", function(event, next, current) {
        //     console.log(next);
        //     //hook in change logic      
        // });
    });