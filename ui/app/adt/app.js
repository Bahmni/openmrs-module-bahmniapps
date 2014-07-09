'use strict';

angular.module('adt', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor', 'bahmni.adt', 'bahmni.common.domain', 'ui.router']);
angular.module('adt').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function($stateProvider, $httpProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/patient/search');
        $stateProvider.state('patientsearch', {
            url: '/patient/search',
            data: {
                backLinks: [{label: "Home", url: "../home/"}]
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
        .state('patient', {
            url: '/patient/:patientUuid',
            data: {
                backLinks: [{label: "Patient Q", url: "#/patient/search"}]
            },
            abstract: true,
            views: {
                'content': {
                    template: '<ui-view/>'
                },
                'additional-header': {
                    templateUrl: '../common/patient/header/views/header.html'
                }
            },

            resolve: {
                patientInitialization: function($stateParams, patientInitialization) {
                    return patientInitialization($stateParams.patientUuid);
                }
            }
        })
        .state('patient.adt', {
            url: '/visit/:visitUuid/:action',
            templateUrl: 'views/dashboard.html',
            controller: 'AdtController',
            resolve: {
                visitInitialization: function($stateParams, visitInitialization) {
                    return visitInitialization($stateParams.visitUuid);
                }
            }
        })
        .state('patient.bedForExistingEncounter', {
            url: '/encounter/:encounterUuid/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        })
        .state('patient.bedForNewEncounter', {
            url: '/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        });
    }
]);