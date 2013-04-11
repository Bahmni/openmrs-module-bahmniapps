'use strict';

angular.module('registration.editPatient', ['resources.patientService', 'resources.preferences', 'resources.openmrsPatientMapper'])
    .controller('EditPatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window',
        function ($scope, patientService, $location, preferences, $route, patientMapper, $window) {
            $scope.patient = {};
            (function() {
                patientService.get($route.current.params.patientUuid).success(function(openmrsPatient){
                    $scope.patient = patientMapper.map(openmrsPatient);
                });

            })();

            $scope.patientCommon = function() {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.edit = function () {
                patientService.create($scope.patient).success(function (data) {
                    $scope.patient.identifier = data.identifier;
                    $scope.patient.uuid = data.uuid;
                    $scope.patient.name = data.name;
                    patientService.rememberPatient($scope.patient);
                    $location.path("/visit/new");
                });
            };

            $scope.back = function() {
                $window.history.back();
            }

        }]);
