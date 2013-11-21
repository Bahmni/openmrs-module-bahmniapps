'use strict';

angular.module('adt', ['opd.consultation.services', 'bahmni.common.infrastructure', 'bahmni.common.patient', 'opd.conceptSet', 'authentication', 'appFramework', 'httpErrorInterceptor', 'opd.adt']);
angular.module('adt').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/visit/:visitUuid', {templateUrl: 'modules/adt/views/adt.html', controller: 'AdtController',resolve: {initialization: 'initialization'}});
        $routeProvider.otherwise({redirectTo: Bahmni.Common.Constants.homeUrl});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
