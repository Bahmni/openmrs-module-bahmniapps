'use strict';

angular.module('adt', ['opd.consultation.services', 'bahmni.common.infrastructure', 'bahmni.common.patient',
    'opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'opd.adt',
    'bahmni.common.encounter', 'bahmni.common.visit', 'opd.bedManagement.services', 'bahmni.common.controllers']);
angular.module('adt').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/visit/:visitUuid', {templateUrl:'modules/adt/views/adt.html', controller:'AdmissionController', resolve:{initialization:'initialization'}});
    $routeProvider.when('/discharge/visit/:visitUuid', {templateUrl:'modules/adt/views/discharge.html', controller:'DischargeController', resolve:{initialization:'initialization'}});
    $routeProvider.otherwise({templateUrl:'../common/modules/common/error.html'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
