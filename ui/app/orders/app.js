'use strict';

angular.module('orders', ['ngRoute', 'orders.pending', 'bahmni.common.domain','authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor','bahmni.common.patient', 'bahmni.common.uiHelper']);
angular.module('orders').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/patient/:patientUuid/:orderType', {templateUrl: 'views/pendingOrders.html', controller: 'PendingOrdersController',resolve: {initialization: 'initialization'}});
        $routeProvider.otherwise({redirectTo: "../patients"});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(['backlinkService', function (backlinkService) {
        backlinkService.addUrl("Patient Search", "/clinical/#/patient/search");
    }]);

