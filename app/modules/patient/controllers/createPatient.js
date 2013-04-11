'use strict';

angular.module('registration.createPatient', ['resources.patientService', 'resources.preferences', 'resources.patient'])
    .controller('CreatePatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route', 'patient', '$window',
        function ($scope, patientService, $location, preferences, $route, patientModel, $window) {
            (function () {
                $scope.patient = patientModel.create();
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
                    var patient = {
                        identifier: data.identifier,
                        uuid: data.uuid,
                        name: data.name,
                        isNew: true
                    }
                    patientService.rememberPatient(patient);
                    $window.history.pushState(null, null, $location.absUrl().replace("new", data.uuid) + "?newpatient=true");

                    $location.path("/visit/new");
                });
            };

            $scope.patientCommon = function() {
                return $route.routes['/patientcommon'].templateUrl;
            };
        }]);
