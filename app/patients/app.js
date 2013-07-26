'use strict';

angular.module('patients', ['opd.patient', 'opd.infrastructure'])
angular.module('patients').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/", { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController', resolve: {initialization: 'initialization'}});
}]);