'use strict';

angular.module('opd.admission.controllers')
    .controller('AdmissionController', ['$scope', 'patientService','$route','patientMapper',function ($scope,patientService,$route,patientMapper) {
            var uuid;
            $scope.patient = {};
            (function () {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = patientService.getPatient(uuid).success(function (openmrsPatient) {
                    $scope.patient = patientMapper.map(openmrsPatient);
                });
            })();
    }]);
