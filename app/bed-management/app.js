'use strict';

angular.module('bedManagement', ['authentication', 'appFramework', 'bahmni.common.infrastructure', 'httpErrorInterceptor',
    'opd.bedManagement', 'bahmni.common.patient', 'bahmni.common.encounter', 'opd.conceptSet'])
    .config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/patient/:patientUuid/encounter/:encounterUuid', {templateUrl:'modules/bed-management/views/bedManagement.html', controller:'BedManagementController', resolve:{initialization:'initialization'}});
    $routeProvider.when('/patient/:patientUuid', {templateUrl:'modules/bed-management/views/bedManagement.html', controller:'BedManagementController', resolve:{initialization:'initialization'}});
    $routeProvider.otherwise({templateUrl:'../common/modules/common/error.html'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
