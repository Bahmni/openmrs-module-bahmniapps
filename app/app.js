'use strict';


angular.module('opd', ['opd.navigation'])
angular.module('opd').config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/patient/:patientUuid/consultation', {templateUrl: 'modules/opd/views/consultation.html', controller: 'NavigationController'});
        $routeProvider.when('/blank', {templateUrl: 'modules/navigation/views/comingSoon.html'});
    }]);