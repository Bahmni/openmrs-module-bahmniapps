'use strict';

angular.module('registration.editPatient', ['resources.patientService', 'resources.preferences', 'resources.openmrsPatientMapper', 'infrastructure.spinner', 'infrastructure.printer'])
    .controller('EditPatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route', 'openmrsPatientMapper', '$window',  'spinner', 'printer',
        function ($scope, patientService, $location, preferences, $route, patientMapper, $window, spinner, printer) {
            var uuid;
            $scope.patient = {};
            (function() {
                uuid = $route.current.params.patientUuid;
                var getPatientPromise = patientService.get($route.current.params.patientUuid).success(function (openmrsPatient) {
                    $scope.patient = patientMapper.map(openmrsPatient);
                    $scope.patient.isNew = ($location.search()).newpatient;
                });
                spinner.forPromise(getPatientPromise);

            })();

            $scope.patientCommon = function() {
                return $route.routes['/patientcommon'].templateUrl;
            };

            $scope.update = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (data) {
                    $scope.patient.uuid = data.uuid;
                    $scope.patient.name = data.name;
                    patientService.rememberPatient($scope.patient);
                    $location.path("/visit/new");
                });
                spinner.forPromise(patientUpdatePromise);
            };

            $scope.showBackButton = function() {
                return !$location.search().newpatient;
            };

            $scope.back = function() {
                $window.history.back();
            };

            $scope.printLayout = function() {
                return $route.routes['/printPatient'].templateUrl;
            };

            $scope.saveAndPrint = function () {
                var patientUpdatePromise = patientService.update($scope.patient, uuid).success(function (data) {
                    printer.print('registrationCard');
                });
                spinner.forPromise(patientUpdatePromise);
            };
        }]);
