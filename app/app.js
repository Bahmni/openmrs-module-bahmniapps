'use strict';


angular.module('opd', ['opd.navigation'])
angular.module('opd').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/consultation', {templateUrl: 'modules/opd/views/consultation.html'});
        $routeProvider.when('/blank', {templateUrl: 'modules/navigation/views/comingSoon.html'});
    }]);