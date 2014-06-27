'use strict';

angular.module('documentupload', ['ui.router', 'opd.documentupload', 'bahmni.common.patient', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.uiHelper', 'bahmni.common.patientSearch']);
angular.module('documentupload').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/search');
        $stateProvider.state('search', {
                url:'/search',
                data: {
                    backLinks: [{label: "Home", url: "../home"}]
                },
                views: {
                    'content': {
                        templateUrl: '../common/patient-search/views/patientsList.html',
                        controller: 'PatientsListController'
                    }
                },
                resolve: {
                    initialization: 'initialization'
                }
            })
            .state('upload', {
                url: '/patient/:patientUuid/document',
                data: {
                    backLinks: [{label: "Patient Q", url: "#/search"}]
                },
                views: {
                    'content': {
                        templateUrl: 'views/documentUpload.html',
                        controller: 'DocumentController'
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
                views: {
                    'content': {
                        templateUrl: '../common/ui-helper/error.html'
                    }
                }
            });

        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        FastClick.attach(document.body);

        backlinkService.addBackUrl();
    }]);
