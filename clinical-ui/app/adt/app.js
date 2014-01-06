'use strict';

angular.module('adt', ['ngRoute', 'opd.consultation.services', 'bahmni.common.infrastructure', 'bahmni.common.patient',
    'opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'opd.adt',
    'bahmni.common.encounter', 'bahmni.common.visit', 'opd.bedManagement.services', 'bahmni.common.controllers']);
angular.module('adt').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/dashboard/visit/:visitUuid', {templateUrl: 'modules/adt/views/dashboard.html', controller: 'AdtController', resolve: {initialization: 'initialization'}});
    $routeProvider.otherwise({templateUrl: '../common/modules/common/error.html'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("ADT", "/clinical/patients/#/adt");
    }]);
