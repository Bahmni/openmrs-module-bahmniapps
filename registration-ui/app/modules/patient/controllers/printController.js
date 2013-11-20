'use strict';

angular.module('registration.patient.controllers')
    .controller('PrintController', ['$scope', '$route', '$location', '$window', '$q', 'spinner', 'loader', 'patientService', 'openmrsPatientMapper', function ($scope, $route, $location, $window, $q, spinner, loader, patientService, openmrsPatientMapper) {
        var patientUuid = $route.current.params.patientUuid;
        $scope.patient = {};
        (function () {
            var getPatientPromise = patientService.get(patientUuid).success(function (openmrsPatient) {
                $scope.patient = openmrsPatientMapper.map(openmrsPatient);
                $scope.patient.isNew = ($location.search()).newpatient;
            });
            spinner.forPromise($q.all([getPatientPromise]));
        })();
    }]);
