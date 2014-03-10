'use strict';

angular.module('adt', ['bahmni.common.infrastructure', 'bahmni.common.patient', 'bahmni.common.patientSearch',
    'bahmni.common.uiHelper', 'opd.conceptSet', 'authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor', 'opd.adt',
    'bahmni.common.encounter', 'bahmni.common.visit', 'opd.bedManagement', 'ui.router', 'bahmni.common.disposition']);
angular.module('adt').config(['$stateProvider', '$httpProvider', function ($stateProvider, $httpProvider) {
        $stateProvider
            .state('patientsearch', {
                url: '/patient/search',
                templateUrl: '../common/patient-search/views/activePatientsList.html',
                controller : 'ActivePatientsListController',
                resolve: { initialization: 'initialization' }
            })
            .state('dashboard', {
                url: '/dashboard/patient/:patientUuid/visit/:visitUuid/:action',
                templateUrl: 'views/dashboard.html',
                controller: 'AdtController',
                resolve: { 
                    visitInitialization: function($stateParams, visitInitialization){
                        return visitInitialization($stateParams.patientUuid, $stateParams.visitUuid);    
                    } 
                }
            });
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
    }]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("ADT", "/clinical/adt/#/patient/search");
    }]);
