'use strict';

angular.module('registration.editPatient', ['resources.patientService', 'resources.preferences'])
    .controller('EditPatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route',
        function ($scope, patientService, $location, preferences, $route) {
            $scope.patient = {};
            $scope.patient.patientIdentifier = $route.current.params.patientUuid;

            $scope.patientCommon = function() {
                return $route.routes['/patientcommon'].templateUrl;
            }
        }]);
