'use strict';

angular.module('documentupload', ['ui.router', 'opd.documentupload', 'bahmni.common.patient', 'authentication', 'bahmni.common.appFramework',
 'bahmni.common.infrastructure', 'httpErrorInterceptor', 'bahmni.common.visit', 'bahmni.common.uiHelper']);
angular.module('documentupload').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/search');
        $stateProvider
            .state('search', {
                url: '/search',
                templateUrl: 'views/patientSearch.html',
                controller: 'SearchPatientController',
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('upload', {
                url: '/patient/:patientUuid/document',
                templateUrl: 'views/documentUpload.html',
                controller: 'DocumentController',
                resolve: {
                    initialization: 'initialization'
                }
            });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addBackUrl();
    }]);
