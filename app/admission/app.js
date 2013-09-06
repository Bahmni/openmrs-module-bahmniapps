'use strict';

angular.module('admission', ['opd.admission'])
angular.module('admission').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/:patientId", { templateUrl: 'modules/admission/views/admissionForm.html',  controller: 'AdmissionController'});
}]);