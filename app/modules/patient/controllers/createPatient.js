'use strict';

angular.module('registration.createPatient', ['resources.patientService', 'resources.preferences'])
    .controller('CreatePatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route',
        function ($scope, patientService, $location, preferences, $route) {

            (function () {
                $scope.patient = patientService.getPatient();
                $scope.centers = [
                    {name: 'GAN'},
                    {name: 'SEM'},
                    {name: 'SHI'},
                    {name: 'BAH'}
                ];
                $scope.patient.centerID = $scope.centers.filter(function (center) {
                    return center.name === preferences.centerID
                })[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            })();

            var setPreferences = function () {
                preferences.centerID = $scope.patient.centerID.name;
                preferences.hasOldIdentifier = $scope.hasOldIdentifier;
            };

            $scope.create = function () {
                setPreferences();
                patientService.create($scope.patient).success(function (data) {
                    $scope.patient.identifier = data.identifier;
                    $scope.patient.uuid = data.uuid;
                    $scope.patient.name = data.name;
                    patientService.rememberPatient($scope.patient);
                    $location.path("/visitinformation");
                });
            };

            $scope.newPatient = function() {
                return $route.routes['/patientcommon'].templateUrl;
            }
        }]);
