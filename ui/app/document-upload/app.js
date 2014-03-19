'use strict';

angular.module('documentupload', ['ui.router', 'opd.documentupload', 'bahmni.common.patient', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.uiHelper']);
angular.module('documentupload').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/search');
        $stateProvider
            .state('search', {
                url: '/search',
                views: {
                    'content': {
                        templateUrl: 'views/patientSearch.html',
                        controller: 'SearchPatientController'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('upload', {
                url: '/patient/:patientUuid/document',
                views: {
                    'content': {
                        templateUrl: 'views/documentUpload.html',
                        controller: 'DocumentController',
                    },
                    'additional-header': { 
                        templateUrl: '../common/patient/header/views/header.html' 
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('error', {
                url: '/error',
                templateUrl: '../../common/ui-helper/error.html',
            });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addBackUrl();
    }]);
