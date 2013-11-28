'use strict';

angular.module('orders', ['orders.pending', 'bahmni.common.infrastructure','authentication', 'appFramework', 'httpErrorInterceptor','bahmni.common.patient']);
angular.module('orders').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/patient/:patientUuid/:orderTypeUuid', {templateUrl: 'modules/pending-orders/views/pendingOrders.html', controller: 'PendingOrdersController',resolve: {initialization: 'initialization'}});
        $routeProvider.otherwise({redirectTo: "../patients"});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);
