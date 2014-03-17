'use strict';

angular.module('bahmni.registration')
    .controller('PrintController', ['$scope', '$routeParams', 'spinner', 'patientService', 'openmrsPatientMapper',
     function ($scope, $routeParams, spinner, patientService, openmrsPatientMapper) {
        var patientUuid = $routeParams.patientUuid;
        $scope.patient = {};
        (function () {
            var getPatientPromise = patientService.get(patientUuid).success(function (openmrsPatient) {
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                $scope.patient.isNew = $routeParams.newpatient;
            });
            spinner.forPromise(getPatientPromise);
        })();
    }]);
