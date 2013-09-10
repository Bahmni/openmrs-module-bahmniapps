'use strict';

angular.module('opd.admission.controllers')
    .controller('AdmissionController', ['$scope', 'admissionService','$route','patientMapper',function ($scope,admissionService,$route,patientMapper) {
            var uuid;
            $scope.patient = {};
            (function () {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = admissionService.getPatient(uuid).success(function (openmrsPatient) {
                    $scope.patient = patientMapper.map(openmrsPatient);
                });
            })();
    }]);
