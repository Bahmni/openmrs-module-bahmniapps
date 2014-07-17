'use strict';

angular.module('orders', ['ui.router', 'bahmni.orders', 'bahmni.common.domain','authentication', 'bahmni.common.appFramework', 'httpErrorInterceptor','bahmni.common.patient', 'bahmni.common.uiHelper']);
angular.module('orders').config(['$stateProvider', '$httpProvider', function ($stateProvider, $httpProvider) {
        $stateProvider.state('order', {
    		url: '/patient/:patientUuid/:orderType',
    		templateUrl: 'views/pendingOrders.html',
    		controller: 'PendingOrdersController',
    		resolve: {
    			initialization: function(initialization, $stateParams){
			        return initialization($stateParams.appContext, $stateParams.patientUuid);
    			}
    		}
       	});
        $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(['backlinkService', function (backlinkService) {
    backlinkService.addUrl({label: "Patient Search", url: "../clinical/#/patient/search"});
}]);

