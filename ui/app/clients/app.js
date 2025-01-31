angular.module('bahmni.clients', ['ngRoute', 'ngResource'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/clients', {
                templateUrl: 'clientsList.html',
                controller: 'ClientListController'
            })
            .otherwise({
                redirectTo: '/clients'
            });
    }]);
