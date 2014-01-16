'use strict';

angular.module('documentupload', ['ngRoute', 'opd.documentupload', 'bahmni.common.patient','authentication','appFramework', 'bahmni.common.controllers','bahmni.common.infrastructure']);
angular.module('documentupload').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when("/:appContext", { templateUrl: 'modules/document-upload/views/patientSearch.html', controller: 'SearchPatientController'});
    $routeProvider.when('/search', { templateUrl: 'modules/document-upload/views/patientSearch.html', controller: 'SearchPatientController'});
    $routeProvider.when('/documentupload/:patientId', { templateUrl: 'modules/document-upload/views/documentUpload.html', controller: 'SearchPatientController'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("Home","/home");
    }]);
