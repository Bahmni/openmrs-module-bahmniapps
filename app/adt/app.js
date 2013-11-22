'use strict';

angular.module('adt', ['opd.consultation.services', 'bahmni.common.infrastructure', 'bahmni.common.patient',
    'opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'opd.adt', 'bahmni.common.encounter',
    'opd.bedManagement']);
angular.module('adt').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/visit/:visitUuid', {templateUrl:'modules/adt/views/adt.html', controller:'AdmissionController', resolve:{initialization:'initialization'}});
    $routeProvider.when('/visit/:visitUuid/bed-management', {templateUrl:'modules/bed-management/views/bedManagement.html', controller:'BedManagementController', resolve:{initialization:'initialization'}});
    $routeProvider.otherwise({redirectTo:Bahmni.ADT.Constants.activePatientsListUrl});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
