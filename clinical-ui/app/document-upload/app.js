'use strict';

angular.module('documentupload', ['ngRoute', 'opd.documentupload', 'bahmni.common.patient', 'authentication', 'appFramework', 'bahmni.common.controllers', 'bahmni.common.infrastructure', 'httpErrorInterceptor', 'bahmni.common.visit', 'bahmni.common.util']);
angular.module('documentupload').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/search', {
            templateUrl: 'modules/document-upload/views/patientSearch.html',
            controller: 'SearchPatientController',
            tiles: {header: "../common/modules/common/header.html"},
            resolve: {initialization: 'initialization', tilesLayout: 'tilesLayout'}
        });
        $routeProvider.when('/patient/:patientUuid/document', {
            templateUrl: 'modules/document-upload/views/documentUpload.html',
            controller: 'DocumentController',
            resolve: {initialization: 'initialization'}
        });
        $routeProvider.otherwise({redirectTo: '/search'});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("Home", "/home");
    }]);
