'use strict';


angular.module('opd', [])
angular.module('opd').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/consultation', {templateUrl: 'modules/opd/views/consultation.html', controller: 'SearchPatientController'});
    }]);