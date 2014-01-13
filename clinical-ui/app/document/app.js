'use strict';

angular.module('document', ['ngRoute', 'opd.document',  'bahmni.common.infrastructure', 'bahmni.common.patient','authentication', 'appFramework', 'httpErrorInterceptor', 'bahmni.common.controllers' ]);
angular.module('document').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when('/patient/:patientUuid/document', {templateUrl: 'modules/document/views/documentUpload.html', controller: 'DocumentController', resolve: {initialization: 'initialization'}});
    $routeProvider.otherwise({templateUrl: '../common/modules/common/error.html'});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}])
.run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("patient Q", "/clinical/patients/#/clinical");
}]);