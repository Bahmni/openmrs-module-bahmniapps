'use strict';

angular.module('adt', ['ngRoute', 'opd.consultation.services', 'bahmni.common.infrastructure', 'bahmni.common.patient',
    'bahmni.common.util','opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'opd.adt',
    'bahmni.common.encounter', 'bahmni.common.visit', 'opd.bedManagement.services', 'bahmni.common.controllers']);
angular.module('adt').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/dashboard/patient/:patientUuid/visit/:visitUuid/:action',
        {
            templateUrl: 'views/dashboard.html',
            controller: 'AdtController',
            resolve: {initialization: 'initialization'}
        });
    $routeProvider.otherwise({templateUrl: '../common/common/error.html'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("ADT", "/clinical/patients/#/adt");
    }]);
