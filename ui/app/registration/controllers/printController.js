'use strict';

angular.module('bahmni.registration')
    .controller('PrintController', ['$scope', '$stateParams', 'spinner', 'patientService', 'openmrsPatientMapper',
     function ($scope, $stateParams, spinner, patientService, openmrsPatientMapper) {
        var patientUuid = $stateParams.patientUuid;
        $scope.patient = {};
        (function () {
            var getPatientPromise = patientService.get(patientUuid).success(function (openmrsPatient) {
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                $scope.patient.isNew = $stateParams.newpatient;
            });
            spinner.forPromise(getPatientPromise);
        })();
    }]);
