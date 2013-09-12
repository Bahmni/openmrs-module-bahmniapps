'use strict';

angular.module('patients', ['opd.patient', 'bahmni.common.infrastructure', 'bahmni.common.patient'])
angular.module('patients').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/", { templateUrl: 'modules/patient/views/activePatientsList.html', controller: 'ActivePatientsListController', resolve: {initialization: 'initialization'}});
}]);