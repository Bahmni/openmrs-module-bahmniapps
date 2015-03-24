'use strict';


angular.module('adt', ['bahmni.common.patient', 'bahmni.common.patientSearch', 'bahmni.common.uiHelper', 'bahmni.common.conceptSet', 'authentication', 'bahmni.common.appFramework',
    'httpErrorInterceptor', 'bahmni.adt', 'bahmni.common.domain', 'bahmni.common.config', 'ui.router', 'bahmni.common.util', 'bahmni.common.routeErrorHandler',
    'bahmni.common.displaycontrol.dashboard', 'bahmni.common.displaycontrol.observation', 'bahmni.common.displaycontrol.disposition', 'bahmni.common.displaycontrol.admissiondetails',
    'bahmni.common.obs', 'bahmni.common.displaycontrol.patientprofile', 'bahmni.common.displaycontrol.diagnosis','RecursionHelper','ngSanitize']);
angular.module('adt').config(['$stateProvider', '$httpProvider', '$urlRouterProvider', function ($stateProvider, $httpProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/patient/search');
    $stateProvider.state('patientsearch', {
        url: '/patient/search',
        data: {
            backLinks: [{label: "Home", url: "../home/", icon: "icon-home"}]
        },
        views: {
            'content': {
                templateUrl: '../common/patient-search/views/patientsList.html',
                controller: 'PatientsListController'
            },
            'additional-header':{
                templateUrl:'views/headerAdtHome.html'
            }
        },
        resolve: {
            initialization: 'initialization'
        }
    }).state('wardDetails', {
        url: '/wardList',
        data: {
                backLinks: [{label: "<u>P</u>atients", url: "#/patient/search", accessKey: 'p', icon: "icon-circle-arrow-left"}]
        },
        views: {
            'header': {
                templateUrl: 'views/headerAdt.html'
            },
            'content': {
                templateUrl: 'views/wardDetails.html',
                controller: 'WardDetailsController'
            }
        },
        resolve: {
            initialization: 'initialization'
        }
    })
        .state('patient', {
            url: '/patient/:patientUuid',
            data: {
                backLinks: [{label: "<u>P</u>atients", url: "#/patient/search", accessKey: 'p', icon: "icon-circle-arrow-left"}]
            },
            abstract: true,
            views: {
                'header': {
                    templateUrl: 'views/headerAdt.html'
                },
                'content': {
                    template: '<ui-view/>'
                },
                'additional-header': {
                    templateUrl: '../common/patient/header/views/header.html'
                }
            },

            resolve: {
                initResolution: 'initialization',
                patientResolution: function (initResolution, $stateParams, patientInitialization) {
                    return patientInitialization($stateParams.patientUuid);
                }
            }
        })
        .state('patient.adt',{
            url: '/visit/:visitUuid',
            abstract: true,
            template: '<ui-view/>',
            resolve: {
                visitResolution: function (initResolution, $stateParams, patientResolution, visitInitialization) {
                    return visitInitialization($stateParams.visitUuid);
                }
            }

        })
        .state('patient.adt.action', {
            url: '/:action',
            templateUrl: 'views/dashboard.html',
            controller: 'AdtController'
        })
        .state('patient.adt.bedForExistingEncounter', {
            url: '/encounter/:encounterUuid/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        })
        .state('patient.adt.bedForNewEncounter', {
            url: '/bed',
            templateUrl: 'views/bedManagement.html',
            controller: 'BedManagementController'
        });
}
]);