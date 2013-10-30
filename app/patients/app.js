'use strict';

angular.module('patients', ['opd.patient', 'bahmni.common.infrastructure', 'bahmni.common.patient','authentication']);
angular.module('patients').config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
    $routeProvider.when("/", { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController', resolve: {initialization: 'initialization'}});
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]);