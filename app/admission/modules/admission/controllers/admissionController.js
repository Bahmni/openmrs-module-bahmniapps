'use strict';

angular.module('opd.admission.controllers')
    .controller('AdmissionController', ['$scope', 'admissionService','$route',function ($scope,admissionService,$route) {
            var uuid;
            $scope.patient = {};
            (function () {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = admissionService.getPatient(uuid).success(function (openmrsPatient) {
                    $scope.patient = openmrsPatient;
                });
            })();
    }]);
