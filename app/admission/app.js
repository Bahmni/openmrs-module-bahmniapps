'use strict';

angular.module('admission', [])
angular.module('admission').config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when("/:patientId", { templateUrl: 'modules/admission/views/admissionForm.html'});
}]);