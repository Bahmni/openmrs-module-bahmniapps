'use strict';

angular.module('admission', ['opd.admission', 'opd.infrastructure'])
angular.module('admission').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/:patientUuid", { templateUrl: 'modules/admission/views/admissionForm.html',  controller: 'AdmissionController', resolve: {initialization:'initialization'} });
}]);