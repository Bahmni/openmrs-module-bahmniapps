'use strict';

angular.module('registration.createPatient', ['resources.patientService', 'resources.preferences', 'resources.patient', 'resources.errorCode', 'resources.date', 'infrastructure.spinner'])
    .controller('CreatePatientController', ['$scope', 'patientService', '$location', 'Preferences', '$route', 'patient', '$window', 'errorCode', 'date', 'spinner',
        function ($scope, patientService, $location, preferences, $route, patientModel, $window, errorCode, date, spinner) {
            (function () {
                $scope.patient = patientModel.create();
                $scope.centers = constants.centers;
                $scope.patient.centerID = $scope.centers.filter(function (center) {
                    return center.name === preferences.centerID
                })[0];
                $scope.hasOldIdentifier = preferences.hasOldIdentifier;
            })();

            var setPreferences = function () {
                preferences.centerID = $scope.patient.centerID.name;
                preferences.hasOldIdentifier = $scope.hasOldIdentifier;
            };

            var successCallback = function(data){
                $scope.patient.uuid = data.uuid;
                $scope.patient.identifier = data.identifier;
                $scope.patient.name = data.name;
                $scope.patient.isNew = true;
                $scope.patient.registrationDate =  date.now();
                patientService.rememberPatient($scope.patient);
                $window.history.pushState(null, null, $location.absUrl().replace("new", data.uuid) + "?newpatient=true");

                $location.path("/visit");
            }

            $scope.create = function () {
                setPreferences();
                var createPatientPromise = patientService.create($scope.patient).success(successCallback).error(function(data){
                    if(errorCode.isOpenERPError(data))
                        successCallback(data.patient);
                });
                spinner.forPromise(createPatientPromise);
            };

            $scope.patientCommon = function() {
                return $route.routes['/patientcommon'].templateUrl;
            };
        }]);
